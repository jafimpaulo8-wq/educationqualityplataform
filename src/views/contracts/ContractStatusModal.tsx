import React, { useState } from 'react';
import { ContractStatus, GeneratedContract } from '../../types';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, X, ShieldAlert } from 'lucide-react';

interface ContractStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: GeneratedContract | null;
  onUpdateStatus: (contractId: string, newStatus: ContractStatus, reason: string) => void;
  onRenewContract: (contractId: string, newDuration: string, newValue: number, notes: string) => void;
}

export const ContractStatusModal: React.FC<ContractStatusModalProps> = ({
  isOpen,
  onClose,
  contract,
  onUpdateStatus,
  onRenewContract
}) => {
  if (!isOpen || !contract) return null;

  const [targetStatus, setTargetStatus] = useState<ContractStatus>(contract.status);
  const [reason, setReason] = useState('');
  // Campos para fluxo de renovação
  const [renewalDuration, setRenewalDuration] = useState(contract.duration || '12 Meses (1200 horas)');
  const [renewalValue, setRenewalValue] = useState<number>(contract.value || 4500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetStatus === 'renovado') {
      onRenewContract(contract.id, renewalDuration, renewalValue, reason);
    } else {
      onUpdateStatus(contract.id, targetStatus, reason || `Transição de estado para ${targetStatus}`);
    }
    onClose();
  };

  const statusOptions: { value: ContractStatus; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      value: 'ativo',
      label: 'Ativo / Em Vigência',
      desc: 'Contrato válido com aulas e obrigações pedagógicas e financeiras correntes.',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5'
    },
    {
      value: 'renovado',
      label: 'Renovado (Novo Ciclo)',
      desc: 'Encerra o termo atual com nota de transição e emite aditivo ou novo contrato ativo de renovação.',
      icon: <RefreshCw className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/30 hover:border-blue-500 bg-blue-500/5'
    },
    {
      value: 'encerrado',
      label: 'Encerrado / Cumprido',
      desc: 'Formação concluída ou término regular das obrigações contratuais acordadas.',
      icon: <CheckCircle className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/30 hover:border-purple-500 bg-purple-500/5'
    },
    {
      value: 'cancelado',
      label: 'Cancelado / Rescindido',
      desc: 'Rescisão antecipada por desistência, anulação de matrícula ou inadimplência grave.',
      icon: <XCircle className="w-4 h-4 text-red-400" />,
      color: 'border-red-500/30 hover:border-red-500 bg-red-500/5'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono text-pink-400 font-bold uppercase">
              Auditoria de Ciclo de Vida do Contrato
            </span>
            <h3 className="text-lg font-black text-white mt-1">
              Alterar Estado do Contrato
            </h3>
            <p className="text-xs text-slate-400">
              Formando: <strong className="text-white">{contract.studentName}</strong> • Ref: <span className="font-mono text-slate-300">{contract.referenceNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seletor de Estados */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Selecione o Novo Estado:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {statusOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => setTargetStatus(opt.value)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${opt.color} ${
                    targetStatus === opt.value
                      ? 'ring-2 ring-pink-500 border-pink-500 shadow-md'
                      : 'border-slate-800 bg-slate-950/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {opt.icon}
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parâmetros Específicos se for Renovação */}
          {targetStatus === 'renovado' && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-3">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-bold">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Parâmetros para o Novo Ciclo Renovado</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Nova Carga / Duração</label>
                  <input
                    type="text"
                    value={renewalDuration}
                    onChange={(e) => setRenewalDuration(e.target.value)}
                    placeholder="Ex: 6 Meses (600 Horas)"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Novo Valor da Propina (MT)</label>
                  <input
                    type="number"
                    value={renewalValue}
                    onChange={(e) => setRenewalValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <p className="text-[10px] text-blue-200/80">
                O contrato atual será preservado com histórico de renovação e um novo termo com referência vinculada será ativado.
              </p>
            </div>
          )}

          {/* Justificativa / Motivo Obrigatório para Cancelamento ou Encerramento */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Motivo / Parecer Administrativo</span>
              {targetStatus === 'cancelado' && (
                <span className="text-[11px] text-red-400 font-bold">Obrigatório para anulação</span>
              )}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                targetStatus === 'cancelado'
                  ? 'Descreva o motivo da rescisão (ex: desistência formal do formando em 15/09/2026)...'
                  : targetStatus === 'encerrado'
                  ? 'Ex: Conclusão integral da carga horária e homologação da nota final em conselho.'
                  : targetStatus === 'renovado'
                  ? 'Ex: Renovação autorizada para o nível seguinte de especialização.'
                  : 'Observações sobre a reativação da vigência contratual...'
              }
              required={targetStatus === 'cancelado'}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-pink-500 resize-none leading-relaxed"
            />
          </div>

          {/* Histórico Anterior de Estados */}
          {contract.statusHistory && contract.statusHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Histórico de Transições Deste Contrato:
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
                {contract.statusHistory.map((item) => (
                  <div key={item.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-white uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-800 mr-2">
                        {item.status}
                      </span>
                      <span className="text-slate-300 text-[11px]">{item.reason}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 shrink-0 text-right">
                      {item.changedAt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Ações */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Gravar Novo Estado</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
