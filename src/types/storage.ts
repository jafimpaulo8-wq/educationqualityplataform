export type StorageCategory = 
  | 'fotos'
  | 'documentos'
  | 'comprovativos'
  | 'certificados'
  | 'materiais'
  | 'contratos'
  | 'assinaturas'
  | 'modelos';

export interface StorageFileMeta {
  id: string;
  institutionId: string;
  category: StorageCategory;
  entityId?: string; // studentId, documentId, certificateId, etc.
  fileName: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  storagePath: string; // e.g. /institutions/{institutionId}/students/{studentId}/foto.jpg
  downloadUrl: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: string;
  checksum?: string;
  isArchived?: boolean;
  archivedAt?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface StorageUploadOptions {
  institutionId: string;
  category: StorageCategory;
  entityId?: string;
  fileName: string;
  file: File | Blob;
  contentType?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  customMetadata?: Record<string, any>;
}

export interface StorageListFilters {
  category?: StorageCategory;
  entityId?: string;
  searchQuery?: string;
  includeArchived?: boolean;
}
