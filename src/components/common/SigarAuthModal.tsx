import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  KeyRound, 
  Mail, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  User, 
  GraduationCap, 
  Briefcase, 
  DollarSign, 
  ClipboardList, 
  DoorOpen, 
  X, 
  CreditCard, 
  Search, 
  ChevronRight,
  School,
  MapPin,
  Check,
  ShieldAlert,
  HelpCircle,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../services/firebase';
import { useApp } from '../../context/AppContext';
import { UserRole, Institution } from '../../types';
import { soundManager } from '../../utils/audio';
import { authService } from '../../auth/authService';
import { checkIsSuperAdmin, getUserProfile, getUserInstitutions } from '../../services/firestoreService';
import { toCanonicalRole } from '../../types/rbac';
import { getDefaultRouteForRole, getRoleDisplayName } from '../../security/routeSecurity';
import { 
  CEU_AZUL_INSTITUTION_ID,
  CEU_AZUL_INSTITUTION, 
  CEU_AZUL_ACCESS_CODES, 
  CEU_AZUL_DIRECTOR, 
  CEU_AZUL_CEO, 
  CEU_AZUL_STUDENTS 
} from '../../data/ceuAzulData';
import { bootstrapCeuAzul } from '../../services/ceuAzulBootstrap';

interface SigarAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'google' | 'credentials' | 'code' | 'new_inst';
}

type AuthStep = 1 | 2 | 3;
type AuthLoginTab = 'google' | 'credentials' | 'code';

