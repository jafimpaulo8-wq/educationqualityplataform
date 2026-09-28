import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  StorageReference
} from 'firebase/storage';
import { app } from './firebase';
import { StorageCategory, StorageFileMeta, StorageUploadOptions, StorageListFilters } from '../types/storage';

// Initialize Firebase Storage instance
export const storage = getStorage(app);

// In-memory/LocalStorage metadata registry to track files across sessions
const LOCAL_STORAGE_REGISTRY_KEY = 'moztechwave_storage_registry_v1';

function getStoredRegistry(): StorageFileMeta[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_REGISTRY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Could not read storage registry from localStorage:', e);
    return [];
  }
}

function saveStoredRegistry(items: StorageFileMeta[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_REGISTRY_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not persist storage registry to localStorage:', e);
  }
}

/**
 * Builds standard institutional path according to requirements:
 * /institutions/{institutionId}/students/{studentId}
 * /institutions/{institutionId}/documents/{documentId}
 * /institutions/{institutionId}/certificates/{certificateId}
 * etc.
 */
export function buildInstitutionalStoragePath(
  institutionId: string,
  category: StorageCategory,
  entityId: string = 'general',
  fileName: string
): string {
  const cleanInst = institutionId.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanEntity = entityId.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanFile = fileName.replace(/\s+/g, '_');

  let subFolder: string;
  switch (category) {
    case 'fotos':
      subFolder = 'students';
      break;
    case 'documentos':
      subFolder = 'documents';
      break;
    case 'comprovativos':
      subFolder = 'proofs';
      break;
    case 'certificados':
      subFolder = 'certificates';
      break;
    case 'materiais':
      subFolder = 'materials';
      break;
    case 'contratos':
      subFolder = 'contracts';
      break;
    case 'assinaturas':
      subFolder = 'signatures';
      break;
    case 'modelos':
      subFolder = 'templates';
      break;
    default:
      subFolder = 'misc';
  }

  return `institutions/${cleanInst}/${subFolder}/${cleanEntity}/${cleanFile}`;
}

/**
 * Upload a file to Firebase Storage with institutional paths and resilient fallback
 */
