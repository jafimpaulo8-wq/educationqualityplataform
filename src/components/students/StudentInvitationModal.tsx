import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Send,
  Copy,
  Check,
  Clock,
  AlertCircle,
  X,
  Mail,
  MessageCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { Student, StudentInvitation, Institution, UserInvitation } from '../../types';
import {
  getStudentInvitationsByStudent,
  revokeStudentInvitation
} from '../../services/firestoreService';
import {
  buildInviteActivationUrl,
  createUserInvitation,
  listUserInvitations,
  revokeUserInvitation
} from '../../services/inviteAuthService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';

function toSafeDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val.toDate === 'function') {
    const d = val.toDate();
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val.seconds === 'number') {
    const d = new Date(val.seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

interface UnifiedStudentInviteDisplay {
  id: string;
  token: string;
  email: string;
  expiresAt: string;
  used: boolean;
  revoked?: boolean;
  usedAt?: string;
  createdAt: string;
  createdBy: string;
  sourceCollection: 'userInvitations' | 'studentInvitations';
}

interface StudentInvitationModalProps {
  student: Student;
  institution: Institution;
  isOpen: boolean;
  onClose: () => void;
  onAuditLog?: (action: string, details: string) => void;
}

export const StudentInvitationModal: React.FC<StudentInvitationModalProps> = ({
  student,
  institution,
  isOpen,
  onClose,
  onAuditLog
}) => {
  const { firebaseUser, userProfile, activeRole, updateStudent } = useApp();
  const { success, error: toastError, info } = useToast();

  const [invitations, setInvitations] = useState<UnifiedStudentInviteDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'email' | 'whatsapp'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(student?.email || '');

  useEffect(() => {
    setEmailInput(student?.email || '');
  }, [student?.id, student?.email, isOpen]);

  useEffect(() => {
    if (isOpen && student?.id) {
      loadInvitations();
    }
  }, [isOpen, student?.id]);

  const mapUserInvToDisplay = (inv: UserInvitation): UnifiedStudentInviteDisplay => ({
    id: inv.id,
    token: inv.token || inv.id,
    email: inv.email,
    expiresAt: inv.expiresAt,
    used: !!inv.used || inv.status === 'ativado',
    revoked: !!inv.revoked || inv.status === 'revogado',
    usedAt: inv.usedAt,
    createdAt: inv.createdAt,
    createdBy: inv.createdByName || inv.createdByEmail || 'Secretaria',
    sourceCollection: 'userInvitations'
  });

  const mapLegacyInvToDisplay = (inv: StudentInvitation): UnifiedStudentInviteDisplay => ({
    id: inv.id,
    token: inv.token,
    email: inv.studentEmail,
    expiresAt: inv.expiresAt,
    used: !!inv.used,
    revoked: !!inv.revoked,
    usedAt: inv.usedAt,
    createdAt: inv.createdAt,
    createdBy: inv.createdBy || 'Secretaria',
    sourceCollection: 'studentInvitations'
  });

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const targetInstId = student.institutionId || institution.id;
      const [unifiedList, legacyList] = await Promise.all([
        listUserInvitations(targetInstId),
        getStudentInvitationsByStudent(student.id)
      ]);

      const normalizedStudentEmail = (student.email || '').trim().toLowerCase();
      const studentUnified = unifiedList
        .filter((inv) =>
          inv.linkedEntityId === student.id ||
          (normalizedStudentEmail && (inv.email || '').trim().toLowerCase() === normalizedStudentEmail && inv.role === 'ALUNO')
        )
        .map(mapUserInvToDisplay);

      const seenTokens = new Set(studentUnified.map((i) => i.token));
      const legacyMapped = legacyList
        .filter((l) => !seenTokens.has(l.token))
        .map(mapLegacyInvToDisplay);

      const merged = [...studentUnified, ...legacyMapped].sort(
        (a, b) => (toSafeDate(b.createdAt)?.getTime() || 0) - (toSafeDate(a.createdAt)?.getTime() || 0)
      );
      setInvitations(merged);
    } catch (e) {
      console.warn('Error loading invitations:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const normalizedEmail = emailInput.trim().toLowerCase();
  const isEmailValid = Boolean(normalizedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail));
  const isSyntheticLegacyEmail = normalizedEmail.endsWith('@aluno.sigar');

  const latestInvitation = invitations.find((i) => !i.revoked) || invitations[0] || null;
  const activationUrl = latestInvitation
    ? buildInviteActivationUrl(latestInvitation.token)
    : '';

  const emailSubject = `Convite de Acesso ao Portal do Aluno — ${institution.name}`;
  const emailBody = `Prezado(a) ${student.fullName},

É com satisfação que informamos que a sua matrícula no curso ${student.courseName} foi concluída com sucesso na ${institution.name}.

O seu código de estudante é: ${student.code}

Para ter acesso às suas notas, horários, frequência, pagamentos e carteirinha digital, configure a sua palavra-passe de acesso no Portal do Aluno através do link oficial seguro abaixo:

${activationUrl}

Nota de Segurança:
• Utilize o e-mail registado (${latestInvitation?.email || emailInput}) para concluir a activação e verificação de identidade.
• Este link é de uso único e pessoal.
• O link é válido por 30 dias a partir da data de emissão.
• Nunca partilhe este link com terceiros.

Em caso de dúvidas, contacte a nossa secretaria académica pelo e-mail ${institution.email} ou telefone ${institution.phone}.

Atenciosamente,
Direcção & Secretaria Académica
${institution.name}`;

  const whatsappMessage = `Olá *${student.fullName}*! A sua matrícula no curso *${student.courseName}* foi homologada na *${institution.name}*. O seu código de formando é *${student.code}*. Aceda ao link oficial abaixo usando o e-mail *${latestInvitation?.email || emailInput}* para criar a sua palavra-passe e entrar no Portal do Aluno: ${activationUrl}`;

  const rawPhone = student.whatsapp || student.phone || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`}?text=${encodeURIComponent(whatsappMessage)}`
    : '';

  const handleGenerateInvitation = async () => {
    if (!isEmailValid || isSyntheticLegacyEmail) {
      toastError(
        'E-mail Real Obrigatório',
        'Informe um endereço de e-mail pessoal válido do formando para activar a conta com verificação oficial.'
      );
      return;
    }

    setGenerating(true);
    soundManager.playClick();
    try {
      const targetInstId = student.institutionId || institution.id;

      // Keep student dossier email synchronized if secretary supplied or corrected it
      if (normalizedEmail !== (student.email || '').trim().toLowerCase()) {
        updateStudent(student.id, { email: normalizedEmail });
      }

      const actor = {
        uid: firebaseUser?.uid || userProfile?.id || 'secretaria',
        name: userProfile?.name || institution.representativeName || 'Secretaria Académica',
        email: firebaseUser?.email || userProfile?.email || institution.email || '',
        role: activeRole || 'SECRETARIA',
        institutionId: targetInstId,
        permissions: userProfile?.permissions
      };

      const { invitation } = await createUserInvitation(actor, {
        fullName: student.fullName,
        email: normalizedEmail,
        phone: student.whatsapp || student.phone,
        institutionId: targetInstId,
        institutionName: institution.name,
        branchId: student.branchId || 'todas',
        role: 'ALUNO',
        linkedEntityType: 'student',
        linkedEntityId: student.id,
        expiresInDays: 30
      });

      const createdDisplay = mapUserInvToDisplay(invitation);
      setInvitations((prev) => [createdDisplay, ...prev]);

      if (onAuditLog) {
        onAuditLog(
          'EMISSAO_CONVITE_PORTAL_ALUNO',
          `Convite unificado emitido para ${student.fullName} (${student.code}) com e-mail ${normalizedEmail} e validade de 30 dias.`
        );
      }

      soundManager.playSuccess();
      success(
        'Link de Convite Criado',
        'O link único de activação foi guardado. Partilhe-o manualmente por cópia, e-mail (mailto:) ou WhatsApp (sem envio automático por servidor).'
      );
    } catch (err: any) {
      toastError('Erro ao Gerar', err.message || 'Falha ao criar convite de acesso.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeInvitation = async (inv: UnifiedStudentInviteDisplay) => {
    try {
      if (inv.sourceCollection === 'userInvitations') {
        await revokeUserInvitation(inv.id, firebaseUser?.uid || userProfile?.id || 'secretaria');
      } else {
        await revokeStudentInvitation(inv.id);
      }
      setInvitations((prev) => prev.map((item) => (item.id === inv.id ? { ...item, revoked: true } : item)));
      soundManager.playClick();
      info('Convite Revogado', 'O token de acesso selecionado foi invalidado.');
      if (onAuditLog) {
        onAuditLog(
          'REVOGACAO_CONVITE_PORTAL',
          `Convite ${inv.id} revogado para o formando ${student.fullName}.`
        );
      }
    } catch (err: any) {
      toastError('Erro ao Revogar', err.message || 'Falha ao revogar convite.');
    }
  };

  const handleCopyLink = () => {
    if (!activationUrl) return;
    navigator.clipboard.writeText(activationUrl);
    setCopiedLink(true);
    soundManager.playSuccess();
    success('Copiado!', 'Link de ativação copiado para a área de transferência.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedEmail(true);
    soundManager.playSuccess();
    success('Texto Copiado', 'Conteúdo completo do e-mail copiado.');
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0d1527] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Acesso &amp; Credenciais do Formando
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Convite ao Portal do Aluno
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {student.fullName} • Código: {student.code}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Access Status & Real Email Requirement */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Estado Atual do Acesso no Firestore
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {student.userId ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Conta Ativa (UID Vinculado)
                  </span>
                ) : latestInvitation && !latestInvitation.used && !latestInvitation.revoked && (toSafeDate(latestInvitation.expiresAt) || new Date(0)) > new Date() ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Convite Pendente (Link Gerado — Partilha Manual)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    Sem Acesso Ativado
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerateInvitation}
              disabled={generating || !isEmailValid || isSyntheticLegacyEmail}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A Gerar Token...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Novo Convite</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 block">
              E-mail Real do Formando (Obrigatório para Verificação e Activação)
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="nome.aluno@gmail.com"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
            {(!isEmailValid || isSyntheticLegacyEmail) && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isSyntheticLegacyEmail
                    ? 'Substitua o endereço interno @aluno.sigar por um e-mail real do formando.'
                    : 'Informe um e-mail real válido para emitir o convite oficial.'}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* If Active Invitation exists */}
        {latestInvitation && !latestInvitation.revoked && (
          <div className="space-y-4">
            {/* Tabs: Link / Email / WhatsApp */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'link' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>1. Link Direto</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'email' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>2. E-mail Oficial</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'whatsapp' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>3. WhatsApp</span>
              </button>
            </div>

            {/* Tab 1: Link Direto */}
            {activeTab === 'link' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Link Seguro de Ativação Única</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Expira em {toSafeDate(latestInvitation.expiresAt)?.toLocaleDateString('pt-MZ') || '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activationUrl}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-blue-300 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  <a
                    href={activationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    title="Testar Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500">
                  O formando abrirá esta página com o e-mail <strong className="text-slate-300">{latestInvitation.email}</strong>, verificará a identidade e definirá a sua palavra-passe pessoal.
                </p>
              </div>
            )}

            {/* Tab 2: E-mail Pré-formatado */}
            {activeTab === 'email' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Assunto do E-mail</span>
                    <span className="text-xs text-blue-300 font-medium">{emailSubject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${encodeURIComponent(latestInvitation.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                      className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Abrir E-mail</span>
                    </a>
                    <button
                      onClick={handleCopyEmail}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? 'Copiado!' : 'Copiar E-mail'}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={emailBody}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono leading-relaxed focus:outline-none"
                />
                <p className="text-[11px] text-amber-300/90">
                  Nota: O SIGAR PRO não envia este e-mail automaticamente na emissão do convite. Utilize &quot;Abrir E-mail&quot; (mailto:) ou copie o texto/link para enviar ao formando.
                </p>
              </div>
            )}

            {/* Tab 3: WhatsApp */}
            {activeTab === 'whatsapp' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-300">Mensagem Direta via WhatsApp</span>
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar para {student.whatsapp || student.phone}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toastError('Sem Contacto', 'O formando não possui telefone ou WhatsApp cadastrado.')}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Sem WhatsApp registado</span>
                    </button>
                  )}
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={whatsappMessage}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 leading-relaxed focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* History of invitations */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Histórico de Convites Emitidos ({invitations.length})
          </h3>

          {loading ? (
            <div className="py-6 text-center text-xs text-slate-500 font-mono">A carregar convites...</div>
          ) : invitations.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center text-xs text-slate-500">
              Nenhum convite emitido até ao momento. Informe o e-mail real do formando e clique em &quot;Gerar Novo Convite&quot;.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden text-xs">
              {invitations.map(inv => {
                const expDate = toSafeDate(inv.expiresAt);
                const isExpired = expDate ? expDate < new Date() : false;
                const usedDate = toSafeDate(inv.usedAt);
                const createdDate = toSafeDate(inv.createdAt);
                return (
                  <div key={inv.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-white font-bold">{inv.token.slice(0, 16)}...</span>
                        <span className="text-[11px] text-sky-300 font-mono truncate">{inv.email}</span>
                        {inv.used ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Ativado em {usedDate ? usedDate.toLocaleDateString('pt-MZ') : ''}
                          </span>
                        ) : inv.revoked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Revogado
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Expirado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            Ativo (Expira em {expDate ? expDate.toLocaleDateString('pt-MZ') : '—'})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Criado em {createdDate ? createdDate.toLocaleString('pt-MZ') : '—'} por {inv.createdBy}
                      </span>
                    </div>

                    {!inv.used && !inv.revoked && !isExpired && (
                      <button
                        onClick={() => handleRevokeInvitation(inv)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-semibold cursor-pointer transition-colors shrink-0"
                      >
                        Revogar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
