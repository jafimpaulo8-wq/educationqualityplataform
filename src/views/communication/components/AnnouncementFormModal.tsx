import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  Users, 
  GraduationCap, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  FileText, 
  DollarSign, 
  CalendarDays, 
  MapPin, 
  MessageCircle, 
  Mail, 
  Layers, 
  Sparkles,
  Printer
} from 'lucide-react';
import { 
  Announcement, 
  AnnouncementType, 
  AnnouncementTarget, 
  AnnouncementPriority 
} from '../../../types';
import { useApp } from '../../../context/AppContext';
import { ANNOUNCEMENT_TEMPLATES } from '../../../data/announcementsData';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcementToEdit?: Announcement | null;
  onSave: (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'readCount' | 'confirmedCount'>) => void;
  coursesList: { id: string; name: string }[];
  classesList: { id: string; name: string; courseId: string }[];
}

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  isOpen,
  onClose,
  announcementToEdit,
  onSave,
  coursesList,
  classesList
}) => {
  const { activeInstitution, currentUser } = useApp();

  // Form State
  const [type, setType] = useState<AnnouncementType>('aviso');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<AnnouncementTarget>('todos');
  const [targetCourseId, setTargetCourseId] = useState('');
  const [targetCourseName, setTargetCourseName] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [targetClassName, setTargetClassName] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [authorName, setAuthorName] = useState(currentUser.name || 'Direção Geral');
  const [authorRole, setAuthorRole] = useState('Direção Pedagógica');

  // Scheduling State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00');

  // Channels
  const [channelSystem, setChannelSystem] = useState(true);
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelWhatsApp, setChannelWhatsApp] = useState(true);
  const [channelMuralA4, setChannelMuralA4] = useState(true);

  // Type-specific extras
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // Schedule change specifics
  const [subjectName, setSubjectName] = useState('');
  const [previousSchedule, setPreviousSchedule] = useState('');
  const [newSchedule, setNewSchedule] = useState('');
  const [scheduleEffectiveDate, setScheduleEffectiveDate] = useState('');
  const [roomOrLab, setRoomOrLab] = useState('');

  // Payment notice specifics
  const [referenceMonth, setReferenceMonth] = useState('Setembro/2026');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [bankAccount, setBankAccount] = useState('BCI: 0008.0000.123456789 | BIM: 102938475');
  const [mpesaEntity, setMpesaEntity] = useState('841234567 (Ref: Código do Estudante)');
  const [fineAfterDueDate, setFineAfterDueDate] = useState('10% após prazo limite');

  // Errors
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (announcementToEdit) {
      setType(announcementToEdit.type);
      setTitle(announcementToEdit.title);
      setSummary(announcementToEdit.summary || '');
      setContent(announcementToEdit.content);
      setTargetAudience(announcementToEdit.targetAudience);
      setTargetCourseId(announcementToEdit.targetCourseId || '');
      setTargetCourseName(announcementToEdit.targetCourseName || '');
      setTargetClassId(announcementToEdit.targetClassId || '');
      setTargetClassName(announcementToEdit.targetClassName || '');
      setPriority(announcementToEdit.priority);
      setRequiresConfirmation(!!announcementToEdit.requiresConfirmation);
      setAuthorName(announcementToEdit.authorName);
      setAuthorRole(announcementToEdit.authorRole || 'Direção Pedagógica');

      if (announcementToEdit.status === 'agendado' && announcementToEdit.scheduledFor) {
        setIsScheduled(true);
        const [d, t] = announcementToEdit.scheduledFor.split('T');
        setScheduledDate(d || '');
        setScheduledTime(t || '08:00');
      } else {
        setIsScheduled(false);
        setScheduledDate('');
        setScheduledTime('08:00');
      }

      setChannelSystem(announcementToEdit.channels?.system ?? true);
      setChannelEmail(announcementToEdit.channels?.email ?? true);
      setChannelWhatsApp(announcementToEdit.channels?.whatsapp ?? true);
      setChannelMuralA4(announcementToEdit.channels?.muralA4 ?? true);

      setEventDate(announcementToEdit.eventDate || '');
      setEventLocation(announcementToEdit.eventLocation || '');

      if (announcementToEdit.scheduleChangeDetails) {
        setSubjectName(announcementToEdit.scheduleChangeDetails.subject || '');
        setPreviousSchedule(announcementToEdit.scheduleChangeDetails.previousSchedule || '');
        setNewSchedule(announcementToEdit.scheduleChangeDetails.newSchedule || '');
        setScheduleEffectiveDate(announcementToEdit.scheduleChangeDetails.effectiveDate || '');
        setRoomOrLab(announcementToEdit.scheduleChangeDetails.roomOrLab || '');
      }

      if (announcementToEdit.paymentNoticeDetails) {
        setReferenceMonth(announcementToEdit.paymentNoticeDetails.referenceMonth || '');
        setPaymentDueDate(announcementToEdit.paymentNoticeDetails.dueDate || '');
        setBankAccount(announcementToEdit.paymentNoticeDetails.bankAccount || '');
        setMpesaEntity(announcementToEdit.paymentNoticeDetails.mpesaEntity || '');
        setFineAfterDueDate(announcementToEdit.paymentNoticeDetails.fineAfterDueDate || '');
      }
    } else {
      // Reset form
      setType('aviso');
      setTitle('');
      setSummary('');
      setContent('');
      setTargetAudience('todos');
      setTargetCourseId('');
      setTargetCourseName('');
      setTargetClassId('');
      setTargetClassName('');
      setPriority('normal');
      setRequiresConfirmation(false);
      setAuthorName(currentUser.name || 'Secretaria Académica');
      setAuthorRole('Direção Pedagógica');
      setIsScheduled(false);
      setScheduledDate('');
      setScheduledTime('08:00');
      setChannelSystem(true);
      setChannelEmail(true);
      setChannelWhatsApp(true);
      setChannelMuralA4(true);
      setEventDate('');
      setEventLocation('');
      setSubjectName('');
      setPreviousSchedule('');
      setNewSchedule('');
      setScheduleEffectiveDate('');
      setRoomOrLab('');
      setReferenceMonth('Setembro/2026');
      setPaymentDueDate('');
      setBankAccount('BCI: 0008.0000.123456789 | BIM: 102938475');
      setMpesaEntity('841234567 (Ref: Código do Estudante)');
      setFineAfterDueDate('10% após prazo limite');
      setErrorMsg('');
    }
  }, [announcementToEdit, isOpen, currentUser]);

  const applyTemplate = (tplId: string) => {
    const tpl = ANNOUNCEMENT_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;

    setType(tpl.type);
    setTitle(tpl.defaultTitle);
    setTargetAudience(tpl.defaultTarget);
    setPriority(tpl.defaultPriority);
    setSummary(tpl.summary);
    setContent(tpl.content);
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setTargetCourseId(cid);
    const crs = coursesList.find(c => c.id === cid);
    setTargetCourseName(crs ? crs.name : '');
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clsid = e.target.value;
    setTargetClassId(clsid);
    const cls = classesList.find(c => c.id === clsid);
    setTargetClassName(cls ? cls.name : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Por favor informe o título oficial do comunicado.');
      return;
    }

    if (!content.trim()) {
      setErrorMsg('Por favor insira o conteúdo do comunicado.');
      return;
    }

    if (isScheduled && !scheduledDate) {
      setErrorMsg('Por favor especifique a data programada para o agendamento.');
      return;
    }

    const scheduledFor = isScheduled ? `${scheduledDate}T${scheduledTime}` : undefined;
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const payload: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'readCount' | 'confirmedCount'> = {
      institutionId: activeInstitution.id,
      type,
      title: title.trim(),
      summary: summary.trim() || undefined,
      content: content.trim(),
      targetAudience,
      targetCourseId: targetAudience === 'curso' ? targetCourseId : undefined,
      targetCourseName: targetAudience === 'curso' ? targetCourseName : undefined,
      targetClassId: targetAudience === 'turma' ? targetClassId : undefined,
      targetClassName: targetAudience === 'turma' ? targetClassName : undefined,
      priority,
      status: isScheduled ? 'agendado' : 'publicado',
      publishDate: isScheduled ? `${scheduledDate} ${scheduledTime}` : nowStr,
      scheduledFor,
      authorName: authorName.trim() || 'Direção Geral',
      authorRole: authorRole.trim() || 'Direção',
      channels: {
        system: channelSystem,
        email: channelEmail,
        whatsapp: channelWhatsApp,
        muralA4: channelMuralA4
      },
      requiresConfirmation,
      eventDate: (type === 'reuniao' || type === 'evento' || type === 'feriado') && eventDate ? eventDate : undefined,
      eventLocation: (type === 'reuniao' || type === 'evento') && eventLocation ? eventLocation : undefined,
      scheduleChangeDetails: type === 'mudanca_horario' ? {
        subject: subjectName,
        previousSchedule,
        newSchedule,
        effectiveDate: scheduleEffectiveDate,
        roomOrLab
      } : undefined,
      paymentNoticeDetails: type === 'pagamento' ? {
        referenceMonth,
        dueDate: paymentDueDate,
        bankAccount,
        mpesaEntity,
        fineAfterDueDate
      } : undefined
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        id="announcement-form-modal"
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {announcementToEdit ? 'Editar Comunicado Institucional' : 'Novo Comunicado Institucional'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publicação multi-canal com suporte a agendamento, segmentação por público e templates oficiais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Quick Bar */}
        {!announcementToEdit && (
          <div className="px-6 py-3 bg-amber-500/5 border-b border-amber-200/40 dark:border-amber-900/30 flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modelos Rápidos:</span>
            </div>
            <div className="flex items-center gap-2 flex-nowrap">
              {ANNOUNCEMENT_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl.id)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shadow-sm"
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Type & Target & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de Comunicado */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Tipo de Comunicado *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as AnnouncementType)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
              >
                <option value="aviso">📢 Aviso Institucional</option>
                <option value="reuniao">👥 Convocatória de Reunião</option>
                <option value="mudanca_horario">⏰ Mudança de Horário</option>
                <option value="pagamento">💰 Lembrete de Pagamento</option>
                <option value="feriado">🏖️ Feriado / Tolerância</option>
                <option value="evento">🎉 Evento & Feira</option>
              </select>
            </div>

            {/* Destinatários */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Público-Alvo (Destinatários) *
              </label>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value as AnnouncementTarget)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
              >
                <option value="todos">🌐 Toda a Comunidade Académica</option>
                <option value="curso">📚 Curso Específico</option>
                <option value="turma">👥 Turma Específica</option>
                <option value="professor">👨‍🏫 Docentes & Formadores</option>
                <option value="aluno">🎓 Estudantes & Formandos</option>
                <option value="responsaveis">👨‍👩‍👦 Pais & Encarregados</option>
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Nível de Prioridade
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as AnnouncementPriority)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
              >
                <option value="normal">Normal (Informativo regular)</option>
                <option value="alta">Alta (Destaque importante)</option>
                <option value="urgente">Urgente (Notificação prioritária)</option>
              </select>
            </div>
          </div>

          {/* Conditional Selectors: Curso ou Turma */}
          {targetAudience === 'curso' && (
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50">
              <label className="block text-xs font-bold text-sky-900 dark:text-sky-300 mb-1.5">
                Selecione o Curso Destinatário:
              </label>
              <select
                value={targetCourseId}
                onChange={handleCourseChange}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="">-- Selecione o Curso --</option>
                {coursesList.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {targetAudience === 'turma' && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50">
              <label className="block text-xs font-bold text-purple-900 dark:text-purple-300 mb-1.5">
                Selecione a Turma Destinatária:
              </label>
              <select
                value={targetClassId}
                onChange={handleClassChange}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="">-- Selecione a Turma --</option>
                {classesList.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Summary */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Título Oficial do Comunicado *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex.: Suspensão de Atividades Letivas: Dia da Paz e Reconciliação"
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Resumo / Ementa Rápida (Exibido nas notificações e WhatsApp)
              </label>
              <input
                type="text"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Ex.: Informações oficiais sobre recesso de 4 de Outubro e retorno das aulas."
                className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Specifics Fields per Type */}
          {(type === 'reuniao' || type === 'evento' || type === 'feriado') && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-rose-500" />
                <span>Dados do Evento / Reunião</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Data e Hora do Acontecimento
                  </label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                {type !== 'feriado' && (
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Local / Sala / Auditório
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={e => setEventLocation(e.target.value)}
                        placeholder="Ex.: Auditório Central - Bloco de Tecnologias"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === 'mudanca_horario' && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Especificação da Alteração de Horário</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Disciplina / Módulo</label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={e => setSubjectName(e.target.value)}
                    placeholder="Ex.: Redes de Computadores"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Horário Anterior</label>
                  <input
                    type="text"
                    value={previousSchedule}
                    onChange={e => setPreviousSchedule(e.target.value)}
                    placeholder="Ex.: Qui: 14h00 - 16h30"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Novo Horário Vigorante</label>
                  <input
                    type="text"
                    value={newSchedule}
                    onChange={e => setNewSchedule(e.target.value)}
                    placeholder="Ex.: Ter: 08h00 - 11h15"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Data de Início do Novo Horário</label>
                  <input
                    type="date"
                    value={scheduleEffectiveDate}
                    onChange={e => setScheduleEffectiveDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Sala / Laboratório</label>
                  <input
                    type="text"
                    value={roomOrLab}
                    onChange={e => setRoomOrLab(e.target.value)}
                    placeholder="Ex.: Laboratório de Redes L2"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'pagamento' && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Parâmetros do Lembrete de Pagamento</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Mês de Referência</label>
                  <input
                    type="text"
                    value={referenceMonth}
                    onChange={e => setReferenceMonth(e.target.value)}
                    placeholder="Ex.: Outubro/2026"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Data Limite Sem Multa</label>
                  <input
                    type="date"
                    value={paymentDueDate}
                    onChange={e => setPaymentDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Contas Bancárias / NIB</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Entidade / M-Pesa</label>
                  <input
                    type="text"
                    value={mpesaEntity}
                    onChange={e => setMpesaEntity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Full Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Conteúdo Oficial do Comunicado *
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Digite aqui o texto completo do comunicado oficial..."
              className="w-full p-4 text-sm font-sans bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Agendamento & Programação */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-schedule"
                  checked={isScheduled}
                  onChange={e => setIsScheduled(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="chk-schedule" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>Programar Publicação Automática (Agendamento)</span>
                </label>
              </div>
              {isScheduled && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Agendado
                </span>
              )}
            </div>

            {isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Data de Publicação
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Horário de Liberação
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Multi-Channel Distribution & Options */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Canais de Distribuição & Requisitos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                channelSystem 
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}>
                <input
                  type="checkbox"
                  checked={channelSystem}
                  onChange={e => setChannelSystem(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <Bell className="w-4 h-4" />
                <span className="font-semibold">Painel Sistema</span>
              </label>

              <label className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                channelEmail 
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}>
                <input
                  type="checkbox"
                  checked={channelEmail}
                  onChange={e => setChannelEmail(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4" />
                <span className="font-semibold">Correio Eletrónico</span>
              </label>

              <label className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                channelWhatsApp 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}>
                <input
                  type="checkbox"
                  checked={channelWhatsApp}
                  onChange={e => setChannelWhatsApp(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold">WhatsApp</span>
              </label>

              <label className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                channelMuralA4 
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}>
                <input
                  type="checkbox"
                  checked={channelMuralA4}
                  onChange={e => setChannelMuralA4(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <Printer className="w-4 h-4" />
                <span className="font-semibold">Mural Físico A4</span>
              </label>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresConfirmation}
                  onChange={e => setRequiresConfirmation(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-medium">
                  Exigir confirmação de leitura / presença por parte dos destinatários
                </span>
              </label>
            </div>
          </div>

          {/* Author Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Nome do Signatário / Emissor
              </label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Cargo / Departamento Emissor
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-600/20 transition-all"
            >
              {isScheduled ? <Clock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{isScheduled ? 'Agendar Comunicado' : 'Publicar Agora'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