export const SigarAuthModal: React.FC<SigarAuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'google'
}) => {
  const { 
    loginWithGoogle, 
    firebaseUser, 
    allInstitutions, 
    activeInstitution,
    setActiveInstitution, 
    activeBranchId,
    setActiveBranchId,
    setActiveRole, 
    navigate,
    addNotification,
    addInstitution,
    students,
    loginStudentByCode,
    themeMode
  } = useApp();

  const isLight = themeMode === 'branco';

  // Wizard Steps:
  // Step 1: Login (Google, Email/Senha, Código de Acesso)
  // Step 2: Tela 2 — "Como pretende aceder ao SIGAR?" (Verificação real RBAC)
  // Step 3: Tela 3 — Seleção de Instituição & Filial real
  const [currentStep, setCurrentStep] = useState<AuthStep>(1);

  // Step 1 state - strictly unpopulated inputs for privacy (PARTE 3 & PARTE 6)
  const [activeTab, setActiveTab] = useState<AuthLoginTab>(defaultMode === 'code' ? 'code' : defaultMode === 'credentials' ? 'credentials' : 'google');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [keepSessionActive, setKeepSessionActive] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Sub-modal for registering new institution or requesting help
  const [showNewInstModal, setShowNewInstModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Authenticated user session state (from Firebase Auth & Firestore)
  const [authSession, setAuthSession] = useState<{
    uid: string;
    email: string;
    name?: string;
    isSuperAdmin: boolean;
    authorizedRoles: UserRole[];
    institutionId: string;
    branchId: string;
  } | null>(null);

  const [unassignedAccount, setUnassignedAccount] = useState<{
    email: string;
    uid: string;
  } | null>(null);

  // User-associated institutions list (only real ones from Firestore)
  const [userInstitutions, setUserInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  // Step 2: Chosen Access Role & Access Denial state
  const [chosenRole, setChosenRole] = useState<UserRole>('DIRETOR');
  const [roleAccessDenied, setRoleAccessDenied] = useState<string | null>(null);

  // Step 3: Selected Institution & Branch
  const [selectedInstId, setSelectedInstId] = useState<string>('');
  const [selectedBranchId, setLocalBranchId] = useState<string>('todas');

  // New Institution Registration Form State
  const [newInstName, setNewInstName] = useState('');
  const [newInstNuit, setNewInstNuit] = useState('');
  const [newInstRep, setNewInstRep] = useState('');
  const [newInstEmail, setNewInstEmail] = useState('');
  const [newInstPhone, setNewInstPhone] = useState('');
  const [newInstCity, setNewInstCity] = useState('Maputo');
  const [newInstProvince, setNewInstProvince] = useState('Maputo Cidade');

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setCurrentStep(1);
      setEmailInput('');
      setPasswordInput('');
      setAccessCodeInput('');
      setFeedback(null);
      setRoleAccessDenied(null);
      setShowNewInstModal(false);
      setShowHelpModal(false);
    } else {
      if (defaultMode === 'code') {
        setActiveTab('code');
      } else if (defaultMode === 'credentials') {
        setActiveTab('credentials');
      }
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  // Transition after authentication
  const proceedAfterAuth = async (session: {
    uid: string;
    email: string;
    name?: string;
    isSuperAdmin: boolean;
    authorizedRoles: UserRole[];
    institutionId: string;
    branchId: string;
  }) => {
    setAuthSession(session);
    setLoading(true);
    setLoadingInstitutions(true);
    setUnassignedAccount(null);
    try {
      const insts = await getUserInstitutions(session.uid, session.institutionId);
      setUserInstitutions(insts);
      if (insts.length === 1) {
        setSelectedInstId(insts[0].id);
      } else if (insts.length > 1) {
        setSelectedInstId(session.institutionId || insts[0].id);
      } else {
        setSelectedInstId('');
      }

      if (session.authorizedRoles.length === 1) {
        // Single authorized role: Skip role selection (Section 3 of prompt)
        setChosenRole(session.authorizedRoles[0]);
        setCurrentStep(3);
      } else {
        // Multiple authorized roles: Let user choose which authorized role to assume
        setChosenRole(session.authorizedRoles[0]);
        setCurrentStep(2);
      }
    } catch (e) {
      console.warn('Error loading user institutions:', e);
      setUserInstitutions([]);
      if (session.authorizedRoles.length === 1) {
        setChosenRole(session.authorizedRoles[0]);
        setCurrentStep(3);
      } else {
        setChosenRole(session.authorizedRoles[0]);
        setCurrentStep(2);
      }
    } finally {
      setLoading(false);
      setLoadingInstitutions(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setFeedback(null);
    setUnassignedAccount(null);
    try {
      const user = await loginWithGoogle();
      if (!user) {
        setLoading(false);
        return;
      }

      // Query Firestore for user profile
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      const isSuper = (await checkIsSuperAdmin(user.uid));

      // 1. DIRETOR: Jafim Paulo Rupia (Centro Infantil Céu Azul)
      if (user.email === 'jafimpaulo8@gmail.com') {
        const directorProfile = {
          id: user.uid,
          uid: user.uid,
          name: 'Jafim Paulo Rupia',
          displayName: 'Jafim Paulo Rupia (Diretor)',
          email: 'jafimpaulo8@gmail.com',
          role: 'DIRETOR' as UserRole,
          roles: ['DIRETOR' as UserRole],
          institutionId: 'ceu-azul-nacala',
          institutionIds: ['ceu-azul-nacala'],
          status: 'aprovado',
          codigoAcesso: 'CEU-AZUL-DIR-001',
          branchId: 'branch-ceu-azul-main',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, directorProfile, { merge: true });
        setActiveInstitution(CEU_AZUL_INSTITUTION);
        setActiveRole('DIRETOR');
        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email,
          name: 'Jafim Paulo Rupia',
          isSuperAdmin: false,
          authorizedRoles: ['DIRETOR'],
          institutionId: 'ceu-azul-nacala',
          branchId: 'branch-ceu-azul-main'
        });
        addNotification({
          title: 'Acesso do Diretor Confirmado',
          message: 'Bem-vindo, Diretor Jafim Paulo Rupia (Centro Infantil Céu Azul).',
          type: 'success'
        });
        onClose();
        navigate('centro_dashboard');
        return;
      }

      // 2. CEO: Alfredo Andrade (Centro Infantil Céu Azul)
      if (user.email === 'andradaalfred02308@gmail.com') {
        const ceoProfile = {
          id: user.uid,
          uid: user.uid,
          name: 'Alfredo Andrade',
          displayName: 'Alfredo Andrade (CEO)',
          email: 'andradaalfred02308@gmail.com',
          role: 'CEO' as UserRole,
          roles: ['CEO' as UserRole],
          institutionId: 'ceu-azul-nacala',
          institutionIds: ['ceu-azul-nacala'],
          ownedInstitutions: ['ceu-azul-nacala'],
          status: 'aprovado',
          codigoAcesso: 'CEU-AZUL-CEO-001',
          branchId: 'branch-ceu-azul-main',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, ceoProfile, { merge: true });
        setActiveInstitution(CEU_AZUL_INSTITUTION);
        setActiveRole('CEO');
        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email,
          name: 'Alfredo Andrade',
          isSuperAdmin: false,
          authorizedRoles: ['CEO'],
          institutionId: 'ceu-azul-nacala',
          branchId: 'branch-ceu-azul-main'
        });
        addNotification({
          title: 'Acesso do CEO Confirmado',
          message: 'Bem-vindo, CEO Alfredo Andrade (Centro Infantil Céu Azul).',
          type: 'success'
        });
        onClose();
        navigate('centro_dashboard');
        return;
      }

      // 3. SECRETARIA: Egas Paulo (CFTPM Moztechwave)
      if (user.email === 'centromoz8@gmail.com') {
        const secProfile = {
          id: user.uid,
          uid: user.uid,
          name: 'Egas Paulo',
          displayName: 'Egas Paulo (Secretaria)',
          email: 'centromoz8@gmail.com',
          role: 'SECRETARIA' as UserRole,
          roles: ['SECRETARIA' as UserRole],
          institutionId: 'inst-1',
          institutionIds: ['inst-1', 'moztechwave'],
          branchId: 'branch-1-maputo',
          status: 'aprovado',
          codigoAcesso: 'MTW-SEC-001',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, secProfile, { merge: true });
        const cftpmInst = allInstitutions.find(i => i.id === 'inst-1' || i.id === 'moztechwave');
        if (cftpmInst) setActiveInstitution(cftpmInst);
        setActiveRole('SECRETARIA');
        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email,
          name: 'Egas Paulo',
          isSuperAdmin: false,
          authorizedRoles: ['SECRETARIA'],
          institutionId: 'inst-1',
          branchId: 'branch-1-maputo'
        });
        addNotification({
          title: 'Acesso da Secretaria Confirmado',
          message: 'Bem-vindo, Egas Paulo (Secretaria Académica — CFTPM Moztechwave).',
          type: 'success'
        });
        onClose();
        navigate('secretaria');
        return;
      }

      if (userDocSnap.exists()) {
        const udata = userDocSnap.data();
        const rawRoles: UserRole[] = Array.isArray(udata.roles) && udata.roles.length > 0
          ? udata.roles
          : (udata.role ? [udata.role as UserRole] : ['aluno']);
        const authorizedRoles: UserRole[] = isSuper 
          ? (rawRoles.includes('SUPER_ADMIN') ? rawRoles : ['SUPER_ADMIN', ...rawRoles])
          : rawRoles;
        const institutionId = udata.institutionId || '';
        const branchId = udata.branchId || 'todas';

        await setDoc(userDocRef, { lastLoginAt: new Date().toISOString() }, { merge: true });

        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || undefined,
          isSuperAdmin: isSuper,
          authorizedRoles,
          institutionId,
          branchId
        });
      } else if (isSuper) {
        // Super Admin sovereign bootstrap
        const rootProfile = {
          id: user.uid,
          uid: user.uid,
          name: user.displayName || 'Super Administrador',
          displayName: user.displayName || 'Super Administrador',
          email: user.email || '',
          role: 'SUPER_ADMIN',
          roles: ['SUPER_ADMIN'],
          institutionId: '',
          branchId: 'todas',
          estado: 'ativo',
          codigo: 'MTW-ROOT-001',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        await setDoc(userDocRef, rootProfile, { merge: true });
        await setDoc(doc(db, 'admins', user.uid), {
          email: user.email || '',
          role: 'SUPER_ADMIN',
          grantedAt: new Date().toISOString()
        }, { merge: true });

        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || 'Super Administrador',
          isSuperAdmin: true,
          authorizedRoles: ['SUPER_ADMIN'],
          institutionId: '',
          branchId: 'todas'
        });
      } else {
        // Regular user: No profile found in Firestore
        // STRICT MANDATE: "NÃO inventar perfil. NÃO atribuir Diretor automaticamente."
        soundManager.playError();
        setUnassignedAccount({
          email: user.email || '',
          uid: user.uid
        });
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      const isDomainError = err?.code === 'auth/unauthorized-domain' || (err?.message && (err.message.includes('unauthorized domain') || err.message.includes('authorized domain')));
      if (isDomainError) {
        setFeedback({
          success: false,
          message: 'Domínio educationqualityplataform.vercel.app pendente de autorização no Firebase Auth. Configure em: Firebase Console -> Authentication -> Settings -> Authorized Domains. Pode também usar o login por Código MTW ou Email/Senha.'
        });
      } else {
        setFeedback({
          success: false,
          message: err.message || 'Falha ao autenticar com o Google. Verifique a sua conexão.'
        });
      }
      soundManager.playError();
    } finally {
      setLoading(false);
    }
  };

  // Email & Password Auth
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setFeedback({ success: false, message: 'Por favor preencha o seu e-mail e senha.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    setUnassignedAccount(null);

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      }

      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      const isSuper = (await checkIsSuperAdmin(user.uid));

      // 1. DIRETOR: Jafim Paulo Rupia (Centro Infantil Céu Azul)
      if (user.email === 'jafimpaulo8@gmail.com') {
        const directorProfile = {
          id: user.uid,
          uid: user.uid,
          name: 'Jafim Paulo Rupia',
          displayName: 'Jafim Paulo Rupia (Diretor)',
          email: 'jafimpaulo8@gmail.com',
          role: 'DIRETOR' as UserRole,
          roles: ['DIRETOR' as UserRole],
          institutionId: 'ceu-azul-nacala',
          institutionIds: ['ceu-azul-nacala'],
          status: 'aprovado',
          codigoAcesso: 'CEU-AZUL-DIR-001',
          branchId: 'branch-ceu-azul-main',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, directorProfile, { merge: true });
        setActiveInstitution(CEU_AZUL_INSTITUTION);
        setActiveRole('DIRETOR');
        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email,
          name: 'Jafim Paulo Rupia',
          isSuperAdmin: false,
          authorizedRoles: ['DIRETOR'],
          institutionId: 'ceu-azul-nacala',
          branchId: 'branch-ceu-azul-main'
        });
        addNotification({
          title: 'Acesso do Diretor Confirmado',
          message: 'Bem-vindo, Diretor Jafim Paulo Rupia (Centro Infantil Céu Azul).',
          type: 'success'
        });
        onClose();
        navigate('centro_dashboard');
        return;
      }

      // 2. CEO: Alfredo Andrade (Centro Infantil Céu Azul)
      if (user.email === 'andradaalfred02308@gmail.com') {
        const ceoProfile = {
          id: user.uid,
          uid: user.uid,
          name: 'Alfredo Andrade',
          displayName: 'Alfredo Andrade (CEO)',
          email: 'andradaalfred02308@gmail.com',
          role: 'CEO' as UserRole,
          roles: ['CEO' as UserRole],
          institutionId: 'ceu-azul-nacala',
          institutionIds: ['ceu-azul-nacala'],
          ownedInstitutions: ['ceu-azul-nacala'],
          status: 'aprovado',
          codigoAcesso: 'CEU-AZUL-CEO-001',
          branchId: 'branch-ceu-azul-main',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, ceoProfile, { merge: true });
        setActiveInstitution(CEU_AZUL_INSTITUTION);
        setActiveRole('CEO');
        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email,
          name: 'Alfredo Andrade',
          isSuperAdmin: false,
          authorizedRoles: ['CEO'],
          institutionId: 'ceu-azul-nacala',
          branchId: 'branch-ceu-azul-main'
        });
        addNotification({
          title: 'Acesso do CEO Confirmado',
          message: 'Bem-vindo, CEO Alfredo Andrade (Centro Infantil Céu Azul).',
          type: 'success'
        });
        onClose();
        navigate('centro_dashboard');
        return;
      }

      // 3. SECRETARIA: Egas Paulo (CFTPM Moztechwave)
      if (user.email === 'centromoz8@gmail.com') {
        const secProfile = {
          id: user.uid,
          uid: user.uid,
          name: 'Egas Paulo',
          displayName: 'Egas Paulo (Secretaria)',
          email: 'centromoz8@gmail.com',
          role: 'SECRETARIA' as UserRole,
          roles: ['SECRETARIA' as UserRole],
          institutionId: 'inst-1',
          institutionIds: ['inst-1', 'moztechwave'],
          branchId: 'branch-1-maputo',
          status: 'aprovado',
          codigoAcesso: 'MTW-SEC-001',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, secProfile, { merge: true });
        const cftpmInst = allInstitutions.find(i => i.id === 'inst-1' || i.id === 'moztechwave');
        if (cftpmInst) setActiveInstitution(cftpmInst);
        setActiveRole('SECRETARIA');
        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email,
          name: 'Egas Paulo',
          isSuperAdmin: false,
          authorizedRoles: ['SECRETARIA'],
          institutionId: 'inst-1',
          branchId: 'branch-1-maputo'
        });
        addNotification({
          title: 'Acesso da Secretaria Confirmado',
          message: 'Bem-vindo, Egas Paulo (Secretaria Académica — CFTPM Moztechwave).',
          type: 'success'
        });
        onClose();
        navigate('secretaria');
        return;
      }

      if (userDocSnap.exists()) {
        const udata = userDocSnap.data();
        const rawRoles: UserRole[] = Array.isArray(udata.roles) && udata.roles.length > 0
          ? udata.roles
          : (udata.role ? [udata.role as UserRole] : ['aluno']);
        const authorizedRoles: UserRole[] = isSuper 
          ? (rawRoles.includes('SUPER_ADMIN') ? rawRoles : ['SUPER_ADMIN', ...rawRoles])
          : rawRoles;
        const institutionId = udata.institutionId || '';
        const branchId = udata.branchId || 'todas';

        await setDoc(userDocRef, { lastLoginAt: new Date().toISOString() }, { merge: true });

        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || undefined,
          isSuperAdmin: isSuper,
          authorizedRoles,
          institutionId,
          branchId
        });
      } else if (isSuper) {
        const rootProfile = {
          id: user.uid,
          uid: user.uid,
          name: user.displayName || 'Super Administrador',
          displayName: user.displayName || 'Super Administrador',
          email: user.email || '',
          role: 'SUPER_ADMIN',
          roles: ['SUPER_ADMIN'],
          institutionId: '',
          branchId: 'todas',
          estado: 'ativo',
          codigo: 'MTW-ROOT-001',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        await setDoc(userDocRef, rootProfile, { merge: true });
        await setDoc(doc(db, 'admins', user.uid), {
          email: user.email || '',
          role: 'SUPER_ADMIN',
          grantedAt: new Date().toISOString()
        }, { merge: true });

        soundManager.playSuccess();
        await proceedAfterAuth({
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || 'Super Administrador',
          isSuperAdmin: true,
          authorizedRoles: ['SUPER_ADMIN'],
          institutionId: '',
          branchId: 'todas'
        });
      } else {
        // Regular user: No profile found in Firestore
        // STRICT MANDATE: "NÃO inventar perfil. NÃO atribuir Diretor automaticamente."
        soundManager.playError();
        setUnassignedAccount({
          email: user.email || '',
          uid: user.uid
        });
      }
    } catch (err: any) {
      console.error('Credentials auth error:', err);
      let msg = 'Credenciais inválidas. Verifique o seu e-mail e senha.';
      if (err.code === 'auth/user-not-found') msg = 'Nenhuma conta encontrada com este e-mail.';
      if (err.code === 'auth/wrong-password') msg = 'Senha incorreta.';
      if (err.code === 'auth/email-already-in-use') msg = 'Este e-mail já está registado. Alterne para o modo Entrar.';
      if (err.code === 'auth/weak-password') msg = 'A senha deve conter pelo menos 6 caracteres.';
      setFeedback({ success: false, message: msg });
      soundManager.playError();
    } finally {
      setLoading(false);
    }
  };

  // Direct CEO sovereign access function
  const handleDirectCeoLogin = async () => {
    setLoading(true);
    setFeedback(null);
    const ceoUid = 'admin-core-moztechwave';
    const ceoEmail = 'admin-root@moztechwave.co.mz';
    const ceoName = 'Administrador Geral Moztechwave Core';

    try {
      await setDoc(doc(db, 'users', ceoUid), {
        id: ceoUid,
        uid: ceoUid,
        name: ceoName,
        displayName: ceoName,
        email: ceoEmail,
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN'],
        institutionId: activeInstitution?.id || '',
        branchId: 'todas',
        estado: 'ativo',
        codigo: 'MTW-CEO-MASTER-2026',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }, { merge: true });

      await setDoc(doc(db, 'admins', ceoUid), {
        email: ceoEmail,
        role: 'SUPER_ADMIN',
        grantedAt: new Date().toISOString()
      }, { merge: true });

      await setDoc(doc(db, 'access_codes', 'MTW-CEO-MASTER-2026'), {
        code: 'MTW-CEO-MASTER-2026',
        role: 'SUPER_ADMIN',
        name: ceoName,
        email: ceoEmail,
        status: 'ativo',
        description: 'Credencial Soberana de Acesso do Administrador Core Moztechwave',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore CEO bootstrap warning:', e);
    }

    soundManager.playSuccess();
    setActiveRole('SUPER_ADMIN');
    addNotification({
      title: 'Acesso Soberano Ativado',
      message: 'Bem-vindo, Administrador Core. Acesso liberado para gestão global da plataforma.',
      type: 'success'
    });
    setLoading(false);
    onClose();
    navigate('moztechwave_core');
  };

  // Access Code Authentication (e.g. Student Code or Institution Token)
  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) {
      setFeedback({ success: false, message: 'Insira o seu código de acesso institucional.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const code = accessCodeInput.trim();
      const clean = code.toUpperCase();

      // 1. VERIFICAÇÃO DIRETA: CENTRO INFANTIL CÉU AZUL (Nacala-Porto)
      // Suporte integral aos códigos: CEU-AZUL-001, CEU-AZUL-DIR-001, CEU-AZUL-CEO-001 e Alunos 41 a 62
      const ceuMatch = CEU_AZUL_ACCESS_CODES[clean];
      if (ceuMatch) {
        soundManager.playSuccess();
        setActiveInstitution(CEU_AZUL_INSTITUTION as Institution);
        setActiveBranchId('branch-ceu-azul-main');

        // Bootstrap assíncrono para o Firestore
        bootstrapCeuAzul().catch(e => console.warn('Ceu Azul sync note:', e));

        if (ceuMatch.role === 'ALUNO') {
          setActiveRole('ALUNO');
          const studentObj = ceuMatch.studentData || CEU_AZUL_STUDENTS.find(s => (s as any).codigoAcesso === clean);
          if (studentObj) {
            loginStudentByCode(clean);
          }
          await proceedAfterAuth({
            uid: `std-${clean.toLowerCase()}`,
            email: ceuMatch.email,
            name: ceuMatch.name,
            isSuperAdmin: false,
            authorizedRoles: ['ALUNO'],
            institutionId: CEU_AZUL_INSTITUTION_ID,
            branchId: 'branch-ceu-azul-main'
          });
          addNotification({
            title: 'Sessão de Aluno Iniciada',
            message: `Bem-vindo(a), ${ceuMatch.name}! Painel exclusivo do Aluno no Centro Infantil Céu Azul.`,
            type: 'success'
          });
          setLoading(false);
          onClose();
          navigate('portal_aluno');
          return;
        }

        if (ceuMatch.role === 'DIRETOR') {
          setActiveRole('DIRETOR');
          await proceedAfterAuth({
            uid: 'usr-jafim-dir-001',
            email: 'jafimpaulo8@gmail.com',
            name: 'Jafim Paulo Rupia',
            isSuperAdmin: false,
            authorizedRoles: ['DIRETOR'],
            institutionId: CEU_AZUL_INSTITUTION_ID,
            branchId: 'branch-ceu-azul-main'
          });
          addNotification({
            title: 'Sessão de Diretor Iniciada',
            message: 'Bem-vindo, Diretor Jafim Paulo Rupia! Painel de Gestão do Centro Infantil Céu Azul ativado.',
            type: 'success'
          });
          setLoading(false);
          onClose();
          navigate('centro_dashboard');
          return;
        }

        if (ceuMatch.role === 'CEO') {
          setActiveRole('CEO');
          await proceedAfterAuth({
            uid: 'usr-alfredo-ceo-001',
            email: 'andradaalfred02308@gmail.com',
            name: 'Alfredo Andrade',
            isSuperAdmin: false,
            authorizedRoles: ['CEO'],
            institutionId: CEU_AZUL_INSTITUTION_ID,
            branchId: 'branch-ceu-azul-main'
          });
          addNotification({
            title: 'Sessão de CEO Iniciada',
            message: 'Bem-vindo, CEO Alfredo Andrade! Painel de Gestão Executiva do Centro Infantil Céu Azul ativado.',
            type: 'success'
          });
          setLoading(false);
          onClose();
          navigate('centro_dashboard');
          return;
        }

        if (ceuMatch.role === 'INSTITUICAO') {
          setActiveRole('DIRETOR');
          await proceedAfterAuth({
            uid: 'inst-ceu-azul-nacala',
            email: ceuMatch.email,
            name: ceuMatch.name,
            isSuperAdmin: false,
            authorizedRoles: ['DIRETOR'],
            institutionId: CEU_AZUL_INSTITUTION_ID,
            branchId: 'branch-ceu-azul-main'
          });
          addNotification({
            title: 'Acesso Institucional Concedido',
            message: 'Centro Infantil Céu Azul autenticado com sucesso.',
            type: 'success'
          });
          setLoading(false);
          onClose();
          navigate('centro_dashboard');
          return;
        }
      }

      // 1b. CÓDIGO DA SECRETARIA ACADÉMICA (CFTPM MOZTECHWAVE - Egas Paulo)
      if (clean === 'MTW-SEC-001' || clean === 'SEC-MOZ-001') {
        soundManager.playSuccess();
        const cftpmInst = allInstitutions.find(i => i.id === 'inst-1' || i.id === 'moztechwave');
        if (cftpmInst) setActiveInstitution(cftpmInst);
        setActiveRole('SECRETARIA');
        await proceedAfterAuth({
          uid: 'usr-egas-sec-001',
          email: 'centromoz8@gmail.com',
          name: 'Egas Paulo',
          isSuperAdmin: false,
          authorizedRoles: ['SECRETARIA'],
          institutionId: 'inst-1',
          branchId: 'branch-1-maputo'
        });
        addNotification({
          title: 'Sessão da Secretaria Iniciada',
          message: 'Bem-vindo, Egas Paulo! Secretaria Académica CFTPM Moztechwave ativada.',
          type: 'success'
        });
        setLoading(false);
        onClose();
        navigate('secretaria');
        return;
      }
      
      // 2. VERIFICAÇÃO DO CÓDIGO MESTRE DA PLATAFORMA
      const isCeoMasterCode = [
        'MTW-CEO-MASTER-2026',
        'MTW-ROOT-001',
        'SIGAR-CEO-2026',
        'CEO-2026',
        'MTW-CEO-MASTER',
        'SUPERADMIN',
        'ADMIN-CEO'
      ].includes(clean);

      if (isCeoMasterCode) {
        await handleDirectCeoLogin();
        return;
      }

      // 2. Check in Firestore access_codes collection (Perfis criados pelo Admin)
      try {
        const qCode = query(collection(db, 'access_codes'), where('code', '==', clean));
        const snapCode = await getDocs(qCode);
        if (!snapCode.empty) {
          const codeDoc = snapCode.docs[0];
          const cData = codeDoc.data();
          soundManager.playSuccess();

          const assignedRole = (cData.role || 'VISITANTE').toUpperCase();
          if (cData.institutionId) {
            const inst = allInstitutions.find(i => i.id === cData.institutionId);
            if (inst) setActiveInstitution(inst);
          }
          if (cData.branchId) {
            setActiveBranchId(cData.branchId);
          }
          setActiveRole(assignedRole as any);

          await proceedAfterAuth({
            uid: cData.uid || codeDoc.id,
            email: cData.email || `${clean.toLowerCase()}@sigar.mz`,
            name: cData.name || cData.userName || `Utilizador ${assignedRole}`,
            isSuperAdmin: assignedRole === 'SUPER_ADMIN',
            authorizedRoles: [assignedRole as UserRole],
            institutionId: cData.institutionId || '',
            branchId: cData.branchId || 'todas'
          });

          addNotification({
            title: 'Código Validado',
            message: `Acesso autorizado como ${assignedRole}.`,
            type: 'success'
          });
          return;
        }
      } catch (errCode) {
        console.warn('access_codes check fallback:', errCode);
      }

      // 3. Check in Firestore users collection by codigo
      try {
        const qUser = query(collection(db, 'users'), where('codigo', '==', clean));
        const snapUser = await getDocs(qUser);
        if (!snapUser.empty) {
          const uDoc = snapUser.docs[0];
          const uData = uDoc.data();
          soundManager.playSuccess();

          const assignedRole = (uData.role || 'VISITANTE').toUpperCase();
          if (uData.institutionId) {
            const inst = allInstitutions.find(i => i.id === uData.institutionId);
            if (inst) setActiveInstitution(inst);
          }
          setActiveRole(assignedRole as any);

          await proceedAfterAuth({
            uid: uDoc.id,
            email: uData.email || '',
            name: uData.name || uData.displayName,
            isSuperAdmin: assignedRole === 'SUPER_ADMIN',
            authorizedRoles: uData.roles || [assignedRole as UserRole],
            institutionId: uData.institutionId || '',
            branchId: uData.branchId || 'todas'
          });
          return;
        }
      } catch (errU) {
        console.warn('users check fallback:', errU);
      }

      // 4. Check in students collection (by code or codigoAcesso)
      let foundStudentDoc = null;
      try {
        const qStd = query(collection(db, 'students'), where('code', '==', clean));
        const snapStd = await getDocs(qStd);
        if (!snapStd.empty) {
          foundStudentDoc = snapStd.docs[0];
        } else {
          const qStdAccess = query(collection(db, 'students'), where('codigoAcesso', '==', clean));
          const snapStdAccess = await getDocs(qStdAccess);
          if (!snapStdAccess.empty) {
            foundStudentDoc = snapStdAccess.docs[0];
          }
        }
      } catch (errStd) {
        console.warn('students check fallback:', errStd);
      }

      if (foundStudentDoc) {
        const studentData = foundStudentDoc.data();
        soundManager.playSuccess();
        setActiveRole('ALUNO');
        if (studentData.institutionId) {
          const inst = allInstitutions.find(i => i.id === studentData.institutionId);
          if (inst) setActiveInstitution(inst);
        }
        await proceedAfterAuth({
          uid: studentData.userId || foundStudentDoc.id,
          email: studentData.email || `${clean.toLowerCase()}@sigar.student`,
          name: studentData.name || studentData.fullName,
          isSuperAdmin: false,
          authorizedRoles: ['ALUNO'],
          institutionId: studentData.institutionId || '',
          branchId: studentData.branchId || ''
        });
        setLoading(false);
        onClose();
        navigate('portal_aluno');
        return;
      }

      // 4b. Local Students match
      const localStudentMatch = students.find(s => 
        (s as any).codigoAcesso?.toUpperCase() === clean ||
        (s as any).codigo?.toUpperCase() === clean ||
        (s as any).numAluno?.toUpperCase() === clean ||
        s.code?.toUpperCase() === clean
      );

      if (localStudentMatch) {
        soundManager.playSuccess();
        setActiveRole('ALUNO');
        const inst = allInstitutions.find(i => i.id === localStudentMatch.institutionId);
        if (inst) setActiveInstitution(inst);
        await proceedAfterAuth({
          uid: localStudentMatch.id,
          email: localStudentMatch.email || `${clean.toLowerCase()}@sigar.student`,
          name: localStudentMatch.name || localStudentMatch.fullName,
          isSuperAdmin: false,
          authorizedRoles: ['ALUNO'],
          institutionId: localStudentMatch.institutionId,
          branchId: localStudentMatch.branchId || ''
        });
        addNotification({
          title: 'Sessão de Aluno Iniciada',
          message: `Bem-vindo(a), ${localStudentMatch.name || localStudentMatch.fullName}.`,
          type: 'success'
        });
        setLoading(false);
        onClose();
        navigate('portal_aluno');
        return;
      }

      // 5. Check in teachers collection
      try {
        const qTeach = query(collection(db, 'teachers'), where('code', '==', clean));
        const snapTeach = await getDocs(qTeach);
        if (!snapTeach.empty) {
          const tDoc = snapTeach.docs[0];
          const tData = tDoc.data();
          soundManager.playSuccess();
          setActiveRole('PROFESSOR');
          await proceedAfterAuth({
            uid: tDoc.id,
            email: tData.email || `${clean.toLowerCase()}@sigar.prof`,
            name: tData.name,
            isSuperAdmin: false,
            authorizedRoles: ['PROFESSOR'],
            institutionId: tData.institutionId || '',
            branchId: tData.branchId || ''
          });
          return;
        }
      } catch (errT) {
        console.warn('teachers check fallback:', errT);
      }

      // 6. Check in institutions collection by accessCode or code
      const qInst = query(collection(db, 'institutions'), where('accessCode', '==', clean));
      const snapInst = await getDocs(qInst);

      if (!snapInst.empty) {
        const instDoc = snapInst.docs[0];
        const instData = instDoc.data();
        soundManager.playSuccess();
        setActiveRole('DIRETOR');
        await proceedAfterAuth({
          uid: `inst-token-${instDoc.id}`,
          email: instData.email || '',
          name: instData.name,
          isSuperAdmin: false,
          authorizedRoles: ['DIRETOR'],
          institutionId: instDoc.id,
          branchId: 'todas'
        });
        return;
      }

      // 7. Check local registered institutions by accessCode or code
      const localInstMatch = allInstitutions.find(i => 
        i.accessCode?.toUpperCase() === clean || 
        i.code.toUpperCase() === clean ||
        `SIGAR-ACC-8819-${i.code.replace('MTW-', '')}`.toUpperCase() === clean
      );

      if (localInstMatch) {
        soundManager.playSuccess();
        setActiveInstitution(localInstMatch);
        setActiveRole('DIRETOR');
        await proceedAfterAuth({
          uid: `inst-${localInstMatch.id}`,
          email: localInstMatch.email || '',
          name: localInstMatch.representativeName || localInstMatch.name,
          isSuperAdmin: false,
          authorizedRoles: ['DIRETOR'],
          institutionId: localInstMatch.id,
          branchId: 'todas'
        });
        return;
      }

      setFeedback({
        success: false,
        message: 'Código de acesso não encontrado. Verifique se digitou corretamente ou solicite o seu código à direção.'
      });
      soundManager.playError();
    } catch (err: any) {
      console.error('Access code error:', err);
      setFeedback({ success: false, message: 'Erro ao validar código. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Password reset
  const handleForgotPassword = async () => {
    if (!emailInput.trim()) {
      setFeedback({ success: false, message: 'Digite o seu e-mail para receber as instruções de recuperação.' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, emailInput.trim());
      setResetSent(true);
      setFeedback({ success: true, message: 'Instruções de recuperação enviadas para o seu e-mail.' });
    } catch (e: any) {
      setFeedback({ success: false, message: 'Não foi possível enviar e-mail de recuperação.' });
    }
  };

  // Step 2: Role selection check with real RBAC (PARTE 7)
  const handleSelectRole = (targetRole: UserRole) => {
    soundManager.playClick();
    setRoleAccessDenied(null);

    if (!authSession) {
      setRoleAccessDenied('Sessão inválida. Por favor volte ao início.');
      return;
    }

    const { authorizedRoles, isSuperAdmin } = authSession;
    const isSuper = isSuperAdmin || (authorizedRoles || []).map(r => toCanonicalRole(r)).includes('SUPER_ADMIN');
    const canonicalTarget = toCanonicalRole(targetRole);

    let isAuthorized = false;
    if (isSuper) {
      isAuthorized = true;
    } else {
      isAuthorized = (authorizedRoles || []).map(r => toCanonicalRole(r)).includes(canonicalTarget);
    }

    if (!isAuthorized) {
      soundManager.playError();
      setRoleAccessDenied(`O seu utilizador não possui autorização para assumir o perfil de "${getRoleDisplayName(targetRole)}".`);
      return;
    }

    setChosenRole(targetRole);
    setCurrentStep(3);
  };

  // Step 3: Confirmation and routing (PARTE 8, 9, 10)
  const handleConfirmContextAndEnter = async () => {
    soundManager.playSuccess();
    setLoading(true);

    const effectiveInstId = selectedInstId || authSession?.institutionId || '';
    const effectiveBranch = selectedBranchId || 'todas';

    // Update active context in AppContext
    if (effectiveInstId) {
      const inst = userInstitutions.find(i => i.id === effectiveInstId) || allInstitutions.find(i => i.id === effectiveInstId);
      if (inst) {
        setActiveInstitution(inst);
      }
    }

    setActiveBranchId(effectiveBranch);
    setActiveRole(chosenRole);

    // Save context to user document if UID available
    if (authSession?.uid && !authSession.uid.startsWith('inst-token-')) {
      try {
        await setDoc(doc(db, 'users', authSession.uid), {
          lastInstitutionId: effectiveInstId,
          lastBranchId: effectiveBranch,
          activeRole: chosenRole,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Could not update user context in Firestore:', err);
      }
    }

    // Direct user to role-specific authorized dashboard
    const norm = String(chosenRole).toUpperCase();
    if (norm === 'ALUNO') {
      navigate('portal_aluno');
    } else if (norm === 'PROFESSOR' || norm === 'FORMADOR') {
      navigate('portal_professor');
    } else if (norm === 'FINANCEIRO') {
      navigate('financeiro');
    } else if (norm === 'SECRETARIA') {
      navigate('candidatos_gestao');
    } else if (norm === 'PORTEIRO') {
      navigate('controlo_entrada');
    } else if (norm === 'SUPER_ADMIN' || norm === 'SUPERADMIN') {
      navigate('moztechwave_core');
    } else {
      navigate('centro_dashboard');
    }

    setLoading(false);
    onClose();
  };

  // Register New Institution Submit
  const handleRegisterNewInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim()) return;

    setLoading(true);
    const newId = `inst-${Date.now()}`;
    const newInst: Institution = {
      id: newId,
      code: `SIGAR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newInstName.trim(),
      type: 'instituicao_ensino',
      nuit: newInstNuit.trim() || '400000000',
      licenseNumber: `ALV-${Date.now().toString().slice(-6)}`,
      representativeName: newInstRep.trim() || 'Direção Geral',
      representativeRole: 'Diretor Geral',
      repLegal: newInstRep.trim() || 'Direção Geral',
      email: newInstEmail.trim() || '',
      phone: newInstPhone.trim() || '',
      city: newInstCity,
      province: newInstProvince,
      address: '',
      plan: 'Profissional',
      status: 'Ativa',
      connectedSystem: 'SIGAR',
      sivecEnabled: true,
      activeBranches: 1,
      totalStudents: 0,
      totalTeachers: 0,
      totalCourses: 0,
      createdAt: new Date().toISOString(),
      branches: [
        {
          id: `${newId}-b1`,
          institutionId: newId,
          name: 'Campus Central',
          code: 'CC-01',
          city: newInstCity,
          province: newInstProvince,
          address: '',
          phone: newInstPhone.trim(),
          email: newInstEmail.trim(),
          isMainBranch: true,
          status: 'Ativo',
          createdAt: new Date().toISOString()
        }
      ]
    };

    try {
      await setDoc(doc(db, 'institutions', newId), newInst);
      addInstitution(newInst);
      addNotification({
        title: 'Instituição Registada com Sucesso',
        message: `${newInst.name} foi registada no SIGAR com código ${newId}.`,
        type: 'system'
      });
      soundManager.playSuccess();
      setShowNewInstModal(false);
      setFeedback({ success: true, message: `Instituição ${newInst.name} criada com sucesso.` });
    } catch (e: any) {
      console.error('Error saving institution:', e);
      setFeedback({ success: false, message: 'Falha ao salvar instituição no Firebase.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-fadeIn ${
      isLight ? 'bg-slate-900/50' : 'bg-slate-950/85'
    }`}>
      <div className={`relative w-full max-w-4xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700/80 text-white'
      }`}>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all cursor-pointer ${
            isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================= */}
        {/* LADO ESQUERDO: APARÊNCIA SAAS MODERNA (PARTE 6)            */}
        {/* ========================================================= */}
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

            {/* Mensagem Institucional (PARTE 6) */}
            <div className="mt-8 mb-8 p-4 rounded-2xl bg-sky-950/40 border border-sky-800/30">
              <h2 className="text-lg font-bold text-white leading-snug">
                &ldquo;Educação digital.<br />
                <span className="text-sky-400">Gestão inteligente.</span><br />
                Futuro melhor.&rdquo;
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Arquitetura em nuvem com conformidade legal, auditoria e emissão de certificados SIVEC.
              </p>
            </div>

            {/* Lista de Recursos (PARTE 6) */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Inscrições e Matrículas</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Notas e Pautas</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pagamentos M-Pesa &amp; e-Mola</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Certificados SIVEC</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Portal do Aluno Integrado</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Instituições e Filiais</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>SIGAR PRO • Moçambique</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">v4.8</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LADO DIREITO: FORMULÁRIO E ETAPAS (PARTE 6, 7, 8)          */}
        {/* ========================================================= */}
        <div className={`flex-1 p-6 sm:p-10 flex flex-col justify-between overflow-y-auto ${
          isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
        }`}>

          {/* STEP 1: LOGIN SAAS (PARTE 6) */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <h2 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  Bem-vindo(a)!
                </h2>
                <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Acesse o seu painel SIGAR.
                </p>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div className={`mb-5 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  feedback.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                }`}>
                  {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Tab Selector: Google / Email / Código */}
              <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-2xl border mb-6 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => { setActiveTab('google'); setFeedback(null); }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'google' 
                      ? 'bg-sky-600 text-white shadow-md' 
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('credentials'); setFeedback(null); }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'credentials' 
                      ? 'bg-sky-600 text-white shadow-md' 
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  Email + Senha
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('code'); setFeedback(null); }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'code' 
                      ? 'bg-sky-600 text-white shadow-md' 
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  Código de Acesso
                </button>
              </div>

              {/* Tab 1: Google OAuth */}
              {activeTab === 'google' && (
                <div className="space-y-4 py-2">
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Inicie sessão com segurança com a sua conta Google associada ao seu perfil institucional no SIGAR.
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
                </div>
              )}

              {/* Tab 2: Email + Password (NO PREFILLED EMAIL!) */}
              {activeTab === 'credentials' && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Endereço de E-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="seu.email@instituicao.ac.mz"
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
                      <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Palavra-passe
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] text-sky-500 hover:text-sky-600 transition-colors cursor-pointer"
                      >
                        Esqueceu a senha?
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

                  <div className="flex items-center justify-between pt-1">
                    <label className={`flex items-center gap-2 cursor-pointer select-none text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <input
                        type="checkbox"
                        checked={keepSessionActive}
                        onChange={(e) => setKeepSessionActive(e.target.checked)}
                        className="rounded border-slate-300 text-sky-500 focus:ring-0"
                      />
                      <span>Manter sessão ativa</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className={`text-xs transition-colors cursor-pointer ${isLight ? 'text-slate-600 hover:text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                      {isSignUp ? 'Já tem conta? Entrar' : 'Criar nova conta'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>{isSignUp ? 'Criar Conta e Aceder' : 'Iniciar Sessão'}</span>
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}

              {/* Tab 3: Access Code */}
              {activeTab === 'code' && (
                <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
                  {/* Centro Infantil Céu Azul Quick Access Card */}
                  <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    isLight 
                      ? 'bg-sky-50 border-sky-200 text-sky-950 shadow-xs' 
                      : 'bg-sky-950/40 border-sky-800/60 text-sky-200'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <School className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className={isLight ? 'text-sky-900' : 'text-sky-300'}>Centro Infantil Céu Azul — Nacala-Porto</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold border border-sky-500/30">
                        CEU-AZUL
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-sky-900/90' : 'text-slate-300'}`}>
                      Selecione uma credencial oficial para entrar instantaneamente com o seu perfil autorizado:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {/* Diretor */}
                      <button
                        type="button"
                        onClick={() => {
                          setAccessCodeInput('CEU-AZUL-DIR-001');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          accessCodeInput === 'CEU-AZUL-DIR-001'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                            : (isLight ? 'bg-white hover:bg-sky-100/70 border-sky-200 text-slate-800' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200')
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold opacity-75">Diretor</div>
                        <div className="font-bold text-xs">Jafim Paulo</div>
                        <div className="font-mono text-[10px] mt-0.5 opacity-90">CEU-AZUL-DIR-001</div>
                      </button>

                      {/* CEO */}
                      <button
                        type="button"
                        onClick={() => {
                          setAccessCodeInput('CEU-AZUL-CEO-001');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          accessCodeInput === 'CEU-AZUL-CEO-001'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : (isLight ? 'bg-white hover:bg-indigo-50 border-sky-200 text-slate-800' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200')
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold opacity-75">CEO / Mantenedor</div>
                        <div className="font-bold text-xs">Alfredo Andrade</div>
                        <div className="font-mono text-[10px] mt-0.5 opacity-90">CEU-AZUL-CEO-001</div>
                      </button>

                      {/* Código Institucional */}
                      <button
                        type="button"
                        onClick={() => {
                          setAccessCodeInput('CEU-AZUL-001');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          accessCodeInput === 'CEU-AZUL-001'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : (isLight ? 'bg-white hover:bg-emerald-50 border-sky-200 text-slate-800' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200')
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold opacity-75">Institucional</div>
                        <div className="font-bold text-xs">Céu Azul Nacala</div>
                        <div className="font-mono text-[10px] mt-0.5 opacity-90">CEU-AZUL-001</div>
                      </button>
                    </div>

                    {/* Alunos 41 a 62 Quick Selector */}
                    <div className="pt-1">
                      <div className="text-[11px] font-semibold mb-1.5 flex items-center justify-between">
                        <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                          Alunos Cadastrados (Nº 41 a 62):
                        </span>
                        <span className="text-[10px] font-mono opacity-70">22 alunos</span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40">
                        {CEU_AZUL_STUDENTS.slice(0, 10).map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setAccessCodeInput((s as any).codigoAcesso)}
                            className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                              accessCodeInput === (s as any).codigoAcesso
                                ? 'bg-sky-600 text-white font-bold'
                                : (isLight ? 'bg-white hover:bg-sky-100 text-slate-700 border border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800')
                            }`}
                            title={`${(s as any).numAluno}: ${s.fullName || (s as any).name || ''}`}
                          >
                            Nº {(s as any).numLista} {(s.fullName || (s as any).name || 'Aluno').split(' ')[0]}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setAccessCodeInput('CEU-AZUL-ALUNO-041')}
                          className="px-2 py-1 rounded text-[10px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-300/40 hover:bg-sky-500/20 cursor-pointer"
                        >
                          CEU-AZUL-ALUNO-041 (Hilton)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccessCodeInput('CEU-AZUL-ALUNO-062')}
                          className="px-2 py-1 rounded text-[10px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-300/40 hover:bg-sky-500/20 cursor-pointer"
                        >
                          CEU-AZUL-ALUNO-062 (Yula)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Código de Acesso Institucional
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={accessCodeInput}
                        onChange={(e) => setAccessCodeInput(e.target.value)}
                        placeholder="Ex: MTW-CEO-MASTER-2026, MTW-CF-0001, MTW-SEC-..."
                        required
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm uppercase font-mono transition-colors ${
                          isLight 
                            ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500' 
                            : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-sky-500'
                        }`}
                      />
                    </div>
                    <p className={`text-[11px] mt-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Insira o seu código oficial de utilizador (CEO, Diretor, Secretaria, Professor, Financeiro ou Aluno).
                    </p>
                  </div>

                  <div className={`flex flex-wrap items-center gap-1.5 pt-1 text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <span>Exemplos de Códigos:</span>
                    <button
                      type="button"
                      onClick={() => setAccessCodeInput('MTW-CF-0001')}
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] border cursor-pointer ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      MTW-CF-0001 (Diretor)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccessCodeInput('SIGAR-ACC-8819-CF0001')}
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] border cursor-pointer ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      SIGAR-ACC-8819...
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Validar Código e Entrar</span>
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}

              {/* Bottom SaaS Footer Links (PARTE 6) */}
              <div className={`mt-8 pt-6 border-t flex items-center justify-between text-xs ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowNewInstModal(true)}
                  className="flex items-center gap-1.5 text-sky-500 hover:text-sky-600 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Registar nova instituição</span>
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
          )}

          {/* ========================================================= */}
          {/* STEP 2: "Como pretende aceder ao SIGAR?" (PARTE 7)        */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Passo 2 de 3
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Bem-vindo{authSession?.name ? `, ${authSession.name}` : ''}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Como pretende aceder ao SIGAR?
                </p>
              </div>

              {/* Role Access Denied Alert (PARTE 7) */}
              {roleAccessDenied && (
                <div className="mb-5 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{roleAccessDenied}</span>
                </div>
              )}

              {/* List of Profiles - strictly showing only authorized roles for this UID */}
              {(() => {
                const ALL_ROLE_CARDS = [
                  {
                    role: 'ALUNO' as UserRole,
                    title: 'Aluno',
                    desc: 'Boletim, notas, frequência, pagamentos e carteirinha digital',
                    icon: <GraduationCap className="w-5 h-5 text-sky-400" />
                  },
                  {
                    role: 'PROFESSOR' as UserRole,
                    title: 'Professor / Formador',
                    desc: 'Diário de classe, sumários, faltas e lançamento de pautas',
                    icon: <Briefcase className="w-5 h-5 text-indigo-400" />
                  },
                  {
                    role: 'SECRETARIA' as UserRole,
                    title: 'Secretaria',
                    desc: 'Inscrições, matrículas, turmas e emissão de documentos',
                    icon: <ClipboardList className="w-5 h-5 text-emerald-400" />
                  },
                  {
                    role: 'FINANCEIRO' as UserRole,
                    title: 'Financeiro',
                    desc: 'Propinas, conciliação de caixa e relatórios contabilísticos',
                    icon: <DollarSign className="w-5 h-5 text-cyan-400" />
                  },
                  {
                    role: 'PORTEIRO' as UserRole,
                    title: 'Portaria',
                    desc: 'Validação de QR Code e controlo de fluxo de entrada',
                    icon: <DoorOpen className="w-5 h-5 text-amber-400" />
                  },
                  {
                    role: 'ADMIN_INSTITUICAO' as UserRole,
                    title: 'Administrador',
                    desc: 'Gestão institucional, utilizadores e parâmetros',
                    icon: <ShieldCheck className="w-5 h-5 text-purple-400" />
                  },
                  {
                    role: 'DIRETOR' as UserRole,
                    title: 'Diretor / CEO',
                    desc: 'Painel executivo, auditoria e homologação de pautas',
                    icon: <Building2 className="w-5 h-5 text-blue-400" />
                  },
                  {
                    role: 'SUPER_ADMIN' as UserRole,
                    title: 'Super Admin',
                    desc: 'Supervisão central Moztechwave e infraestrutura SIGAR',
                    icon: <Sparkles className="w-5 h-5 text-yellow-400" />
                  }
                ];

                const userAuthCanonicals = (authSession?.authorizedRoles || []).map(r => toCanonicalRole(r));
                const isSuper = Boolean(authSession?.isSuperAdmin);

                const visibleRoleCards = ALL_ROLE_CARDS.filter(card => {
                  if (isSuper) return true;
                  return userAuthCanonicals.includes(toCanonicalRole(card.role));
                });

                if (visibleRoleCards.length === 0) {
                  return (
                    <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-center space-y-3">
                      <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
                      <h4 className="text-sm font-bold text-white">Nenhum Perfil SIGAR Autorizado</h4>
                      <p className="text-xs text-slate-400">
                        A sua conta foi autenticada, mas ainda não possui perfis vinculados pela instituição.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {visibleRoleCards.map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleSelectRole(item.role)}
                        className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer active:scale-[0.99] flex items-start gap-3"
                      >
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:bg-slate-800 transition-colors">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: INSTITUIÇÃO E FILIAL (PARTE 8)                     */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar aos perfis</span>
                </button>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Passo 3 de 3
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Instituição &amp; Filial
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Confirme a unidade institucional associada à sua sessão.
                </p>
              </div>

              {loadingInstitutions ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-3" />
                  <p className="text-xs text-slate-400">Carregando instituições autorizadas...</p>
                </div>
              ) : userInstitutions.length === 0 && !authSession?.isSuperAdmin ? (
                // Se não existir instituição associada (PARTE 8)
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">
                    Não existem instituições associadas à sua conta.
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    A sua conta foi autenticada com sucesso, mas ainda não possui vínculo a nenhuma instituição de ensino cadastrada.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewInstModal(true)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Registar Nova Instituição
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Seleção de Instituição */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Instituição Académica
                    </label>
                    <select
                      value={selectedInstId}
                      onChange={(e) => setSelectedInstId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      {userInstitutions.length > 0 ? (
                        userInstitutions.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name} ({inst.city || inst.province})
                          </option>
                        ))
                      ) : (
                        <option value="">Selecionar Instituição...</option>
                      )}
                    </select>
                  </div>

                  {/* Seleção de Filial */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Filial / Campus
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setLocalBranchId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="todas">Todas as Filiais / Central</option>
                      {userInstitutions
                        .find(i => i.id === selectedInstId)?.branches?.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.city})
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleConfirmContextAndEnter}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-sky-950/40 transition-all cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                      <span>Aceder ao Painel {chosenRole}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL AUXILIAR: REGISTO DE NOVA INSTITUIÇÃO                */}
      {/* ========================================================= */}
      {showNewInstModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Registar Nova Instituição</h3>
              </div>
              <button
                onClick={() => setShowNewInstModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewInstitution} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome da Instituição</label>
                <input
                  type="text"
                  required
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  placeholder="Ex: Instituto Médio Politécnico de Inhambane"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">NUIT</label>
                  <input
                    type="text"
                    value={newInstNuit}
                    onChange={(e) => setNewInstNuit(e.target.value)}
                    placeholder="400000000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Representante Legal</label>
                  <input
                    type="text"
                    value={newInstRep}
                    onChange={(e) => setNewInstRep(e.target.value)}
                    placeholder="Nome do Diretor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">E-mail Institucional</label>
                  <input
                    type="email"
                    value={newInstEmail}
                    onChange={(e) => setNewInstEmail(e.target.value)}
                    placeholder="direcao@instituicao.ac.mz"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={newInstPhone}
                    onChange={(e) => setNewInstPhone(e.target.value)}
                    placeholder="+258 84 000 0000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={newInstCity}
                    onChange={(e) => setNewInstCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Província</label>
                  <select
                    value={newInstProvince}
                    onChange={(e) => setNewInstProvince(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="Maputo Cidade">Maputo Cidade</option>
                    <option value="Maputo Província">Maputo Província</option>
                    <option value="Gaza">Gaza</option>
                    <option value="Inhambane">Inhambane</option>
                    <option value="Sofala">Sofala</option>
                    <option value="Manica">Manica</option>
                    <option value="Tete">Tete</option>
                    <option value="Zambézia">Zambézia</option>
                    <option value="Nampula">Nampula</option>
                    <option value="Cabo Delgado">Cabo Delgado</option>
                    <option value="Niassa">Niassa</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewInstModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'A registar...' : 'Concluir Registo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL AUXILIAR: AJUDA & SUPORTE                            */}
      {/* ========================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Central de Ajuda SIGAR</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                O <strong className="text-white">SIGAR PRO</strong> é o sistema integrado de administração escolar e gestão académica da Moztechwave em Moçambique.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sky-400">Como obter acesso?</h4>
                <p className="text-[11px] text-slate-400">
                  • <strong>Alunos:</strong> utilize o e-mail ou o código fornecido no ato da matrícula.<br />
                  • <strong>Professores e Secretaria:</strong> acesse com a sua conta Google corporativa autorizada pela direção.<br />
                  • <strong>Diretores e Finanças:</strong> contacte o administrador central para autorização de filial.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Suporte Técnico Moztechwave:<br />
                E-mail: <span className="text-white">suporte@moztechwave.co.mz</span><br />
                Maputo: <span className="text-white">+258 84 900 1200</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
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
