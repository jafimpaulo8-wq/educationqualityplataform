import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  X, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  RefreshCw,
  Trash2,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { Student, StudentInvitation, Institution } from '../../types';
import { 
  saveStudentInvitation, 
  getStudentInvitationsByStudent, 
  revokeStudentInvitation 
} from '../../services/firestoreService';
import { generateSecureInvitationToken } from '../../services/publicInstitutionService';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';

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
  const { success, error: toastError, info } = useToast();

  const [invitations, setInvitations] = useState<StudentInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'email' | 'whatsapp'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Load existing invitations on open
  useEffect(() => {
    if (isOpen && student?.id) {
      loadInvitations();
    }
  }, [isOpen, student?.id]);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const list = await getStudentInvitationsByStudent(student.id);
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setInvitations(list);
    } catch (e) {
      console.warn('Error loading invitations:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const latestInvitation = invitations[0] || null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sigar.moztechwave.com';
  const activationUrl = latestInvitation 
    ? `${baseUrl}/ativar-conta?token=${latestInvitation.token}` 
    : '';

  const emailSubject = `Convite de Acesso ao Portal do Aluno — ${institution.name}`;
  const emailBody = `Prezado(a) ${student.fullName},

É com satisfação que informamos que a sua matrícula no curso ${student.courseName} foi concluída com sucesso na ${institution.name}.

O seu código de estudante é: ${student.code}

Para ter acesso às suas notas, horários, frequência, pagamentos e carteirinha digital, configure a sua palavra-passe de acesso no Portal do Aluno através do link oficial seguro abaixo:

${activationUrl}

Nota de Segurança:
• Este link é de uso único e pessoal.
• O link é válido por 30 dias a partir da data de emissão.
• Nunca partilhe este link com terceiros.

Em caso de dúvidas, contacte a nossa secretaria académica pelo e-mail ${institution.email} ou telefone ${institution.phone}.

Atenciosamente,
Direcção & Secretaria Académica
${institution.name}`;

  const whatsappMessage = `Olá *${student.fullName}*! A sua matrícula no curso *${student.courseName}* foi homologada na *${institution.name}*. O seu código de formando é *${student.code}*. Aceda ao link oficial abaixo para criar a sua palavra-passe e entrar no Portal do Aluno: ${activationUrl}`;

  const handleGenerateInvitation = async () => {
    setGenerating(true);
    soundManager.playClick();
    try {
      // Token criptográfico seguro com 192 bits de entropia sem nomes ou códigos previsíveis (Requisito 7)
      const token = generateSecureInvitationToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      const createdAt = new Date().toISOString();

      const newInv: StudentInvitation = {
        id: `inv-${Date.now()}`,
        token,
        studentId: student.id,
        studentCode: student.code,
        studentName: student.fullName,
        studentEmail: student.email || `${student.code.toLowerCase()}@aluno.sigar`,
        institutionId: student.institutionId || institution.id,
        branchId: student.branchId,
        expiresAt,
        used: false,
        createdAt,
        createdBy: institution.representativeName || 'Secretaria Geral'
      };

      await saveStudentInvitation(newInv);
      setInvitations(prev => [newInv, ...prev]);

      if (onAuditLog) {
        onAuditLog(
          'EMISSAO_CONVITE_PORTAL_ALUNO',
          `Novo token de convite gerado para ${student.fullName} (${student.code}) com validade de 30 dias.`
        );
      }

      soundManager.playSuccess();
      success('Convite Gerado', 'O link seguro de acesso ao Portal do Aluno foi criado com sucesso.');
    } catch (err: any) {
      toastError('Erro ao Gerar', err.message || 'Falha ao criar convite de acesso.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeInvitation = async (invId: string) => {
    try {
      await revokeStudentInvitation(invId);
      setInvitations(prev => prev.map(inv => inv.id === invId ? { ...inv, revoked: true } : inv));
      soundManager.playClick();
      info('Convite Revogado', 'O token de acesso selecionado foi invalidado.');
      if (onAuditLog) {
        onAuditLog(
          'REVOGACAO_CONVITE_PORTAL',
          `Convite ${invId} revogado para o formando ${student.fullName}.`
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

  const handleSendWhatsApp = () => {
    const phone = student.whatsapp || student.phone;
    if (!phone) {
      toastError('Sem Contacto', 'O formando não possui telefone ou WhatsApp cadastrado.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
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
                Acesso & Credenciais do Formando
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

        {/* Current Access Status */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Estado Atual do Acesso no Firestore
            </span>
            <div className="flex items-center gap-2">
              {student.userId ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Conta Ativa (UID Vinculado)
                </span>
              ) : latestInvitation && !latestInvitation.used && !latestInvitation.revoked && new Date(latestInvitation.expiresAt) > new Date() ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Convite Enviado (Pendente de Ativação)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Sem Acesso Ativado
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {student.email || 'Sem e-mail registado'}
              </span>
            </div>
          </div>

          <button
            onClick={handleGenerateInvitation}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
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
                    Expira em {new Date(latestInvitation.expiresAt).toLocaleDateString('pt-MZ')}
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
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    title="Testar Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500">
                  O formando abrirá esta página, verá os seus dados e definirá a palavra-passe para aceder imediatamente ao Portal do Aluno.
                </p>
              </div>
            )}

            {/* Tab 2: E-mail Pré-formatado */}
            {activeTab === 'email' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Assunto do E-mail</span>
                    <span className="text-xs text-blue-300 font-medium">{emailSubject}</span>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copiado!' : 'Copiar E-mail'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={emailBody}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono leading-relaxed focus:outline-none"
                />
              </div>
            )}

            {/* Tab 3: WhatsApp */}
            {activeTab === 'whatsapp' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Mensagem Direta via WhatsApp</span>
                  <button
                    onClick={handleSendWhatsApp}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar para {student.whatsapp || student.phone || 'Formando'}</span>
                  </button>
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
              Nenhum convite emitido até ao momento. Clique em "Gerar Novo Convite" para liberar o acesso ao Portal do Aluno.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden text-xs">
              {invitations.map(inv => {
                const isExpired = new Date(inv.expiresAt) < new Date();
                return (
                  <div key={inv.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold">{inv.token.slice(0, 16)}...</span>
                        {inv.used ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Ativado em {inv.usedAt ? new Date(inv.usedAt).toLocaleDateString('pt-MZ') : ''}
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
                            Ativo (Expira em {new Date(inv.expiresAt).toLocaleDateString('pt-MZ')})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Criado em {new Date(inv.createdAt).toLocaleString('pt-MZ')} por {inv.createdBy}
                      </span>
                    </div>

                    {!inv.used && !inv.revoked && !isExpired && (
                      <button
                        onClick={() => handleRevokeInvitation(inv.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-semibold cursor-pointer transition-colors"
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
