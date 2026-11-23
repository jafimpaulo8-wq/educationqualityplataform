import React, { useState, useEffect } from 'react';
import {
  Lock,
  KeyRound,
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  X,
  HelpCircle,
  Loader2,
  UserPlus
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { soundManager } from '../../utils/audio';
import { checkIsSuperAdmin, getUserInstitutions } from '../../services/firestoreService';
import { getDefaultRouteForRole } from '../../security/routeSecurity';
import { CEU_AZUL_INSTITUTION } from '../../data/ceuAzulData';

interface SigarAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'google' | 'credentials' | 'new_inst';
}

type AuthLoginTab = 'credentials' | 'google';

export const SigarAuthModal: React.FC<SigarAuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'credentials'
}) => {
  const {
    loginWithGoogle,
    allInstitutions,
    setActiveInstitution,
    setActiveBranchId,
    setActiveRole,
    setHasSigarProfile,
    navigate,
    addNotification,
    themeMode
  } = useApp();

  const isLight = themeMode === 'branco';

  const [activeTab, setActiveTab] = useState<AuthLoginTab>(
    defaultMode === 'google' ? 'google' : 'credentials'
  );
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [unassignedAccount, setUnassignedAccount] = useState<{
    email: string;
    uid: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEmailInput('');
      setPasswordInput('');
      setFeedback(null);
      setUnassignedAccount(null);
      setShowHelpModal(false);
      setResetSent(false);
    } else {
      setActiveTab(defaultMode === 'google' ? 'google' : 'credentials');
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  /**
   * Resolução automática e única pós-autenticação:
   * Lê /users/{uid}, resolve instituição + papel autorizado e encaminha directamente ao painel correspondente.
   * Sem selecção manual de papel nem criação automática de perfis sem convite.
   */
  const completeAuthenticatedEntry = async (user: any) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    const isSuper =
      (user.email === 'moztechwavenacala8@gmail.com' && user.emailVerified === true) ||
      (await checkIsSuperAdmin(user.uid));

    // 1. SUPER_ADMIN Soberano (moztechwavenacala8@gmail.com com e-mail verificado)
    if (user.email === 'moztechwavenacala8@gmail.com') {
      if (!user.emailVerified) {
        soundManager.playError();
        setFeedback({
          success: false,
          message: 'A conta Super Admin requer e-mail verificado no Firebase Auth.'
        });
        return;
      }
      const existingData = userDocSnap.exists() ? userDocSnap.data() : {};
      const superInstId = (existingData?.lastInstitutionId || existingData?.institutionId || '').trim();
      const superAdminProfile = {
        id: user.uid,
        uid: user.uid,
        name: existingData?.name || 'Super Admin Global',
        displayName: existingData?.displayName || 'Super Admin Global',
        email: 'moztechwavenacala8@gmail.com',
        role: 'SUPER_ADMIN' as UserRole,
        roles: [
          'SUPER_ADMIN' as UserRole,
          'DIRETOR' as UserRole,
          'SECRETARIA' as UserRole,
          'FINANCEIRO' as UserRole,
          'PROFESSOR' as UserRole,
          'PORTEIRO' as UserRole
        ],
        institutionId: superInstId,
        status: 'aprovado',
        branchId: existingData?.branchId || 'todas',
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userDocRef, superAdminProfile, { merge: true });
      await setDoc(
        doc(db, 'admins', user.uid),
        {
          email: user.email,
          role: 'SUPER_ADMIN',
          grantedAt: new Date().toISOString()
        },
        { merge: true }
      );
      setActiveRole('SUPER_ADMIN');
      setHasSigarProfile(true);
      soundManager.playSuccess();
      addNotification({
        title: 'Super Admin Global Conectado',
        message: 'Sessão iniciada como Super Administrador Global.',
        type: 'success'
      });
      onClose();
      navigate('moztechwave_core');
      return;
    }

    // 2. Utilizador com perfil existente no Firestore /users/{uid}
    if (userDocSnap.exists()) {
      const udata = userDocSnap.data();
      const isJafim = user.email === 'jafimpaulo8@gmail.com';
      const rawRoles: UserRole[] =
        Array.isArray(udata.roles) && udata.roles.length > 0
          ? udata.roles
          : udata.role
            ? [udata.role as UserRole]
            : ['VISITANTE'];

      const sanitizedRoles = isSuper
        ? rawRoles
        : rawRoles.filter((r) => {
            const upper = String(r).toUpperCase();
            return upper !== 'SUPER_ADMIN' && upper !== 'SUPERADMIN';
          });

      const authorizedRoles: UserRole[] = isSuper
        ? sanitizedRoles.includes('SUPER_ADMIN')
          ? sanitizedRoles
          : ['SUPER_ADMIN', ...sanitizedRoles]
        : isJafim
          ? ['DIRETOR']
          : sanitizedRoles.length > 0
            ? sanitizedRoles
            : ['VISITANTE'];

      const primaryRole = authorizedRoles[0];
      const institutionId = isJafim ? 'ceu-azul-nacala' : (udata.institutionId || '');
      const branchId = isJafim
        ? udata.branchId || 'branch-ceu-azul-main'
        : udata.branchId || 'todas';

      if (isJafim) {
        setActiveInstitution(CEU_AZUL_INSTITUTION);
      } else if (institutionId) {
        try {
          const insts = await getUserInstitutions(user.uid, institutionId);
          const targetInst =
            insts.find((i) => i.id === institutionId) ||
            allInstitutions.find((i) => i.id === institutionId) ||
            insts[0];
          if (targetInst) {
            setActiveInstitution(targetInst);
          }
        } catch {
          const fallbackLocal = allInstitutions.find((i) => i.id === institutionId);
          if (fallbackLocal) setActiveInstitution(fallbackLocal);
        }
      }

      setActiveBranchId(branchId);
      setActiveRole(primaryRole);
      setHasSigarProfile(true);

      try {
        await setDoc(
          userDocRef,
          { lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch {
        // non-blocking
      }

      soundManager.playSuccess();
      navigate(getDefaultRouteForRole(primaryRole));
      onClose();
      return;
    }

    // 3. Sem documento em /users/{uid}: não inventa papel nem instituição
    soundManager.playError();
    setUnassignedAccount({
      email: user.email || '',
      uid: user.uid
    });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setFeedback(null);
    setUnassignedAccount(null);
    try {
      const user = await loginWithGoogle();
      if (!user) return;
      await completeAuthenticatedEntry(user);
    } catch (err: any) {
      console.error('Google login error:', err);
      const isDomainError =
        err?.code === 'auth/unauthorized-domain' ||
        (err?.message &&
          (err.message.includes('unauthorized domain') ||
            err.message.includes('authorized domain')));
      setFeedback({
        success: false,
        message: isDomainError
          ? 'Domínio pendente de autorização no Firebase Auth. Utilize E-mail e Senha ou contacte o suporte.'
          : err?.message || 'Falha ao autenticar com o Google.'
      });
      soundManager.playError();
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) {
      setFeedback({ success: false, message: 'Por favor preencha o seu e-mail e palavra-passe.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    setUnassignedAccount(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailInput.trim(),
        passwordInput
      );
      await completeAuthenticatedEntry(userCredential.user);
    } catch (err: any) {
      console.error('Credentials auth error:', err);
      let msg = 'Credenciais inválidas. Verifique o seu e-mail e palavra-passe.';
      if (err.code === 'auth/user-not-found') msg = 'Nenhuma conta activada encontrada com este e-mail.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'E-mail ou palavra-passe incorrectos.';
      }
      if (err.code === 'auth/too-many-requests') {
        msg = 'Demasiadas tentativas seguidas. Aguarde alguns instantes ou recupere a sua senha.';
      }
      setFeedback({ success: false, message: msg });
      soundManager.playError();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailInput.trim()) {
      setFeedback({
        success: false,
        message: 'Digite o seu e-mail para receber as instruções de recuperação.'
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, emailInput.trim());
      setResetSent(true);
      setFeedback({
        success: true,
        message: `Instruções de recuperação enviadas para ${emailInput.trim()}.`
      });
    } catch {
      setFeedback({
        success: false,
        message: 'Não foi possível enviar o e-mail de recuperação. Verifique o endereço digitado.'
      });
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-fadeIn ${
        isLight ? 'bg-slate-900/50' : 'bg-slate-950/85'
      }`}
    >
      <div
        className={`relative w-full max-w-4xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700/80 text-white'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Painel Institucional Esquerdo */}
        <div className="hidden md:flex md:w-5/12 flex-col justify-between p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 border-r border-slate-800 text-white select-none">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center p-0.5 shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-sky-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                  SIGAR<span className="text-sky-400">PRO</span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Plataforma de Gestão Académica
                </p>
              </div>
            </div>

            <div className="mt-8 mb-8 p-4 rounded-2xl bg-sky-950/40 border border-sky-800/30">
              <h2 className="text-lg font-bold text-white leading-snug">
                &ldquo;Acesso único.<br />
                <span className="text-sky-400">Convite oficial.</span><br />
                Zero escalação de privilégios.&rdquo;
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Todas as contas institucionais são provisionadas por convite nominal emitido pela administração autorizada.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encaminhamento automático para o seu painel</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Isolamento rigoroso por instituição</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Activação segura com token de uso único</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Certificação SIVEC e Portal Financeiro integrados</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>SIGAR PRO • Moçambique</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">Autenticação Única</span>
          </div>
        </div>

        {/* Painel de Autenticação Direito */}
        <div
          className={`flex-1 p-6 sm:p-10 flex flex-col justify-between overflow-y-auto ${
            isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
          }`}
        >
          <div>
            <div className="mb-6">
              <h2 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                Iniciar Sessão
              </h2>
              <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Entre com a sua conta activada por convite. O seu perfil e instituição são identificados automaticamente.
              </p>
            </div>

            {feedback && (
              <div
                className={`mb-5 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  feedback.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                }`}
              >
                {feedback.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {unassignedAccount ? (
              <div className="space-y-4 py-2 animate-fadeIn">
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isLight
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Conta Sem Convite ou Vínculo Institucional</span>
                  </div>
                  <p className="leading-relaxed">
                    O e-mail <strong className="font-mono">{unassignedAccount.email}</strong> autenticou no Firebase Auth, mas não possui um perfil SIGAR activo no Firestore. Solicite um link de convite à administração da sua instituição.
                  </p>
                  <div className="text-[11px] font-mono opacity-80">UID: {unassignedAccount.uid}</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('ativar_conta');
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Tenho um Token de Convite</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnassignedAccount(null)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    Voltar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border mb-6 ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('credentials');
                      setFeedback(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeTab === 'credentials'
                        ? 'bg-sky-600 text-white shadow-md'
                        : isLight
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-mail &amp; Senha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('google');
                      setFeedback(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeTab === 'google'
                        ? 'bg-sky-600 text-white shadow-md'
                        : isLight
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Conta Google</span>
                  </button>
                </div>

                {activeTab === 'credentials' && (
                  <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-1.5 ${
                          isLight ? 'text-slate-700' : 'text-slate-300'
                        }`}
                      >
                        Endereço de E-mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="utilizador@instituicao.ac.mz"
                          required
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors ${
                            isLight
                              ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500'
                              : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-sky-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          className={`text-xs font-semibold ${
                            isLight ? 'text-slate-700' : 'text-slate-300'
                          }`}
                        >
                          Palavra-passe
                        </label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={resetSent}
                          className="text-[11px] text-sky-500 hover:text-sky-600 transition-colors cursor-pointer"
                        >
                          {resetSent ? 'E-mail de recuperação enviado' : 'Recuperar palavra-passe'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors ${
                            isLight
                              ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500'
                              : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-sky-500'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      <span>{loading ? 'A validar acesso...' : 'Entrar no Sistema'}</span>
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>
                )}

                {activeTab === 'google' && (
                  <div className="space-y-5 py-2">
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Inicie sessão com a sua conta Google previamente associada ao seu perfil institucional SIGAR PRO.
                    </p>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer disabled:opacity-50 border ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                          : 'bg-white hover:bg-slate-100 text-slate-900 border-transparent'
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      )}
                      <span>{loading ? 'A autenticar...' : 'Entrar com Google'}</span>
                    </button>

                    <div
                      className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <ShieldCheck className="w-4 h-4 text-sky-500" />
                        <span>Resolução Automática de Perfil</span>
                      </div>
                      Após autenticar, o SIGAR PRO valida o seu documento no Firestore e abre directamente o seu painel autorizado.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Rodapé Limpo: Activação por Convite + Ajuda */}
          <div
            className={`mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
              isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('ativar_conta');
              }}
              className="flex items-center gap-1.5 text-sky-500 hover:text-sky-600 font-semibold transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Recebeu um convite? Activar conta</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLight ? 'hover:text-slate-800' : 'hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ajuda &amp; Suporte</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Ajuda & Suporte */}
      {showHelpModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold">Como Aceder ao SIGAR PRO</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Por política de segurança multi-instituição, novas contas são criadas exclusivamente através de{' '}
                <strong className="text-white">convite oficial emitido pela sua instituição</strong>.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <div>• <strong className="text-slate-200">1.</strong> Receba o link <code className="text-sky-400">/ativar-conta?token=...</code> da secretaria ou direcção.</div>
                <div>• <strong className="text-slate-200">2.</strong> Defina a sua palavra-passe pessoal segura.</div>
                <div>• <strong className="text-slate-200">3.</strong> Utilize este login único com e-mail e palavra-passe.</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Suporte Moztechwave: <span className="text-white">suporte@moztechwave.co.mz</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
