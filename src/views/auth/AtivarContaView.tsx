import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Building2, 
  ArrowRight, 
  Mail, 
  RefreshCw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  getStudentInvitationByToken, 
  markStudentInvitationUsed, 
  saveStudentToFirestore,
  COLLECTIONS 
} from '../../services/firestoreService';
import { StudentInvitation, Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';

interface AtivarContaViewProps {
  initialToken?: string;
  onActivated?: () => void;
}

export const AtivarContaView: React.FC<AtivarContaViewProps> = ({ 
  initialToken, 
  onActivated 
}) => {
  const { navigate, allInstitutions, setActiveInstitution } = useApp();
  const { success, error: toastError, info } = useToast();

  const [tokenInput, setTokenInput] = useState(initialToken || '');
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<StudentInvitation | null>(null);
  const [associatedStudent, setAssociatedStudent] = useState<Student | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Parse token from URL (query, pathname, or hash)
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
      setTokenInput(activeToken);
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
      const inv = await getStudentInvitationByToken(tok.trim());
      if (!inv) {
        setTokenError('Convite não encontrado ou token inválido. Verifique o link recebido por e-mail.');
        setLoading(false);
        return;
      }

      if (inv.revoked) {
        setTokenError('Este convite de acesso foi revogado pela administração escolar.');
        setLoading(false);
        return;
      }

      if (inv.used) {
        setTokenError(`Este convite já foi utilizado em ${inv.usedAt ? new Date(inv.usedAt).toLocaleDateString('pt-MZ') : 'data anterior'}. Se esqueceu a sua palavra-passe, utilize a opção de recuperação.`);
        setInvitation(inv);
        setLoading(false);
        return;
      }

      if (new Date(inv.expiresAt) < new Date()) {
        setTokenError('Este convite de acesso expirou. Solicite um novo link à secretaria da sua instituição.');
        setLoading(false);
        return;
      }

      setInvitation(inv);

      // Fetch student details from Firestore
      try {
        const studentDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, inv.studentId));
        if (studentDoc.exists()) {
          setAssociatedStudent({ ...studentDoc.data(), id: studentDoc.id } as Student);
        }
      } catch (e) {
        console.warn('Could not fetch student doc:', e);
      }
    } catch (err: any) {
      setTokenError(err.message || 'Falha ao validar o token de convite.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (password.length < 6) {
      toastError('Palavra-passe Curta', 'A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      toastError('Senhas Não Coincidem', 'A confirmação de palavra-passe não confere.');
      return;
    }

    setIsActivating(true);
    soundManager.playClick();

    try {
      let userCredential;
      try {
        // Attempt to create new user in Firebase Auth
        userCredential = await createUserWithEmailAndPassword(auth, invitation.studentEmail.trim(), password);
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          // If already in use, attempt sign-in with provided password
          try {
            userCredential = await signInWithEmailAndPassword(auth, invitation.studentEmail.trim(), password);
          } catch (signErr: any) {
            toastError('Conta Já Existente', 'O e-mail já possui uma conta no sistema. Se esqueceu sua palavra-passe, use o botão de recuperação abaixo.');
            setIsActivating(false);
            return;
          }
        } else {
          throw authErr;
        }
      }

      const uid = userCredential.user.uid;

      // Update user display name in Auth
      try {
        await updateProfile(userCredential.user, {
          displayName: invitation.studentName
        });
      } catch (e) {
        // ignore profile update error
      }

      // Create / Update User Profile in /users/{uid}
      const userProfile = {
        id: uid,
        uid: uid,
        name: invitation.studentName,
        displayName: invitation.studentName,
        email: invitation.studentEmail,
        role: 'ALUNO',
        roles: ['ALUNO'],
        institutionId: invitation.institutionId,
        branchId: invitation.branchId || 'todas',
        status: 'Ativo',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        studentId: invitation.studentId,
        studentCode: invitation.studentCode
      };
      await setDoc(doc(db, COLLECTIONS.USERS, uid), userProfile, { merge: true });

      // Link userId in student record in /students/{studentId}
      if (associatedStudent) {
        const updatedStudent: Student = {
          ...associatedStudent,
          userId: uid,
          status: associatedStudent.status === 'Pré-inscrito' ? 'Matriculado' : associatedStudent.status,
          updatedAt: new Date().toISOString(),
          auditTrail: [
            {
              id: `aud-act-${Date.now()}`,
              timestamp: new Date().toLocaleString('pt-MZ'),
              actorName: invitation.studentName,
              actorRole: 'ALUNO',
              action: 'ATIVACAO_PORTAL_ALUNO',
              details: `Conta ativada no Portal do Aluno com sucesso via convite oficial (Token ${invitation.token.slice(0, 8)}...).`
            },
            ...(associatedStudent.auditTrail || [])
          ]
        };
        await saveStudentToFirestore(updatedStudent);
      } else {
        await setDoc(doc(db, COLLECTIONS.STUDENTS, invitation.studentId), {
          userId: uid,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      // Mark token as used in Firestore
      await markStudentInvitationUsed(invitation.id, uid);

      // Switch active institution in AppContext
      const inst = allInstitutions.find(i => i.id === invitation.institutionId);
      if (inst) {
        setActiveInstitution(inst);
      }

      soundManager.playSuccess();
      setActivatedSuccess(true);
      success('Conta Ativada!', 'O seu acesso ao Portal do Aluno foi configurado com sucesso!');

      if (onActivated) {
        onActivated();
      }
    } catch (err: any) {
      console.error('Error activating student account:', err);
      toastError('Erro na Ativação', err.message || 'Falha ao ativar a conta. Tente novamente.');
    } finally {
      setIsActivating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!invitation?.studentEmail) return;
    try {
      await sendPasswordResetEmail(auth, invitation.studentEmail);
      setResetEmailSent(true);
      info('E-mail Enviado', `Um link de redefinição de palavra-passe foi enviado para ${invitation.studentEmail}.`);
    } catch (err: any) {
      toastError('Erro ao Enviar', err.message || 'Falha ao enviar e-mail de redefinição.');
    }
  };

  const institutionObj = allInstitutions.find(i => i.id === invitation?.institutionId);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-[#0d1527] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Institutional Branding */}
        <div className="text-center space-y-2 border-b border-slate-800/80 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Ativação de Acesso — Portal do Aluno
          </h1>
          <p className="text-xs text-slate-400">
            {institutionObj?.name || 'SIGAR PRO — Sistema Integrado de Gestão Acadêmica'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">A validar token oficial de convite...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && tokenError && !activatedSuccess && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Validação do Convite</span>
              </div>
              <p className="text-xs leading-relaxed">{tokenError}</p>
            </div>

            {invitation && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <p className="text-xs text-slate-400">
                  Já possui palavra-passe cadastrada para este formando (<strong className="text-white">{invitation.studentEmail}</strong>)?
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handlePasswordReset}
                    disabled={resetEmailSent}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{resetEmailSent ? 'E-mail de Recuperação Enviado!' : 'Recuperar Palavra-passe'}</span>
                  </button>
                  <button
                    onClick={() => navigate('portal_aluno')}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Ir ao Login
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('public_portal')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Voltar ao Portal Público
            </button>
          </div>
        )}

        {/* Success State */}
        {activatedSuccess && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Conta Ativada com Sucesso!</h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Olá, <strong className="text-emerald-400">{invitation?.studentName}</strong>! Sua palavra-passe foi gravada e seu acesso ao Portal do Aluno está 100% liberado.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left font-mono text-xs space-y-1">
              <div className="text-slate-400">Código de Aluno: <span className="text-emerald-400 font-bold">{invitation?.studentCode}</span></div>
              <div className="text-slate-400">E-mail: <span className="text-white">{invitation?.studentEmail}</span></div>
              <div className="text-slate-400">Instituição: <span className="text-blue-400">{institutionObj?.name || 'CFTPM Moztechwave'}</span></div>
            </div>

            <button
              onClick={() => navigate('portal_aluno')}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
            >
              <span>Aceder ao Meu Portal do Aluno</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Activation Form */}
        {!loading && !tokenError && !activatedSuccess && invitation && (
          <form onSubmit={handleActivateAccount} className="space-y-4">
            {/* Student Dossier Badge */}
            <div className="p-4 rounded-2xl bg-[#090e1a] border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Dossiê Escolar Vinculado
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {invitation.studentCode}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{invitation.studentName}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{invitation.studentEmail}</span>
              </p>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Criar Palavra-passe de Acesso <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Confirmar Palavra-passe <span className="text-rose-400">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a palavra-passe"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Esta palavra-passe será a sua credencial oficial para entrar no Portal do Aluno em qualquer dispositivo. Guarde-a em local seguro.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isActivating}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isActivating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A Ativar Acesso...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Ativar Minha Conta & Entrar</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