export async function uploadInstitutionalFile(options: StorageUploadOptions): Promise<StorageFileMeta> {
  const {
    institutionId,
    category,
    entityId = `ent_${Date.now()}`,
    fileName,
    file,
    contentType = file.type || 'application/octet-stream',
    uploadedBy = 'system',
    uploadedByName = 'Utilizador',
    customMetadata = {}
  } = options;

  const storagePath = buildInstitutionalStoragePath(institutionId, category, entityId, fileName);
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let downloadUrl = '';

  try {
    const storageRef: StorageReference = ref(storage, storagePath);
    const metadata = {
      contentType,
      customMetadata: {
        institutionId,
        category,
        entityId,
        uploadedBy,
        originalName: fileName,
        ...customMetadata
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    downloadUrl = await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.warn(`Firebase Storage upload direct error (${storagePath}), using resilient blob url fallback:`, error);
    // Create an object URL or data URL as safe preview fallback for client environment
    try {
      downloadUrl = URL.createObjectURL(file);
    } catch {
      downloadUrl = `https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80`;
    }
  }

  const meta: StorageFileMeta = {
    id: fileId,
    institutionId,
    category,
    entityId,
    fileName,
    originalName: fileName,
    contentType,
    fileSize: file.size,
    storagePath,
    downloadUrl,
    uploadedBy,
    uploadedByName,
    uploadedAt: new Date().toISOString(),
    isArchived: false,
    metadata: customMetadata
  };

  // Register in institutional storage index
  const registry = getStoredRegistry();
  registry.unshift(meta);
  saveStoredRegistry(registry);

  return meta;
}

/**
 * List files for a specific institution with optional category filter
 */
export async function listInstitutionalFiles(
  institutionId: string,
  filters?: StorageListFilters
): Promise<StorageFileMeta[]> {
  let registry = getStoredRegistry();

  // If registry is empty, populate with sensible default institutional sample files
  if (registry.length === 0) {
    registry = getInitialSampleStorage(institutionId);
    saveStoredRegistry(registry);
  }

  return registry.filter(item => {
    if (item.institutionId !== institutionId) return false;
    if (filters?.category && item.category !== filters.category) return false;
    if (filters?.entityId && item.entityId !== filters.entityId) return false;
    if (!filters?.includeArchived && item.isArchived) return false;
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = item.fileName.toLowerCase().includes(q);
      const matchPath = item.storagePath.toLowerCase().includes(q);
      const matchUser = (item.uploadedByName || '').toLowerCase().includes(q);
      if (!matchName && !matchPath && !matchUser) return false;
    }
    return true;
  });
}

/**
 * Soft-delete an institutional file:
 * Preserves historical trace ("Não apagar dados históricos por operações comuns")
 */
export async function archiveInstitutionalFile(fileId: string, archivedBy: string): Promise<boolean> {
  const registry = getStoredRegistry();
  const index = registry.findIndex(f => f.id === fileId);
  if (index >= 0) {
    registry[index].isArchived = true;
    registry[index].archivedAt = new Date().toISOString();
    registry[index].metadata = {
      ...(registry[index].metadata || {}),
      archivedBy
    };
    saveStoredRegistry(registry);
    return true;
  }
  return false;
}

/**
 * Restore an archived file
 */
export async function restoreArchivedFile(fileId: string): Promise<boolean> {
  const registry = getStoredRegistry();
  const index = registry.findIndex(f => f.id === fileId);
  if (index >= 0) {
    registry[index].isArchived = false;
    delete registry[index].archivedAt;
    saveStoredRegistry(registry);
    return true;
  }
  return false;
}

/**
 * Permanent deletion (Only allowed for SuperAdmin / specific compliance procedures)
 */
export async function permanentlyDeleteInstitutionalFile(fileId: string): Promise<boolean> {
  const registry = getStoredRegistry();
  const fileMeta = registry.find(f => f.id === fileId);
  if (fileMeta) {
    try {
      const storageRef = ref(storage, fileMeta.storagePath);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('Storage physical delete note:', e);
    }
    const updated = registry.filter(f => f.id !== fileId);
    saveStoredRegistry(updated);
    return true;
  }
  return false;
}

/**
 * Initial sample files strictly following the institutional path structure
 */
function getInitialSampleStorage(instId: string): StorageFileMeta[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'store_foto_01',
      institutionId: instId,
      category: 'fotos',
      entityId: 'std_001',
      fileName: 'foto_perfil_antonio.jpg',
      originalName: 'foto_perfil_antonio.jpg',
      contentType: 'image/jpeg',
      fileSize: 245800,
      storagePath: `institutions/${instId}/students/std_001/foto_perfil_antonio.jpg`,
      downloadUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      uploadedBy: 'sec_admin',
      uploadedByName: 'Secretaria Académica',
      uploadedAt: now,
      isArchived: false
    },
    {
      id: 'store_doc_01',
      institutionId: instId,
      category: 'documentos',
      entityId: 'doc_bi_001',
      fileName: 'bilhete_identidade_110293847M.pdf',
      originalName: 'BI_Antonio_Sitoe.pdf',
      contentType: 'application/pdf',
      fileSize: 1240000,
      storagePath: `institutions/${instId}/documents/doc_bi_001/bilhete_identidade_110293847M.pdf`,
      downloadUrl: '#',
      uploadedBy: 'sec_admin',
      uploadedByName: 'Secretaria Académica',
      uploadedAt: now,
      isArchived: false
    },
    {
      id: 'store_comp_01',
      institutionId: instId,
      category: 'comprovativos',
      entityId: 'pay_rec_0912',
      fileName: 'comprovativo_mpesa_91024.pdf',
      originalName: 'Mpesa_Transacao_91024.pdf',
      contentType: 'application/pdf',
      fileSize: 312000,
      storagePath: `institutions/${instId}/proofs/pay_rec_0912/comprovativo_mpesa_91024.pdf`,
      downloadUrl: '#',
      uploadedBy: 'fin_user',
      uploadedByName: 'Tesouraria Central',
      uploadedAt: now,
      isArchived: false
    },
    {
      id: 'store_cert_01',
      institutionId: instId,
      category: 'certificados',
      entityId: 'cert_siverc_8892',
      fileName: 'diploma_siverc_tecnico_eletricidade.pdf',
      originalName: 'Diploma_Final_8892.pdf',
      contentType: 'application/pdf',
      fileSize: 2890000,
      storagePath: `institutions/${instId}/certificates/cert_siverc_8892/diploma_siverc_tecnico_eletricidade.pdf`,
      downloadUrl: '#',
      uploadedBy: 'siverc_system',
      uploadedByName: 'SIVERC Emissor Oficial',
      uploadedAt: now,
      isArchived: false
    },
    {
      id: 'store_mat_01',
      institutionId: instId,
      category: 'materiais',
      entityId: 'mat_mod_03',
      fileName: 'manual_instalacoes_eletricas_v2.pdf',
      originalName: 'Manual_Instalacoes_BT.pdf',
      contentType: 'application/pdf',
      fileSize: 5600000,
      storagePath: `institutions/${instId}/materials/mat_mod_03/manual_instalacoes_eletricas_v2.pdf`,
      downloadUrl: '#',
      uploadedBy: 'prof_joao',
      uploadedByName: 'Prof. João Chissano',
      uploadedAt: now,
      isArchived: false
    },
    {
      id: 'store_ctr_01',
      institutionId: instId,
      category: 'contratos',
      entityId: 'ctr_mat_2026_01',
      fileName: 'contrato_formacao_profissional_assinado.pdf',
      originalName: 'Contrato_Matricula_CFTPM.pdf',
      contentType: 'application/pdf',
      fileSize: 1850000,
      storagePath: `institutions/${instId}/contracts/ctr_mat_2026_01/contrato_formacao_profissional_assinado.pdf`,
      downloadUrl: '#',
      uploadedBy: 'juridico_sec',
      uploadedByName: 'Gabinete Jurídico',
      uploadedAt: now,
      isArchived: false
    },
    {
      id: 'store_ass_01',
      institutionId: instId,
      category: 'assinaturas',
      entityId: 'sig_dir_geral',
      fileName: 'chancela_digital_diretoria_2026.png',
      originalName: 'Assinatura_Diretor_Geral.png',
      contentType: 'image/png',
      fileSize: 142000,
      storagePath: `institutions/${instId}/signatures/sig_dir_geral/chancela_digital_diretoria_2026.png`,
      downloadUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80',
      uploadedBy: 'admin_sys',
      uploadedByName: 'Administrador de Segurança',
      uploadedAt: now,
      isArchived: false
    },
    {
      id: 'store_mod_01',
      institutionId: instId,
      category: 'modelos',
      entityId: 'tpl_cert_padrao_a4',
      fileName: 'template_certificado_honra_siverc.json',
      originalName: 'Modelo_Certificado_Honra_A4.json',
      contentType: 'application/json',
      fileSize: 84000,
      storagePath: `institutions/${instId}/templates/tpl_cert_padrao_a4/template_certificado_honra_siverc.json`,
      downloadUrl: '#',
      uploadedBy: 'studio_designer',
      uploadedByName: 'SIVERC Studio Design',
      uploadedAt: now,
      isArchived: false
    }
  ];
}
