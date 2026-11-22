import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Printer,
  Trash2,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { Institution, Student, StudentOccurrence } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { printIsolatedElement } from '../../../utils/printHelper';

interface StudentOccurrencesTabProps {
  student: Student;
  institution: Institution;
}

const SEVERITY_BADGE: Record<StudentOccurrence['severity'], { label: string; cls: string }> = {
  leve: {
    label: 'Leve / Informativa',
    cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
  },
  media: {
    label: 'Média / Advertência',
    cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  grave: {
    label: 'Grave / Disciplinar',
    cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  }
};

export const StudentOccurrencesTab: React.FC<StudentOccurrencesTabProps> = ({
  student,
  institution
}) => {
  const {
    studentOccurrences,
    addStudentOccurrence,
    deleteStudentOccurrence,
    addStudentHistoryEvent,
    currentUser
  } = useApp();
  const { success } = useToast();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<StudentOccurrence['severity']>('leve');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [recordedBy, setRecordedBy] = useState(
    currentUser?.name || institution.representativeName || 'Coordenação Pedagógica'
  );
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const occurrences = useMemo(
    () =>
      studentOccurrences.filter(
        o => o.studentId === student.id || o.studentId === student.code
      ),
    [studentOccurrences, student.id, student.code]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    addStudentOccurrence({
      studentId: student.id,
      date,
      title: title.trim(),
      severity,
      description: description.trim(),
      actionTaken: actionTaken.trim() || 'Registo lavrado para acompanhamento pedagógico.',
      recordedBy: recordedBy.trim() || 'Secretaria Académica'
    });

    addStudentHistoryEvent(student.id, {
      title: `Ocorrência (${severity.toUpperCase()}): ${title.trim()}`,
      category: 'disciplinar',
      description: `${description.trim()}${actionTaken.trim() ? ` • Providência: ${actionTaken.trim()}` : ''}`,
      recordedBy: recordedBy.trim() || 'Secretaria Académica'
    });

    success('Ocorrência Registada', 'O termo disciplinar/pedagógico foi adicionado ao dossiê do aluno.');
    setTitle('');
    setDescription('');
    setActionTaken('');
  };

  const handlePrintReport = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      printIsolatedElement(
        'student-occurrences-print-area',
        `Relatório de Ocorrências - ${student.fullName}`
      );
    }, 120);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Registo de Ocorrências Disciplinares &amp; Pedagógicas ({occurrences.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Acompanhamento de conduta, advertências, providências tomadas e emissão de termo oficial para encarregados.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-sm shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório de Ocorrências (A4)</span>
          </button>
        </div>

        {/* Formulário de Nova Ocorrência */}
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Plus className="w-4 h-4" />
            <span>Registar Nova Ocorrência</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="md:col-span-1">
              <label className="text-slate-400 font-semibold block mb-1">Data *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-slate-400 font-semibold block mb-1">Gravidade *</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as StudentOccurrence['severity'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                <option value="leve">Leve / Informativa</option>
                <option value="media">Média / Advertência</option>
                <option value="grave">Grave / Disciplinar</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-slate-400 font-semibold block mb-1">Registado Por *</label>
              <input
                type="text"
                required
                value={recordedBy}
                onChange={e => setRecordedBy(e.target.value)}
                placeholder="Nome do responsável"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Assunto / Título *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Atraso recorrente, uso indevido de equipamento, mérito..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Providência / Encaminhamento</label>
              <input
                type="text"
                value={actionTaken}
                onChange={e => setActionTaken(e.target.value)}
                placeholder="Ex: Conversa com encarregado, advertência verbal..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-400 font-semibold block mb-1">Descrição Detalhada dos Factos *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva objetivamente o ocorrido..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Ocorrência no Dossiê</span>
            </button>
          </div>
        </form>

        {/* Lista de Ocorrências */}
        <div className="space-y-3">
          {occurrences.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">Sem ocorrências registadas</p>
              <p className="text-[11px] text-slate-500">
                O estudante mantém registo de conduta exemplar sem ocorrências lavradas até ao momento.
              </p>
            </div>
          ) : (
            occurrences.map(occ => {
              const badge = SEVERITY_BADGE[occ.severity];
              return (
                <div
                  key={occ.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {occ.date}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{occ.title}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteStudentOccurrence(occ.id)}
                      title="Remover Ocorrência"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{occ.description}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span>
                      <strong className="text-emerald-400">Providência:</strong> {occ.actionTaken}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <UserCheck className="w-3 h-3 text-slate-500" /> {occ.recordedBy}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Área Oculta / Modal para Impressão A4 de Ocorrências */}
      <div className={showPrintPreview ? 'fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto' : 'hidden'}>
        <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Pré-visualização de Impressão A4
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => printIsolatedElement('student-occurrences-print-area', `Ocorrências - ${student.fullName}`)}
                className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir A4
              </button>
              <button
                type="button"
                onClick={() => setShowPrintPreview(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>

          <div id="student-occurrences-print-area" className="relative bg-white text-slate-900 p-6 space-y-5 border border-slate-200 rounded-xl overflow-hidden">
            {institution.showWatermarkOnReports && (
              <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.06] rotate-[-30deg]">
                <span className="text-5xl font-black uppercase tracking-widest text-slate-900">
                  {institution.shortName || institution.name}
                </span>
              </div>
            )}

            <div className="relative z-10 border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase text-slate-900">{institution.name}</h2>
                <p className="text-xs text-slate-600">
                  NUIT: {institution.nuit || 'N/A'} • {institution.city}, {institution.province}
                </p>
              </div>
              <div className="text-right text-xs">
                <div className="font-black uppercase text-slate-900">Relatório de Ocorrências</div>
                <div className="text-slate-500 font-mono">Emissão: {new Date().toLocaleDateString('pt-MZ')}</div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Estudante</span>
                <strong className="text-slate-900">{student.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Código</span>
                <strong className="font-mono text-slate-900">{student.code}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Curso</span>
                <strong className="text-slate-900">{student.courseName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Encarregado</span>
                <strong className="text-slate-900">{student.guardianName || '—'}</strong>
              </div>
            </div>

            <div className="relative z-10 space-y-3">
              {occurrences.length === 0 ? (
                <p className="text-xs text-slate-600 italic py-4 text-center">
                  Sem ocorrências disciplinares ou pedagógicas registadas para este formando.
                </p>
              ) : (
                occurrences.map((occ, idx) => (
                  <div key={occ.id} className="p-3 border border-slate-300 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>#{idx + 1} — {occ.title} ({occ.severity.toUpperCase()})</span>
                      <span className="font-mono">{occ.date}</span>
                    </div>
                    <p className="text-slate-700">{occ.description}</p>
                    <p className="text-[11px] text-slate-600">
                      <strong>Providência:</strong> {occ.actionTaken} • <strong>Resp.:</strong> {occ.recordedBy}
                    </p>
                  </div>
                ))
              )}
            </div>

            {institution.showSignatureOnDocs !== false && (
              <div className="relative z-10 pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-slate-400 pt-2">
                  <div className="font-bold text-slate-900">
                    {institution.signatoryName || institution.representativeName || 'Direção Pedagógica'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {institution.signatoryRole || institution.representativeRole || 'Assinatura Institucional'}
                  </div>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <div className="font-bold text-slate-900">{student.guardianName || 'Encarregado de Educação'}</div>
                  <div className="text-[10px] text-slate-500">Ciência do Encarregado / Formando</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
