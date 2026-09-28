import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  FolderTree, 
  UploadCloud, 
  Search, 
  Filter, 
  FileText, 
  Image as ImageIcon, 
  Award, 
  FileCheck, 
  BookOpen, 
  Shield, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Info, 
  Lock, 
  Archive, 
  RotateCcw,
  Sparkles,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StorageCategory, StorageFileMeta } from '../../types/storage';
import { 
  listInstitutionalFiles, 
  uploadInstitutionalFile, 
  archiveInstitutionalFile, 
  restoreArchivedFile,
  buildInstitutionalStoragePath 
} from '../../services/storageService';

const CATEGORIES: { id: StorageCategory; label: string; icon: React.ReactNode; color: string; subPath: string }[] = [
  { id: 'fotos', label: 'Fotos', icon: <ImageIcon className="w-4 h-4 text-sky-400" />, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', subPath: 'students' },
  { id: 'documentos', label: 'Documentos', icon: <FileText className="w-4 h-4 text-indigo-400" />, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', subPath: 'documents' },
  { id: 'comprovativos', label: 'Comprovativos', icon: <FileCheck className="w-4 h-4 text-emerald-400" />, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', subPath: 'proofs' },
  { id: 'certificados', label: 'Certificados', icon: <Award className="w-4 h-4 text-amber-400" />, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', subPath: 'certificates' },
  { id: 'materiais', label: 'Materiais', icon: <BookOpen className="w-4 h-4 text-purple-400" />, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', subPath: 'materials' },
  { id: 'contratos', label: 'Contratos', icon: <FileText className="w-4 h-4 text-rose-400" />, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', subPath: 'contracts' },
  { id: 'assinaturas', label: 'Assinaturas', icon: <Shield className="w-4 h-4 text-teal-400" />, color: 'bg-teal-500/10 text-teal-400 border-teal-500/20', subPath: 'signatures' },
  { id: 'modelos', label: 'Modelos', icon: <Sparkles className="w-4 h-4 text-amber-300" />, color: 'bg-amber-500/10 text-amber-300 border-amber-500/20', subPath: 'templates' },
];

export const StorageExplorerView: React.FC = () => {
  const { activeInstitution: currentInstitution, allInstitutions: institutions, currentUser, addNotification } = useApp();

  const [selectedInstId, setSelectedInstId] = useState<string>(currentInstitution?.id || 'inst_001');
  const [selectedCategory, setSelectedCategory] = useState<StorageCategory | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [files, setFiles] = useState<StorageFileMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<StorageCategory>('fotos');
  const [uploadEntityId, setUploadEntityId] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Preview file modal
  const [previewFile, setPreviewFile] = useState<StorageFileMeta | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const result = await listInstitutionalFiles(selectedInstId, {
        category: selectedCategory === 'todos' ? undefined : selectedCategory,
        searchQuery,
        includeArchived: showArchived
      });
      setFiles(result);
    } catch (e) {
      console.error('Error loading storage files:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [selectedInstId, selectedCategory, searchQuery, showArchived]);

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      if (!uploadFileName) {
        setUploadFileName(f.name);
      }
    }
  };

  const handleExecuteUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor, selecione um ficheiro.');
      return;
    }

    setIsUploading(true);
    try {
      const entityId = uploadEntityId.trim() || `ent_${Date.now()}`;
      const fileName = uploadFileName.trim() || selectedFile.name;

      const uploaded = await uploadInstitutionalFile({
        institutionId: selectedInstId,
        category: uploadCategory,
        entityId,
        fileName,
        file: selectedFile,
        uploadedBy: currentUser?.email || 'admin',
        uploadedByName: currentUser?.name || 'Administrador',
        customMetadata: {
          originalName: selectedFile.name,
          source: 'StorageExplorerView'
        }
      });

      addNotification({
        title: 'Upload Concluído com Sucesso',
        message: `Ficheiro guardado em ${uploaded.storagePath}`,
        type: 'system'
      });

      setIsUploadOpen(false);
      setSelectedFile(null);
      setUploadFileName('');
      setUploadEntityId('');
      loadFiles();
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Falha no upload: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleArchive = async (file: StorageFileMeta) => {
    if (!confirm(`Deseja arquivar o ficheiro "${file.fileName}"?\nO ficheiro será mantido no histórico conforme a política de retenção.`)) {
      return;
    }
    await archiveInstitutionalFile(file.id, currentUser?.email || 'admin');
    addNotification({
      title: 'Ficheiro Arquivado',
      message: 'O ficheiro foi arquivado mantendo o histórico de auditoria intacto.',
      type: 'system'
    });
    loadFiles();
  };

  const handleRestore = async (file: StorageFileMeta) => {
    await restoreArchivedFile(file.id);
    addNotification({
      title: 'Ficheiro Restaurado',
      message: 'O ficheiro voltou ao estado ativo.',
      type: 'system'
    });
    loadFiles();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Preview path generator for upload form
  const dynamicPreviewPath = buildInstitutionalStoragePath(
    selectedInstId,
    uploadCategory,
    uploadEntityId || '{entityId}',
    uploadFileName || (selectedFile?.name || 'ficheiro.ext')
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                55. Firebase Storage Institucional
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                  Ativo & Isolado
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Armazenamento em nuvem particionado por instituição com retenção de integridade.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Institution Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedInstId}
              onChange={e => setSelectedInstId(e.target.value)}
              aria-label="Selecionar Instituição"
              className="bg-transparent text-sm text-slate-200 focus:outline-hidden font-medium"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id} className="bg-slate-900 text-slate-200">
                  {inst.sigla} - {inst.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20 active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            Carregar Arquivo
          </button>
        </div>
      </div>

      {/* Path Structure Information Box */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <FolderTree className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-200">Estrutura de Paths Padronizada:</p>
            <div className="flex flex-wrap gap-2 mt-1.5 font-mono text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">/institutions/{'{institutionId}'}/students/{'{studentId}'}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">/institutions/{'{institutionId}'}/documents/{'{documentId}'}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">/institutions/{'{institutionId}'}/certificates/{'{certificateId}'}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">/institutions/{'{institutionId}'}/proofs/{'{proofId}'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Isolamento Multi-Tenant Estrito</span>
        </div>
      </div>

      {/* Categories & Search Filter Bar */}
      <div className="space-y-3">
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'todos'
                ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            Todas as Categorias
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Archived Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome de arquivo, path ou autor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200 select-none">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={e => setShowArchived(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950"
              />
              <span>Mostrar Arquivados (Histórico)</span>
            </label>

            <button
              onClick={loadFiles}
              title="Atualizar lista"
              className="p-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Files List / Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
          <p className="text-sm">Consultando arquivos no Firebase Storage...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="p-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl text-center">
          <HardDrive className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Nenhum arquivo encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Não existem arquivos registrados nesta categoria para a instituição selecionada.
            Utilize o botão &quot;Carregar Arquivo&quot; para armazenar itens.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl text-xs font-medium transition-colors"
          >
            Fazer Primeiro Upload
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map(file => {
            const catConfig = CATEGORIES.find(c => c.id === file.category) || CATEGORIES[0];
            const isImage = file.contentType.startsWith('image/') || file.fileName.match(/\.(jpg|jpeg|png|webp|gif)$/i);

            return (
              <div
                key={file.id}
                className={`group relative bg-slate-900/70 border rounded-2xl p-4 transition-all hover:border-slate-700 hover:shadow-lg flex flex-col justify-between ${
                  file.isArchived ? 'border-amber-500/30 bg-amber-950/10 opacity-75' : 'border-slate-800'
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border flex items-center gap-1 ${catConfig.color}`}>
                        {catConfig.icon}
                        {catConfig.label}
                      </span>
                      {file.isArchived && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Arquivado
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatBytes(file.fileSize)}
                    </span>
                  </div>

                  {/* Thumbnail / Preview Area */}
                  <div className="mt-3 relative h-28 bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800/80 flex items-center justify-center group-hover:border-slate-700">
                    {isImage && file.downloadUrl !== '#' ? (
                      <img
                        src={file.downloadUrl}
                        alt={file.fileName}
                        className="w-full h-full object-contain p-2"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-500">
                        {catConfig.icon}
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {file.contentType.split('/')[1] || 'PDF'}
                        </span>
                      </div>
                    )}

                    {/* Quick Preview overlay */}
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs text-white font-medium backdrop-blur-2xs"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                  </div>

                  {/* File Name & Path */}
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold text-slate-200 truncate" title={file.fileName}>
                      {file.fileName}
                    </h4>
                    <div className="flex items-center justify-between gap-1 mt-1 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                      <code className="text-[10px] font-mono text-slate-400 truncate select-all" title={file.storagePath}>
                        {file.storagePath}
                      </code>
                      <button
                        onClick={() => handleCopyPath(file.storagePath)}
                        title="Copiar Path"
                        className="text-slate-500 hover:text-sky-400 shrink-0 p-0.5"
                      >
                        {copiedPath === file.storagePath ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <p className="text-[10px] text-slate-400">
                      Por: <span className="text-slate-300 font-medium">{file.uploadedByName || 'Sistema'}</span>
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      {new Date(file.uploadedAt).toLocaleDateString('pt-PT')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {file.downloadUrl !== '#' && (
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="Descarregar ficheiro"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {file.isArchived ? (
                      <button
                        onClick={() => handleRestore(file)}
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                        title="Restaurar do histórico"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(file)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                        title="Arquivar (Preservação Histórica)"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-sky-400" />
                Carregar Arquivo no Firebase Storage
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteUpload} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Categoria de Armazenamento</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value as StorageCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.subPath})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ID da Entidade Relacionada</label>
                <input
                  type="text"
                  placeholder="Ex: std_1049, cert_8892, doc_bi_001..."
                  value={uploadEntityId}
                  onChange={e => setUploadEntityId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Identificador do aluno, contrato, certificado ou documento associado.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Ficheiro</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20"
                />
              </div>

              {selectedFile && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nome no Storage</label>
                  <input
                    type="text"
                    value={uploadFileName}
                    onChange={e => setUploadFileName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500"
                  />
                </div>
              )}

              {/* Live Path Preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-semibold text-sky-400 block mb-1">Storage Path Destino:</span>
                <code className="text-[11px] font-mono text-slate-300 break-all select-all">
                  {dynamicPreviewPath}
                </code>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Gravando...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Confirmar Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">{previewFile.fileName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{previewFile.storagePath}</p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="min-h-[220px] max-h-[380px] bg-slate-950 rounded-xl flex items-center justify-center p-4 overflow-hidden border border-slate-800">
              {previewFile.contentType.startsWith('image/') && previewFile.downloadUrl !== '#' ? (
                <img
                  src={previewFile.downloadUrl}
                  alt={previewFile.fileName}
                  className="max-h-[340px] max-w-full object-contain rounded-lg shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-12 h-12 text-sky-400 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">{previewFile.originalName}</p>
                  <p className="text-xs text-slate-500">{previewFile.contentType} • {formatBytes(previewFile.fileSize)}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500">ID da Entidade:</span>
                <p className="font-mono text-slate-300 font-medium">{previewFile.entityId || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Data de Envio:</span>
                <p className="text-slate-300">{new Date(previewFile.uploadedAt).toLocaleString('pt-PT')}</p>
              </div>
              <div>
                <span className="text-slate-500">Enviado Por:</span>
                <p className="text-slate-300">{previewFile.uploadedByName} ({previewFile.uploadedBy})</p>
              </div>
              <div>
                <span className="text-slate-500">Estado:</span>
                <p className={previewFile.isArchived ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {previewFile.isArchived ? 'Arquivado no Histórico' : 'Ativo'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleCopyPath(previewFile.storagePath)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar Path
              </button>
              {previewFile.downloadUrl !== '#' && (
                <a
                  href={previewFile.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Abrir / Descarregar
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
