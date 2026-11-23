import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  Mail,
  RefreshCw,
  Sparkles,
  KeyRound,
  UserCheck
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { Institution, UserInvitation } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';
import {
  LEGACY_STUDENT_INVITATIONS_COLLECTION,
  USER_INVITATIONS_COLLECTION,
  consumeUserInvitationViaServer,
  fetchInviteByToken,
  validateInviteActivationState,
  validatePasswordStrength
} from '../../services/inviteAuthService';
import { getDefaultRouteForRole, getRoleDisplayName } from '../../security/routeSecurity';

interface AtivarContaViewProps {
  initialToken?: string;
  onActivated?: () => void;
}

export const AtivarContaView: React.FC<AtivarContaViewProps> = ({
  initialToken,
  onActivated
}) => {
  const { navigate, allInstitutions, setActiveInstitution, setActiveRole } = useApp();
  const { success, error: toastError, info } = useToast();

  const [tokenValue, setTokenValue] = useState(initialToken || '');
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<UserInvitation | null>(null);
  const [sourceCollection, setSourceCollection] = useState<
    typeof USER_INVITATIONS_COLLECTION | typeof LEGACY_STUDENT_INVITATIONS_COLLECTION | null
  >(null);
  const [resolvedInstitutionName, setResolvedInstitutionName] = useState<string>('');
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    let activeToken = initialToken;
    if (!activeToken && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      activeToken = urlParams.get('token') || undefined;
      if (!activeToken && window.location.pathname.startsWith('/ativar-conta')) {
        const parts = window.location.pathname.split('/');
        if (parts[2]) activeToken = decodeURIComponent(parts[2]);
      }
      if (!activeToken && window.location.hash.includes('token=')) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          activeToken = hashParams.get('token') || undefined;
        }
      }
    }

    if (activeToken) {
      setTokenValue(activeToken);
      validateToken(activeToken);
    } else {
      setLoading(false);
      setTokenError('Nenhum código ou token de convite fornecido.');
    }
  }, [initialToken]);

  const validateToken = async (tok: string) => {
    setLoading(true);
    setTokenError(null);
    try {
      const { invitation: inv, sourceCollection: src } = await fetchInviteByToken(tok.trim());
      setInvitation(inv);
      setSourceCollection(src);

      const check = validateInviteActivationState(inv);
      if (!check.valid) {
        setTokenError(check.message || 'Convite inválido.');
        setLoading(false);
        return;
      }

      if (inv) {
        const localInst = allInstitutions.find((i) => i.id === inv.institutionId);
        if (localInst) {
          setResolvedInstitutionName(localInst.name);
        } else if (inv.institutionName) {
          setResolvedInstitutionName(inv.institutionName);
        } else if (inv.institutionId) {
          try {
            const instSnap = await getDoc(doc(db, 'institutions', inv.institutionId));
            if (instSnap.exists()) {
              setResolvedInstitutionName((instSnap.data() as Institution).name || inv.institutionId);
            }
          } catch {
            // fallback silencioso
          }
        }
      }
    } catch (err: any) {
      setTokenError(err?.message || 'Falha ao validar o token de convite.');
    } finally {
      setLoading(false);
    }
  };

  const passwordCheck = validatePasswordStrength(password);

  const finalizeVerifiedActivation = async () => {
    if (!invitation) return;
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Sessão Firebase não encontrada. Volte a iniciar o passo anterior.');
    }

    await currentUser.reload();
    const freshUser = auth.currentUser;
    if (!freshUser || !freshUser.emailVerified) {
      setAwaitingEmailVerification(true);
      throw new Error(
        `O e-mail ${invitation.email} ainda não foi verificado. Abra a mensagem enviada para a sua caixa de correio e clique no link de confirmação antes de concluir.`
      );
    }

    // Força renovação do JWT para garantir email_verified: true antes de chamar a Cloud Function
    await freshUser.getIdToken(true);

    const serverResult = await consumeUserInvitationViaServer(invitation.token, {
      emailVerified: freshUser.emailVerified
    });

    // Renova novamente o token para obter os novos Custom Claims (role + institutionId)
    await freshUser.getIdToken(true);

    const instObj = allInstitutions.find((i) => i.id === serverResult.institutionId);
    if (instObj) {
      setActiveInstitution(instObj);
    }
    setActiveRole(serverResult.role || invitation.role);

    soundManager.playSuccess();
    setAwaitingEmailVerification(false);
    setActivatedSuccess(true);
    success(
      'Conta Activada!',
      `O seu e-mail foi confirmado e o perfil (${getRoleDisplayName(serverResult.role || invitation.role)}) foi activado no servidor.`
    );
  };

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !sourceCollection) return;

    if (!passwordCheck.valid) {
      toastError('Palavra-passe Fraca', passwordCheck.errors[0] || 'A senha deve ser mais forte.');
      return;
    }

    if (password !== confirmPassword) {
      toastError('Senhas Não Coincidem', 'A confirmação de palavra-passe não confere.');
      return;
    }

    setIsActivating(true);
    soundManager.playClick();

    try {
      const cleanEmail = invitation.email.trim().toLowerCase();
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
          } catch {
            toastError(
              'Conta Já Existente',
              'Este e-mail já possui uma palavra-passe no sistema. Se não se lembra, utilize "Recuperar Palavra-passe" abaixo.'
            );
            setIsActivating(false);
            return;
          }
        } else {
          throw authErr;
        }
      }

      const authUser = userCredential.user;
      if ((authUser.email || '').trim().toLowerCase() !== cleanEmail) {
        throw new Error('O e-mail autenticado não corresponde ao e-mail autorizado neste convite.');
      }

      try {
        await updateProfile(authUser, { displayName: invitation.fullName });
      } catch {
        // non-blocking
      }

      await authUser.reload();
      if (!authUser.emailVerified) {
        await sendEmailVerification(authUser);
        setAwaitingEmailVerification(true);
        info(
          'Confirme o Seu E-mail',
          `Enviámos um link de verificação para ${cleanEmail}. A activação só será concluída após clicar nesse link.`
        );
        return;
      }

      await finalizeVerifiedActivation();
    } catch (err: any) {
      console.error('Error activating invited account:', err);
      toastError('Erro na Activação', err?.message || 'Falha ao activar a conta. Tente novamente.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleCheckEmailVerifiedAndFinalize = async () => {
    setIsActivating(true);
    try {
      await finalizeVerifiedActivation();
    } catch (err: any) {
      soundManager.playError();
      toastError('Verificação Pendente', err?.message || 'Confirme o link no seu e-mail primeiro.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    setResendingVerification(true);
    try {
      await sendEmailVerification(auth.currentUser);
      info('E-mail Reenviado', `Novo link de verificação enviado para ${invitation?.email}.`);
    } catch (err: any) {
      toastError('Erro ao Reenviar', err?.message || 'Aguarde alguns momentos antes de reenviar.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!invitation?.email) return;
    try {
      await sendPasswordResetEmail(auth, invitation.email);
      setResetEmailSent(true);
      info('E-mail Enviado', `Instruções de redefinição enviadas para ${invitation.email}.`);
    } catch (err: any) {
      toastError('Erro ao Enviar', err?.message || 'Falha ao enviar e-mail de redefinição.');
    }
  };

  const handleEnterDashboard = () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/ativar-conta')) {
      window.history.pushState(null, '', '/');
    }
    if (invitation?.role) {
      navigate(getDefaultRouteForRole(invitation.role));
    } else if (onActivated) {
      onActivated();
    } else {
      navigate('public_portal');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-[#0d1527] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2 border-b border-slate-800/80 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center mx-auto text-white shadow-lg shadow-sky-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Activação de Conta — Convite SIGAR PRO
          </h1>
          <p className="text-xs text-slate-400">
            {resolvedInstitutionName || 'Plataforma Integrada de Gestão Académica'}
          </p>
        </div>

        {/* Manual token input when user visits /ativar-conta without query */}
        {!loading && tokenError && !invitation && !activatedSuccess && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (tokenValue.trim()) validateToken(tokenValue.trim());
            }}
            className="space-y-3"
          >
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Validação do Convite</span>
              </div>
              <p className="text-xs leading-relaxed">{tokenError}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenValue}
                onChange={(e) => setTokenValue(e.target.value)}
                placeholder="Cole o token do convite recebido..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
              >
                Validar
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.location.pathname.startsWith('/ativar-conta')) {
                  window.history.pushState(null, '', '/');
                }
                navigate('public_portal');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Voltar ao Portal Público
            </button>
          </form>
        )}

        {loading && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">A validar token único de convite...</p>
          </div>
        )}

        {/* Convite encontrado mas inválido/usado/revogado/expirado */}
        {!loading && tokenError && invitation && !activatedSuccess && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Convite Indisponível</span>
              </div>
              <p className="text-xs leading-relaxed">{tokenError}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400">
                Já activou anteriormente a sua conta para <strong className="text-white">{invitation.email}</strong>?
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resetEmailSent}
                  className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>{resetEmailSent ? 'E-mail Enviado!' : 'Recuperar Senha'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/ativar-conta')) {
                      window.history.pushState(null, '', '/');
                    }
                    navigate('public_portal');
                  }}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Ir ao Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sucesso */}
        {activatedSuccess && invitation && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Conta Activada com Sucesso!</h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Olá, <strong className="text-emerald-400">{invitation.fullName}</strong>! O seu perfil como{' '}
                <strong className="text-sky-300">{getRoleDisplayName(invitation.role)}</strong> está activo.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left font-mono text-xs space-y-1">
              <div className="text-slate-400">E-mail: <span className="text-white">{invitation.email}</span></div>
              <div className="text-slate-400">Perfil: <span className="text-emerald-400 font-bold">{getRoleDisplayName(invitation.role)}</span></div>
              <div className="text-slate-400">Instituição: <span className="text-sky-400">{resolvedInstitutionName || invitation.institutionId}</span></div>
            </div>

            <button
              type="button"
              onClick={handleEnterDashboard}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
            >
              <span>Entrar no Meu Painel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Aguardando confirmação efectiva de email_verified */}
        {!loading && !tokenError && awaitingEmailVerification && !activatedSuccess && invitation && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                <Mail className="w-5 h-5 shrink-0" />
                <span>Confirmação de E-mail Obrigatória</span>
              </div>
              <p className="text-xs leading-relaxed">
                A sua palavra-passe foi criada, mas por segurança o convite só será activado após confirmar o link enviado para{' '}
                <strong className="text-white">{invitation.email}</strong>.
              </p>
              <p className="text-[11px] text-amber-300/80">
                1. Abra a sua caixa de correio (verifique também Spam/Lixo).
                <br />
                2. Clique no link de confirmação do Firebase.
                <br />
                3. Volte aqui e clique em <strong>&quot;Já Confirmei o Meu E-mail&quot;</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCheckEmailVerifiedAndFinalize}
              disabled={isActivating}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isActivating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A Validar Confirmação no Servidor...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Já Confirmei o Meu E-mail — Concluir Activação</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendVerificationEmail}
              disabled={resendingVerification}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {resendingVerification ? 'A reenviar...' : 'Reenviar E-mail de Verificação'}
            </button>
          </div>
        )}

        {/* Formulário de Activação */}
        {!loading && !tokenError && !awaitingEmailVerification && !activatedSuccess && invitation && (
          <form onSubmit={handleActivateAccount} className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#090e1a] border border-sky-500/20 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Convite Oficial Validado
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {getRoleDisplayName(invitation.role)}
                </span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                {invitation.fullName}
              </h3>
              <div className="grid grid-cols-1 gap-1 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{invitation.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{resolvedInstitutionName || invitation.institutionId}</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/70">
                Permissões atribuídas: {invitation.permissions?.length || 0} • Expira em{' '}
                {new Date(invitation.expiresAt).toLocaleDateString('pt-MZ')}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Definir Palavra-passe Segura <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres (letras + número/símbolo)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="grid grid-cols-5 gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`rounded-full ${
                          passwordCheck.score >= lvl
                            ? passwordCheck.valid
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  {!passwordCheck.valid && (
                    <p className="text-[11px] text-amber-400">{passwordCheck.errors[0]}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Confirmar Palavra-passe <span className="text-rose-400">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a palavra-passe"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                Este link é de uso único. Após a activação, utilize o login único do SIGAR PRO com o seu e-mail e palavra-passe.
              </span>
            </div>

            <button
              type="submit"
              disabled={isActivating}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isActivating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A Activar Conta...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Activar Minha Conta &amp; Continuar</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
