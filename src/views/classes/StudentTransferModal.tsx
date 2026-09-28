import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRightLeft, 
  User, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Calendar,
  Clock,
  DoorOpen
} from 'lucide-react';
import { Student, ClassGroup } from '../../types';

interface StudentTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTransfer: (params: {
    studentId: string;
    fromClassId: string;
    toClassId: string;
    reason: string;
    authorizedBy: string;
    notes?: string;
    keepAcademicRecords?: boolean;
  }) => void;
  preSelectedStudent?: Student | null;
  preSelectedClassId?: string;
  allStudents: Student[];
  allClasses: ClassGroup[];
  currentUserName: string;
}

export const StudentTransferModal: React.FC<StudentTransferModalProps> = ({
  isOpen,
  onClose,
  onConfirmTransfer,
  preSelectedStudent,
  preSelectedClassId,
  allStudents,
  allClasses,
  currentUserName
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [reason, setReason] = useState<string>('Ajuste de Horário / Mudança de Turno');
  const [authorizedBy, setAuthorizedBy] = useState<string>(currentUserName || 'Secretaria Acadêmica');
  const [notes, setNotes] = useState<string>('');
  const [keepAcademicRecords, setKeepAcademicRecords] = useState<boolean>(true);

  useEffect(() => {
    if (preSelectedStudent) {
      setSelectedStudentId(preSelectedStudent.id);
    } else {
      setSelectedStudentId(allStudents[0]?.id || '');
    }
    setAuthorizedBy(currentUserName || 'Secretaria Acadêmica');
    setNotes('');
  }, [preSelectedStudent, allStudents, currentUserName, isOpen]);

  if (!isOpen) return null;

  const currentStudent = allStudents.find(s => s.id === selectedStudentId);
  const sourceClassId = currentStudent?.classGroupId || preSelectedClassId || '';
  const sourceClass = allClasses.find(c => c.id === sourceClassId);

  // Filter destination classes: must be different from current class
  const destinationClasses = allClasses.filter(c => c.id !== sourceClassId);

  // Set default target class if not set or invalid
  const activeTargetClass = destinationClasses.find(c => c.id === targetClassId) || destinationClasses[0];

  const targetClassStudents = allStudents.filter(s => s.classGroupId === (activeTargetClass?.id || targetClassId));
  const targetCapacity = activeTargetClass?.capacity || 25;
  const targetOccupancy = targetClassStudents.length;
  const isTargetFull = targetOccupancy >= targetCapacity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !activeTargetClass) return;

    onConfirmTransfer({
      studentId: selectedStudentId,
      fromClassId: sourceClassId,
      toClassId: activeTargetClass.id,
      reason,
      authorizedBy: authorizedBy.trim() || 'Direção Pedagógica',
      notes: notes.trim(),
      keepAcademicRecords
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Transferência de Aluno entre Turmas
              </h2>
              <p className="text-xs text-purple-900/80">
                Movimentação oficial de formando com auditoria e histórico acadêmico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Step 1: Seleção do Aluno */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-600" />
              Aluno a Transferir <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              disabled={!!preSelectedStudent}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 disabled:opacity-80"
            >
              {allStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.code}) - Turma Atual: {s.classGroupName || 'Sem Turma'}
                </option>
              ))}
            </select>
          </div>

          {/* Comparativo Visual: Turma de Origem ➜ Turma de Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            {/* Origem */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Turma de Origem</span>
              <p className="font-bold text-slate-900 text-sm">{sourceClass?.name || currentStudent?.classGroupName || 'Nenhuma'}</p>
              <p className="text-slate-500">{sourceClass?.courseName || currentStudent?.courseName}</p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{sourceClass?.schedule || 'Horário habitual'}</span>
              </div>
            </div>

            {/* Destino */}
            <div className="space-y-1 text-xs sm:border-l sm:border-slate-200 sm:pl-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600">Turma de Destino</span>
              <p className="font-bold text-purple-900 text-sm">{activeTargetClass?.name || 'Selecione...'}</p>
              <p className="text-slate-500">{activeTargetClass?.courseName}</p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                <Users className="w-3 h-3 text-slate-400" />
                <span className={isTargetFull ? 'text-rose-600 font-bold' : 'text-slate-700 font-medium'}>
                  Lotação: {targetOccupancy} / {targetCapacity} {isTargetFull ? '(Lotada)' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Selecionar Turma de Destino */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              Selecione a Nova Turma de Destino <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetClassId || activeTargetClass?.id || ''}
              onChange={e => setTargetClassId(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {destinationClasses.map(c => {
                const count = allStudents.filter(s => s.classGroupId === c.id).length;
                const full = count >= (c.capacity || 25);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.courseName} ({c.shift} | {c.schedule || '08:00 - 12:00'} | Sala {c.room}) [{count}/{c.capacity || 25} vagas]{full ? ' - LOTADA' : ''}
                  </option>
                );
              })}
            </select>
            {isTargetFull && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Aviso: A turma de destino atingiu a capacidade máxima ({targetCapacity} alunos).
              </p>
            )}
          </div>

          {/* Motivo da Transferência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Motivo Oficial <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Ajuste de Horário / Mudança de Turno">Ajuste de Horário / Mudança de Turno</option>
                <option value="Ajuste Pedagógico / Nível de Aprendizagem">Ajuste Pedagógico / Nível de Aprendizagem</option>
                <option value="Equilíbrio de Lotação / Capacidade">Equilíbrio de Lotação / Capacidade</option>
                <option value="Solicitação Formal do Formando / Encarregado">Solicitação Formal do Formando</option>
                <option value="Transferência de Polo ou Filial">Transferência de Polo ou Filial</option>
                <option value="Adaptação de Matriz Curricular">Adaptação de Matriz Curricular</option>
                <option value="Outro Motivo Administrativo">Outro Motivo Administrativo</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Autorizado Por <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={authorizedBy}
                onChange={e => setAuthorizedBy(e.target.value)}
                placeholder="Nome do Diretor ou Secretário"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Observações / Justificativa detalhada */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Despacho / Observações Administrativas (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Aluno solicitou mudança para o período da manhã por motivos profissionais mediante requerimento deferido."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Preservação de Notas e Avaliações */}
          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl flex items-start gap-3">
            <input
              id="keep-records"
              type="checkbox"
              checked={keepAcademicRecords}
              onChange={e => setKeepAcademicRecords(e.target.checked)}
              className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="keep-records" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-semibold text-purple-950 block">Preservar notas, avaliações e pauta acumulada</span>
              Manter o histórico acadêmico, notas de módulos e frequência do aluno já obtidos na turma anterior.
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Transferência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
