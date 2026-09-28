import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  Lock,
  Building2
} from 'lucide-react';
import { Student } from '../../../types';
import { RequestCategory, SecretariatRequest } from '../types';

interface SecretariatRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student;
  initialCategory?: RequestCategory;
  initialReferenceInfo?: string;
  onSubmitRequest: (newReq: SecretariatRequest) => void;
}

export const SecretariatRequestModal: React.FC<SecretariatRequestModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  initialCategory,
  initialReferenceInfo,
  onSubmitRequest
}) => {
  const [category, setCategory] = useState<RequestCategory>(initialCategory || 'justificacao_falta');
  const [subject, setSubject] = useState('');
  const [targetItemInfo, setTargetItemInfo] = useState(initialReferenceInfo || '');
  const [description, setDescription] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState('');

  React.useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialReferenceInfo) setTargetItemInfo(initialReferenceInfo);
    setIsSuccess(false);
  }, [initialCategory, initialReferenceInfo, isOpen]);

  if (!isOpen) return null;

  const categoryLabels: Record<RequestCategory, string> = {
    justificacao_falta: 'Justificação de Faltas (Atestado / Declaração)',
    revisao_nota: 'Revisão de Prova / Reclamação de Nota',
    alteracao_cadastral: 'Alteração de Dados Cadastrais / Perfil',
    declaracao_matricula: 'Emissão de Declaração de Matrícula / Frequência',
    segunda_via_certificado: 'Solicitação de 2ª Via de Certificado / Diploma',
    acordo_financeiro: 'Acordo ou Plano de Pagamento de Mensalidades',
    equivalencia_dispensa: 'Pedido de Equivalência / Dispensa de Disciplina',
    mudanca_turma: 'Transferência de Turma ou Turno',
    outro: 'Outro Assunto Administrativo ou Pedagógico'
  };

  const handleSimulateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const randomProtocol = `SEC-2026-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedProtocol(randomProtocol);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');

      const newRequest: SecretariatRequest = {
        id: `req-${Date.now()}`,
        protocolNumber: randomProtocol,
        studentId: currentStudent.id,
        studentName: currentStudent.fullName,
        category,
        subject,
        targetItemInfo: targetItemInfo || undefined,
        description,
        attachedFileName: attachedFileName || undefined,
        status: 'submetido',
        submittedAt: dateStr,
        assignedOfficer: 'Secretaria Acadêmica'
      };

      onSubmitRequest(newRequest);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Solicitação à Secretaria Geral</h2>
              <p className="text-xs text-slate-400">
                Canal oficial para retificações, recursos de notas e justificação de faltas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informação sobre Proteção de Dados */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Política de Integridade Acadêmica:</span>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              Notas, frequências e dados cadastrais são protegidos contra edição direta. Todas as alterações são analisadas formalmente pela Direção Pedagógica e Secretaria.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Solicitação Enviada com Sucesso!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  O seu requerimento foi protocolado na Secretaria Acadêmica e será apreciado pelo setor responsável.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto text-left space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Número do Protocolo</div>
                <div className="text-lg font-mono font-bold text-emerald-700">{generatedProtocol}</div>
                <div className="text-xs text-slate-600">Requerente: {currentStudent.fullName}</div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Concluir e Voltar ao Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Solicitação *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RequestCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item de Referência / Disciplina / Data (Opcional)
                </label>
                <input
                  type="text"
                  value={targetItemInfo}
                  onChange={(e) => setTargetItemInfo(e.target.value)}
                  placeholder="Ex: Prova de Programação Web do dia 20/03 ou Falta do dia 12/09"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assunto Resumido *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Solicitação de retificação da nota da 2ª chamada"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Justificativa & Detalhamento dos Factos *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique detalhadamente o motivo da sua solicitação para análise pelo coordenador ou secretário..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Anexo de Comprovativo (Atestado Médico / BI / Requerimento)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer transition">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Selecionar Ficheiro</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleSimulateFile}
                    />
                  </label>
                  {attachedFileName ? (
                    <span className="text-xs text-emerald-700 font-medium truncate max-w-xs flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {attachedFileName}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Nenhum ficheiro anexado</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm cursor-pointer transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Protocolando...' : 'Submeter Solicitação'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
