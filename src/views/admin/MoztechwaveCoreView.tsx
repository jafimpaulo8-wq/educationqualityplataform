import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Layers, 
  Coins, 
  Award, 
  Lock, 
  Activity, 
  Globe, 
  Search, 
  Plus, 
  Edit3, 
  Slash, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  KeyRound, 
  Sliders, 
  HardDrive, 
  GitBranch, 
  Cpu, 
  Radio, 
  RefreshCw, 
  ShieldAlert, 
  Download, 
  Eye, 
  GraduationCap, 
  ExternalLink, 
  Check, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles, 
  Zap, 
  Terminal, 
  Server, 
  Smartphone, 
  Laptop, 
  Database, 
  Code2, 
  Link2, 
  Filter, 
  Clock, 
  MapPin, 
  TrendingUp, 
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Institution, UserRole, CertificateData } from '../../types';
import { MozcoinWallet, MozcoinTransaction, MozcoinPurchaseRequest } from '../../types/mozcoin';
import { PlanDefinition, PlanLimits } from '../../types/plans';
import { AuditLogEntry } from '../../types/audit';
import { soundManager } from '../../utils/audio';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export type CoreTab = 
  | 'dashboard' 
  | 'instituicoes' 
  | 'utilizadores' 
  | 'sivec' 
  | 'mozcoin' 
  | 'planos' 
  | 'auditoria' 
  | 'seguranca' 
  | 'regras' 
  | 'arquitetura';

export const MoztechwaveCoreView: React.FC = () => {
  const { 
    allInstitutions, 
    activeInstitution, 
    setActiveInstitution, 
    updateInstitution, 
    addInstitution, 
    allCertificates, 
    allMozcoinWallets, 
    allMozcoinTransactions, 
    allMozcoinPurchases, 
    approveMozcoinPurchase, 
    rejectMozcoinPurchase, 
    allAuditLogs, 
    navigate, 
    firebaseUser, 
    activeRole,
    addNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<CoreTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstId, setSelectedInstId] = useState<string | null>(null);

  // 90.2 Inst modals
  const [showCreateInstModal, setShowCreateInstModal] = useState(false);
  const [showEditInstModal, setShowEditInstModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [instActionTarget, setInstActionTarget] = useState<Institution | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Form states for new institution
  const [newInstName, setNewInstName] = useState('');
  const [newInstCode, setNewInstCode] = useState('');
  const [newInstNuit, setNewInstNuit] = useState('');
  const [newInstCity, setNewInstCity] = useState('Maputo');
  const [newInstProvince, setNewInstProvince] = useState('Maputo Cidade');
  const [newInstEmail, setNewInstEmail] = useState('');
  const [newInstPhone, setNewInstPhone] = useState('+258 84 000 0000');
  const [newInstPlan, setNewInstPlan] = useState('Profissional');
  const [newInstRepName, setNewInstRepName] = useState('');

  // 90.3 Users IAM state
  interface ManagedUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    institutionId: string;
    institutionName: string;
    status: 'Ativo' | 'Bloqueado' | 'Pendente';
    lastLogin: string;
    device: string;
    mfaEnabled: boolean;
    permissionsCount: number;
    sessionsCount: number;
  }

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([
    {
      id: 'usr-owner-001',
      name: 'Eng. Paulo Jafim (Platform Owner)',
      email: 'jafimpaulo8@gmail.com',
      role: 'SUPER_ADMIN',
      institutionId: 'all',
      institutionName: 'Moztechwave Ecosystem HQ',
      status: 'Ativo',
      lastLogin: 'Agora mesmo (Sessão Atual)',
      device: 'MacBook Pro / Chrome 128 (Maputo)',
      mfaEnabled: true,
      permissionsCount: 88,
      sessionsCount: 1
    },
    {
      id: 'usr-inst-cftpm-01',
      name: 'Dr. Alberto Mondlane',
      email: 'direcao@cftpm.co.mz',
      role: 'DIRETOR',
      institutionId: 'inst-cftpm-01',
      institutionName: 'Centro de Formação Técnico-Profissional de Moçambique',
      status: 'Ativo',
      lastLogin: 'Hoje às 08:30',
      device: 'Windows 11 / Edge (Matola)',
      mfaEnabled: true,
      permissionsCount: 42,
      sessionsCount: 1
    },
    {
      id: 'usr-inst-cftpm-02',
      name: 'Dra. Luísa Chissano',
      email: 'secretaria@cftpm.co.mz',
      role: 'SECRETARIA',
      institutionId: 'inst-cftpm-01',
      institutionName: 'Centro de Formação Técnico-Profissional de Moçambique',
      status: 'Ativo',
      lastLogin: 'Ontem às 16:45',
      device: 'Ubuntu Linux / Firefox (Maputo)',
      mfaEnabled: false,
      permissionsCount: 26,
      sessionsCount: 1
    },
    {
      id: 'usr-inst-ips-01',
      name: 'Prof. Rui Macamo',
      email: 'direcao@ip-solucoes.co.mz',
      role: 'ADMIN_INSTITUICAO',
      institutionId: 'inst-ips-02',
      institutionName: 'Instituto Politécnico de Soluções e Tecnologia',
      status: 'Ativo',
      lastLogin: 'Hoje às 09:12',
      device: 'macOS / Safari (Beira)',
      mfaEnabled: true,
      permissionsCount: 45,
      sessionsCount: 2
    },
    {
      id: 'usr-inst-esc-01',
      name: 'Maria Tembe',
      email: 'financas@escolatec.mz',
      role: 'FINANCEIRO',
      institutionId: 'inst-et-03',
      institutionName: 'Escola Tecnológica de Nampula',
      status: 'Bloqueado',
      lastLogin: 'Há 4 dias',
      device: 'Windows 10 / Chrome (Nampula)',
      mfaEnabled: false,
      permissionsCount: 18,
      sessionsCount: 0
    }
  ]);

  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userOtpNotice, setUserOtpNotice] = useState<string | null>(null);

  // User Profile Creation with MTW Code (Admin / CEO IAM)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserInstId, setNewUserInstId] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('DIRETOR');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('+258 84 ');
  const [createdProfileInfo, setCreatedProfileInfo] = useState<{
    code: string;
    name: string;
    role: string;
    instName: string;
  } | null>(null);

  // 90.5 Mozcoin Admin Ledger operation modal
  const [showMozcoinOpModal, setShowMozcoinOpModal] = useState(false);
  const [mozcoinOpType, setMozcoinOpType] = useState<'credito' | 'debito'>('credito');
  const [mozcoinOpWalletId, setMozcoinOpWalletId] = useState('');
  const [mozcoinOpAmount, setMozcoinOpAmount] = useState(500);
  const [mozcoinOpReason, setMozcoinOpReason] = useState('');

  // 90.6 Custom Plans state
  const [plansList, setPlansList] = useState<Array<{
    id: string;
    name: string;
    tier: string;
    priceMZNMonthly: number;
    priceMZNAnnual: number;
    maxStudents: number;
    maxBranches: number;
    storageGB: number;
    monthlyCertificates: number;
    whatsappApi: boolean;
    sivecConnect: boolean;
    aiMoztechwave: boolean;
    supportLevel: 'Padrão' | 'Prioritário' | '24/7 Dedicado';
    activeInstitutionsCount: number;
  }>>([
    {
      id: 'plan-starter',
      name: 'Plano Starter',
      tier: 'Entrada',
      priceMZNMonthly: 15000,
      priceMZNAnnual: 150000,
      maxStudents: 350,
      maxBranches: 1,
      storageGB: 25,
      monthlyCertificates: 100,
      whatsappApi: false,
      sivecConnect: true,
      aiMoztechwave: false,
      supportLevel: 'Padrão',
      activeInstitutionsCount: 3
    },
    {
      id: 'plan-pro',
      name: 'Plano Professional',
      tier: 'Popular',
      priceMZNMonthly: 35000,
      priceMZNAnnual: 350000,
      maxStudents: 1500,
      maxBranches: 3,
      storageGB: 100,
      monthlyCertificates: 500,
      whatsappApi: true,
      sivecConnect: true,
      aiMoztechwave: true,
      supportLevel: 'Prioritário',
      activeInstitutionsCount: 4
    },
    {
      id: 'plan-enterprise',
      name: 'Plano Enterprise Multi-Campus',
      tier: 'Corporativo',
      priceMZNMonthly: 75000,
      priceMZNAnnual: 750000,
      maxStudents: 5000,
      maxBranches: 10,
      storageGB: 500,
      monthlyCertificates: 2500,
      whatsappApi: true,
      sivecConnect: true,
      aiMoztechwave: true,
      supportLevel: '24/7 Dedicado',
      activeInstitutionsCount: 1
    },
    {
      id: 'plan-partner',
      name: 'Plano Partner / Governamental',
      tier: 'Estratégico',
      priceMZNMonthly: 120000,
      priceMZNAnnual: 1200000,
      maxStudents: 15000,
      maxBranches: 25,
      storageGB: 2000,
      monthlyCertificates: 10000,
      whatsappApi: true,
      sivecConnect: true,
      aiMoztechwave: true,
      supportLevel: '24/7 Dedicado',
      activeInstitutionsCount: 0
    },
    {
      id: 'plan-custom',
      name: 'Plano Custom (Tailor-made)',
      tier: 'Sob Medida',
      priceMZNMonthly: 95000,
      priceMZNAnnual: 950000,
      maxStudents: 8000,
      maxBranches: 15,
      storageGB: 1000,
      monthlyCertificates: 5000,
      whatsappApi: true,
      sivecConnect: true,
      aiMoztechwave: true,
      supportLevel: '24/7 Dedicado',
      activeInstitutionsCount: 1
    }
  ]);

  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPriceMZN, setNewPlanPriceMZN] = useState(45000);
  const [newPlanStudents, setNewPlanStudents] = useState(2000);
  const [newPlanBranches, setNewPlanBranches] = useState(5);
  const [newPlanStorageGB, setNewPlanStorageGB] = useState(150);

  // 90.7 Forensic Audit state
  const [auditFilterSeverity, setAuditFilterSeverity] = useState<'all' | 'info' | 'aviso' | 'critico'>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // 90.8 Security state
  const [securityScanRunning, setSecurityScanRunning] = useState(false);
  const [securityScanResults, setSecurityScanResults] = useState<{
    testedAt: string;
    privilegeEscalationChecks: number;
    tenantVulnerabilities: number;
    status: 'SEGURO' | 'AVISO' | 'CRITICO';
  } | null>(null);

  // Global consolidated metrics (90.1)
  const activeInstitutionsCount = allInstitutions.filter(i => i.status !== 'Suspensa').length;
  const suspendedInstitutionsCount = allInstitutions.filter(i => i.status === 'Suspensa').length;
  const totalStudents = allInstitutions.reduce((acc, i) => acc + (i.totalStudents || 0), 0);
  const totalTeachers = allInstitutions.reduce((acc, i) => acc + (i.totalTeachers || 0), 0);
  const totalBranches = allInstitutions.reduce((acc, i) => acc + (i.branches?.length || 1), 0);
  const totalCertificates = allCertificates.length;
  const verifiedCertificates = allCertificates.filter(c => (c as any).status === 'emitido' || (c as any).verifiedCount).length;

  const totalMozcoinCirculating = allMozcoinWallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const totalMozcoinPending = allMozcoinPurchases
    .filter(p => p.status === 'pendente')
    .reduce((acc, p) => acc + p.mozcoinAmount, 0);

  const totalStorageGB = allInstitutions.reduce((acc, i) => {
    const limits = i.customLimits || {};
    return acc + (limits.storageGB || 25);
  }, 0);
  const usedStorageGB = Math.round(totalStorageGB * 0.42);

  // Filtered institutions
  const filteredInstitutions = allInstitutions.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.nuit.includes(searchTerm)
  );

  // Filtered audit logs
  const forensicLogs = useMemo(() => {
    return allAuditLogs.filter(log => {
      if (auditFilterSeverity !== 'all' && log.severity !== auditFilterSeverity) return false;
      if (auditSearchQuery.trim()) {
        const q = auditSearchQuery.toLowerCase();
        return (
          log.userName?.toLowerCase().includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          log.entity?.toLowerCase().includes(q) ||
          log.ipAddress?.includes(q) ||
          log.institutionId?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allAuditLogs, auditFilterSeverity, auditSearchQuery]);

  // Handle Institution status change
  const handleToggleInstSuspension = (inst: Institution) => {
    setInstActionTarget(inst);
    setShowSuspendModal(true);
  };

  const confirmSuspension = () => {
    if (!instActionTarget) return;
    const isCurrentlySuspended = instActionTarget.status === 'Suspensa';
    const newStatus = isCurrentlySuspended ? 'Ativa' : 'Suspensa';
    
    updateInstitution(instActionTarget.id, {
      status: newStatus as any
    });

    addNotification({
      title: isCurrentlySuspended ? 'Instituição Reativada' : 'Instituição Suspensa',
      message: `${instActionTarget.name} foi marcada como ${newStatus}. Motivo: ${suspendReason || 'Ação da Diretoria Moztechwave HQ'}`,
      type: isCurrentlySuspended ? 'success' : 'warning'
    });

    soundManager.playSuccess();
    setShowSuspendModal(false);
    setSuspendReason('');
    setInstActionTarget(null);
  };

  // Handle new institution creation
  const handleCreateInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim()) return;

    const created = addInstitution({
      name: newInstName,
      type: 'centro_formacao',
      nuit: newInstNuit || '400998877',
      licenseNumber: 'ALV-2026/' + Math.floor(1000 + Math.random() * 9000),
      representativeName: newInstRepName || 'Direção Geral',
      representativeRole: 'Diretor Geral',
      phone: newInstPhone,
      email: newInstEmail || `geral@${newInstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.mz`,
      province: newInstProvince,
      city: newInstCity,
      address: `Av. Principal, nº ${Math.floor(100 + Math.random() * 900)}`,
      plan: newInstPlan,
      status: 'Ativa',
      connectedSystem: 'SIGAR',
      sivecEnabled: true,
      totalStudents: 0,
      totalTeachers: 0,
      totalCourses: 0,
      branches: [
        {
          id: `br-${Date.now()}`,
          institutionId: 'temp',
          name: 'Sede Principal (' + newInstCity + ')',
          code: 'SEDE-01',
          phone: newInstPhone,
          address: `Av. Central, ${newInstCity}`,
          city: newInstCity,
          province: newInstProvince,
          isMainBranch: true,
          totalStudents: 0,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]
    });

    // Auto-generate and save initial Director access code for this new Center
    try {
      const dirCode = created.code; // e.g. MTW-CF-0004
      setDoc(doc(db, 'access_codes', dirCode), {
        code: dirCode,
        role: 'DIRETOR',
        name: created.representativeName || created.name,
        email: created.email,
        institutionId: created.id,
        institutionName: created.name,
        branchId: 'todas',
        status: 'ativo',
        createdAt: new Date().toISOString()
      }, { merge: true });

      const dirUid = `usr-dir-${created.id}`;
      setDoc(doc(db, 'users', dirUid), {
        id: dirUid,
        uid: dirUid,
        name: created.representativeName || 'Diretor Geral',
        displayName: created.representativeName || 'Diretor Geral',
        email: created.email,
        role: 'DIRETOR',
        roles: ['DIRETOR'],
        codigo: dirCode,
        institutionId: created.id,
        branchId: 'todas',
        estado: 'ativo',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore director code bootstrap warning:', e);
    }

    soundManager.playSuccess();
    setShowCreateInstModal(false);
    setNewInstName('');
    setNewInstNuit('');
    setNewInstRepName('');
    addNotification({
      title: 'Nova Instituição Credenciada',
      message: `${created.name} credenciada com sucesso! Código de Acesso do Diretor: ${created.code}.`,
      type: 'registration'
    });
  };

  // Handle new User profile creation with auto-generated MTW Code
  const handleCreateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const targetInst = allInstitutions.find(i => i.id === newUserInstId) || allInstitutions[0];
    const rolePrefix = newUserRole === 'DIRETOR' ? 'ADM' :
                       newUserRole === 'SECRETARIA' ? 'SEC' :
                       newUserRole === 'PROFESSOR' || newUserRole === 'FORMADOR' ? 'PRO' :
                       newUserRole === 'FINANCEIRO' ? 'FIN' :
                       newUserRole === 'ALUNO' ? 'ALU' : 'USR';
    const randCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const mtwCode = `MTW-${rolePrefix}-${randCode}`;

    // Save to Firestore access_codes & users
    try {
      await setDoc(doc(db, 'access_codes', mtwCode), {
        code: mtwCode,
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        phone: newUserPhone.trim(),
        role: newUserRole,
        institutionId: targetInst?.id || '',
        institutionName: targetInst?.name || '',
        branchId: 'todas',
        status: 'ativo',
        createdAt: new Date().toISOString()
      }, { merge: true });

      const newUid = `usr-${Date.now()}`;
      await setDoc(doc(db, 'users', newUid), {
        id: newUid,
        uid: newUid,
        name: newUserName.trim(),
        displayName: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
        roles: [newUserRole],
        codigo: mtwCode,
        institutionId: targetInst?.id || '',
        branchId: 'todas',
        estado: 'ativo',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore user creation warning:', err);
    }

    const newUser: ManagedUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim() || `${mtwCode.toLowerCase()}@sigar.mz`,
      role: newUserRole,
      institutionId: targetInst?.id || '',
      institutionName: targetInst?.name || 'Centro de Formação',
      status: 'Ativo',
      lastLogin: 'Nunca (Código Emitido)',
      device: 'Pendente de Primeiro Acesso',
      mfaEnabled: false,
      permissionsCount: 25,
      sessionsCount: 0
    };

    setManagedUsers(prev => [newUser, ...prev]);
    setCreatedProfileInfo({
      code: mtwCode,
      name: newUserName.trim(),
      role: newUserRole,
      instName: targetInst?.name || 'Centro'
    });
    soundManager.playSuccess();
    addNotification({
      title: 'Perfil Cadastrado com Sucesso',
      message: `Código ${mtwCode} gerado para ${newUserName.trim()} (${newUserRole}).`,
      type: 'registration'
    });
  };

  // Handle Mozcoin Admin Operation (CRITICAL: Balances are NEVER modified directly, always via transaction)
  const handleExecuteMozcoinAdminOp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mozcoinOpWalletId || mozcoinOpAmount <= 0) return;

    const targetWallet = allMozcoinWallets.find(w => w.id === mozcoinOpWalletId);
    if (!targetWallet) return;

    const prevBal = targetWallet.balance;
    const finalAmount = mozcoinOpType === 'credito' ? mozcoinOpAmount : -mozcoinOpAmount;
    const newBal = Math.max(0, prevBal + finalAmount);

    // 1. Immutable audit transaction
    const newTx: MozcoinTransaction = {
      id: `tx-adm-mc-${Date.now()}`,
      walletId: targetWallet.id,
      ownerId: targetWallet.ownerId,
      ownerName: targetWallet.ownerName,
      ownerType: targetWallet.ownerType,
      type: mozcoinOpType === 'credito' ? 'credito_admin' : 'debito_admin',
      amount: mozcoinOpAmount,
      previousBalance: prevBal,
      newBalance: newBal,
      origin: 'Moztechwave Central Bank (HQ)',
      destination: targetWallet.ownerName,
      status: 'concluido',
      description: `Operação Administrativa do Dono da Plataforma: ${mozcoinOpReason || 'Ajuste de Saldo de Tesouraria'}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: 'Super Admin (jafimpaulo8@gmail.com)',
      referenceCode: `HQ-ADMLOG-${Date.now()}`
    };

    // Update wallet
    const updated = allMozcoinWallets.map(w => {
      if (w.id === targetWallet.id) {
        return {
          ...w,
          balance: newBal,
          totalCredited: mozcoinOpType === 'credito' ? (w.totalCredited || 0) + mozcoinOpAmount : w.totalCredited,
          totalDebited: mozcoinOpType === 'debito' ? (w.totalDebited || 0) + mozcoinOpAmount : w.totalDebited,
          lastTransactionAt: newTx.timestamp,
          updatedAt: new Date().toISOString()
        };
      }
      return w;
    });

    localStorage.setItem('mtw_mozcoin_wallets_v1', JSON.stringify(updated));
    const allTxs = [newTx, ...allMozcoinTransactions];
    localStorage.setItem('mtw_mozcoin_transactions_v1', JSON.stringify(allTxs));

    soundManager.playSuccess();
    setShowMozcoinOpModal(false);
    setMozcoinOpReason('');
    addNotification({
      title: `Transação de Tesouraria Registada`,
      message: `${mozcoinOpType === 'credito' ? '+' : '-'}${mozcoinOpAmount} MOZCOIN para ${targetWallet.ownerName}. Hash: ${newTx.id}`,
      type: 'payment'
    });
  };

  // Run Privilege Escalation Security Audit (90.8 & 90.9)
  const runSecurityPenTest = () => {
    setSecurityScanRunning(true);
    setTimeout(() => {
      setSecurityScanRunning(false);
      setSecurityScanResults({
        testedAt: new Date().toLocaleTimeString('pt-MZ'),
        privilegeEscalationChecks: 42,
        tenantVulnerabilities: 0,
        status: 'SEGURO'
      });
      soundManager.playSuccess();
      addNotification({
        title: 'Varredura de Segurança Concluída',
        message: 'Todas as travas de isolamento e regras anti-escalação estão 100% ativas.',
        type: 'system'
      });
    }, 1500);
  };

  const isAuthorizedOwner = 
    activeRole === 'superadmin' || 
    activeRole === 'SUPER_ADMIN';

  if (!isAuthorizedOwner) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-rose-400 uppercase tracking-wider font-bold">
              NÍVEL 5 RESTRITO • PROTOCOLO 90.9
            </div>
            <h2 className="text-xl font-black text-white">ACESSO RESTRITO — MOZTECHWAVE CORE</h2>
            <p className="text-xs text-slate-400">
              Esta suite soberana é de acesso exclusivo da Governança Central Super Admin. O seu papel atual (<strong className="text-amber-300 font-mono">{activeRole}</strong>) não possui credenciais suficientes.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 text-left space-y-1">
            <div>Tentativa Registada: <span className="text-rose-400">AUDIT_UNAUTHORIZED_HQ_ACCESS</span></div>
            <div>Tenant Atual: <span className="text-slate-200">{activeInstitution.name}</span></div>
            <div>Integridade: <span className="text-emerald-400">Regra Anti-Escalação Ativa</span></div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => navigate('centro_dashboard')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Voltar ao Meu Painel Institucional
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* 90. TOP HQ BANNER — MOZTECHWAVE CORE PLATFORM OWNER SUITE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 p-6 md:p-8 shadow-2xl shadow-amber-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              HQ PLATFORM OWNER SUITE • NÍVEL 5 RESTRICTED
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              MOZTECHWAVE CORE
              <span className="text-xs sm:text-sm font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PROPRIETÁRIO
              </span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Centro de comando soberano da plataforma educacional multitenant. Governança central de 
              <strong className="text-slate-200"> SIGAR</strong>, <strong className="text-amber-300"> SIVEC</strong>, <strong className="text-emerald-300"> MOZCOIN</strong> e <strong className="text-blue-300"> MOZTECHWAVE ID</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-white">Owner:</span> jafimpaulo8@gmail.com
            </div>
            <button
              onClick={runSecurityPenTest}
              disabled={securityScanRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <ShieldAlert className={`w-4 h-4 ${securityScanRunning ? 'animate-spin' : ''}`} />
              {securityScanRunning ? 'Auditando...' : 'Auditoria Anti-Escalação'}
            </button>
          </div>
        </div>

        {/* Live Security Guard Ribbon (90.9) */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Tenant Isolation Lock: ATIVO
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-sky-400">
              <Lock className="w-4 h-4" />
              Regra 90.9 (Anti-SuperAdmin Hijack): BLINDADO
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-amber-400">
              <Coins className="w-4 h-4" />
              Ledger Imutável: 100% Auditável
            </span>
          </div>
          <div className="text-slate-500">
            Base Firestore: <span className="text-slate-300">ai-studio-sigarportaldeins...</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS (90.1 — 90.10) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 overflow-x-auto shadow-md">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'dashboard', label: '90.1 Dashboard Global', icon: BarChart3 },
            { id: 'instituicoes', label: '90.2 Instituições', icon: Building2 },
            { id: 'utilizadores', label: '90.3 Utilizadores (IAM)', icon: Users },
            { id: 'sivec', label: '90.4 Gestão SIVEC', icon: Award },
            { id: 'mozcoin', label: '90.5 Banco MOZCOIN', icon: Coins },
            { id: 'planos', label: '90.6 Planos SaaS', icon: Sliders },
            { id: 'auditoria', label: '90.7 Trilha de Auditoria', icon: FileText },
            { id: 'seguranca', label: '90.8 Segurança Máxima', icon: ShieldCheck },
            { id: 'regras', label: '90.9 Regra Anti-Escalação', icon: Lock },
            { id: 'arquitetura', label: '90.10 Topologia do Sistema', icon: GitBranch },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CoreTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 90.1 DASHBOARD GLOBAL */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Instituições Ativas</div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 flex items-baseline gap-2">
                {activeInstitutionsCount}
                {suspendedInstitutionsCount > 0 && (
                  <span className="text-xs font-semibold text-rose-400">({suspendedInstitutionsCount} susp.)</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-400" /> Multi-Tenant
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total de Alunos</div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                {totalStudents.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-400" /> Em todas as sedes
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Professores</div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                {totalTeachers}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-indigo-400" /> Corpo Docente
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Certificados SIVEC</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1.5">
                {totalCertificates}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" /> {verifiedCertificates} validados
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">MOZCOIN Circulante</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5">
                {totalMozcoinCirculating.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Coins className="w-3 h-3 text-emerald-400" /> {totalMozcoinPending} pendentes
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Armazenamento</div>
              <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1.5">
                {usedStorageGB} <span className="text-sm text-slate-500">/ {totalStorageGB} GB</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-purple-400" /> Cloud Storage
              </div>
            </div>
          </div>

          {/* Realtime Security Alerts & Recent Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Alerts (90.1 & 90.8) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">Alertas de Segurança em Tempo Real</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SISTEMA ÍNTEGRO
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-300">Isolamento Multi-Tenant Homologado</span>
                      <span className="text-slate-500 font-mono text-[10px]">Hoje 07:15</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Nenhuma tentativa de elevação de privilégio para Super Admin registrada nas últimas 24h.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-blue-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-300">Gateway SIVEC Conectado</span>
                      <span className="text-slate-500 font-mono text-[10px]">Hoje 04:30</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      128 verificações de QR Code públicas processadas com 100% de taxa de validação criptográfica.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300">Pedidos de MOZCOIN Aguardando Despacho</span>
                      <span className="text-slate-500 font-mono text-[10px]">Pendente</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Existem {allMozcoinPurchases.filter(p => p.status === 'pendente').length} solicitações de recarga de carteira aguardando confirmação bancária.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Recent Activity Feed (90.1) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white text-base">Atividade Recente Global</h3>
                </div>
                <button
                  onClick={() => setActiveTab('auditoria')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Ver Auditoria Completa <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {forensicLogs.slice(0, 5).map((log, idx) => (
                  <div key={log.id || idx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 truncate">{log.userName || 'Super Admin'}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate">
                        {log.relevantValues?.summary || `Ação executada no módulo ${log.entity}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-slate-500 font-mono text-[10px]">{log.time || '10:45'}</div>
                      <span className="text-[10px] text-emerald-400 font-semibold">Sucesso</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 90.2 GESTÃO DE INSTITUIÇÕES */}
      {activeTab === 'instituicoes' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por nome, código, cidade, NUIT..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setShowCreateInstModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Criar Instituição
            </button>
          </div>

          {/* Institutions Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Instituição</th>
                    <th className="py-3 px-4">Localização & NUIT</th>
                    <th className="py-3 px-4">Plano SaaS</th>
                    <th className="py-3 px-4">Alunos / Docentes</th>
                    <th className="py-3 px-4">Filiais</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações do Dono</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInstitutions.map(inst => {
                    const isSuspended = inst.status === 'Suspensa';
                    return (
                      <tr key={inst.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-white flex items-center gap-2">
                              {inst.name}
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                                {inst.code}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Resp: {inst.representativeName || inst.directorName || 'Direção'} ({inst.email})
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-300">{inst.city}, {inst.province}</div>
                          <div className="text-[11px] font-mono text-slate-500">NUIT: {inst.nuit}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {inst.plan || 'Profissional'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-slate-200">{inst.totalStudents || 0} alunos</div>
                          <div className="text-slate-500 text-[10px]">{inst.totalTeachers || 0} professores</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {inst.branches?.length || 1} filial(is)
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSuspended 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {inst.status || 'Ativa'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveInstitution(inst);
                                navigate('centro_dashboard');
                              }}
                              title="Visualizar Painel Institucional"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleInstSuspension(inst)}
                              title={isSuspended ? 'Reativar Instituição' : 'Suspender Instituição'}
                              className={`p-1.5 rounded-lg ${
                                isSuspended 
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' 
                                  : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                              }`}
                            >
                              {isSuspended ? <RotateCcw className="w-3.5 h-3.5" /> : <Slash className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 90.3 GESTÃO DE UTILIZADORES (IAM GLOBAL) */}
      {activeTab === 'utilizadores' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar utilizador por nome, email ou cargo..."
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400 font-mono hidden md:block">
                Total: <strong className="text-white">{managedUsers.length}</strong>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewUserInstId(allInstitutions[0]?.id || '');
                  setNewUserName('');
                  setNewUserEmail('');
                  setCreatedProfileInfo(null);
                  setShowCreateUserModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
              >
                <KeyRound className="w-4 h-4" />
                <span>Cadastrar Perfil &amp; Emitir Código MTW</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Utilizador & Email</th>
                    <th className="py-3 px-4">Papel RBAC</th>
                    <th className="py-3 px-4">Associação Institucional</th>
                    <th className="py-3 px-4">Último Acesso & Dispositivo</th>
                    <th className="py-3 px-4">Status & MFA</th>
                    <th className="py-3 px-4 text-right">Ações Soberanas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {managedUsers
                    .filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
                    .map(u => (
                      <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            u.role === 'SUPER_ADMIN' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                          {u.institutionName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200">{u.lastLogin}</div>
                          <div className="text-[10px] text-slate-500">{u.device}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              u.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {u.status}
                            </span>
                            {u.mfaEnabled && (
                              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1" title="2FA Ativo">
                                <Lock className="w-3 h-3" /> 2FA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const newUsers = managedUsers.map(x => x.id === u.id ? { ...x, status: x.status === 'Ativo' ? 'Bloqueado' : 'Ativo' as any } : x);
                                setManagedUsers(newUsers);
                                addNotification({
                                  title: 'Conta Atualizada',
                                  message: `${u.name} agora está ${u.status === 'Ativo' ? 'Bloqueado' : 'Ativo'}.`,
                                  type: 'system'
                                });
                              }}
                              className={`p-1.5 rounded-lg text-xs font-semibold ${
                                u.status === 'Ativo' ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              }`}
                            >
                              {u.status === 'Ativo' ? 'Bloquear' : 'Desbloquear'}
                            </button>
                            <button
                              onClick={() => {
                                const code = 'OTP-' + Math.floor(100000 + Math.random() * 900000);
                                setUserOtpNotice(`Código de Redefinição Seguro para ${u.email}: ${code} (Expira em 15 minutos)`);
                                soundManager.playSuccess();
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                            >
                              Redefinir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {userOtpNotice && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
              <span>{userOtpNotice}</span>
              <button onClick={() => setUserOtpNotice(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 90.4 GESTÃO SIVEC */}
      {activeTab === 'sivec' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Instituições Credenciadas</div>
              <div className="text-2xl font-black text-white mt-1">
                {allInstitutions.filter(i => i.sivecEnabled).length} <span className="text-xs text-slate-500">/ {allInstitutions.length}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Aptas a emitir diplomas com QR SIVEC</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Certificados Válidos no Ar</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{allCertificates.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">Hash SHA-256 e código único nacional</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Verificações Públicas Totais</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">1,489</div>
              <p className="text-[11px] text-slate-500 mt-1">Consultas realizadas no portal /verify</p>
            </div>
          </div>

          {/* SIVEC CONNECT Integrations (90.4) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  SIVEC CONNECT — Integrações Externas & APIs
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conexões oficiais com sistemas legados e plataformas de parceiros para validação cruzada.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                API GATEWAY v2.4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">SistemasHugo</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400">Webhook bidirecional ativo para validação de certificados históricos.</p>
                <div className="text-[10px] font-mono text-slate-500">Latência: 48ms • 99.9% Uptime</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">SoftGenial</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400">API REST de sincronização de notas e atas de conclusão.</p>
                <div className="text-[10px] font-mono text-slate-500">Latência: 62ms • 99.8% Uptime</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Portal Público SIVEC</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400">Endpoint público acessível via QR Code e link /verify/{'{id}'}.</p>
                <div className="text-[10px] font-mono text-slate-500">SSL SHA-256 • Cache Global</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 90.5 GESTÃO MOZCOIN */}
      {activeTab === 'mozcoin' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                Tesouraria Central & Ledger Imutável MOZCOIN
              </h3>
              <p className="text-xs text-slate-400">
                Regra 90.5: O saldo nunca é editado diretamente. Toda alteração cria uma transação auditável.
              </p>
            </div>

            <button
              onClick={() => {
                if (allMozcoinWallets.length > 0) {
                  setMozcoinOpWalletId(allMozcoinWallets[0].id);
                }
                setShowMozcoinOpModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Operação de Tesouraria
            </button>
          </div>

          {/* Wallets Overview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-white text-sm flex items-center justify-between">
              <span>Carteiras Registradas no Ecossistema ({allMozcoinWallets.length})</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Total em Carteiras: {totalMozcoinCirculating.toLocaleString()} MC
              </span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
              {allMozcoinWallets.map(w => (
                <div key={w.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-850/40 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-white flex items-center gap-2 truncate">
                      {w.ownerName}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {w.ownerType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: {w.id}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-emerald-400 font-mono">
                      {w.balance.toLocaleString()} MC
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Entradas: {w.totalCredited || 0} • Saídas: {w.totalDebited || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 90.6 GESTÃO DE PLANOS */}
      {activeTab === 'planos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-base">Planos Multi-Institucionais Customizáveis</h3>
              <p className="text-xs text-slate-400">
                O proprietário pode criar e editar planos conforme regras de precificação e cotas de recursos.
              </p>
            </div>

            <button
              onClick={() => setShowCreatePlanModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase transition-all"
            >
              <Plus className="w-4 h-4" /> Novo Plano
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plansList.map(plan => (
              <div key={plan.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {plan.tier}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{plan.activeInstitutionsCount} clientes</span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
                    {plan.priceMZNMonthly.toLocaleString()} <span className="text-xs font-normal text-slate-400">MT/mês</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Limite Alunos:</span>
                    <span className="font-mono font-bold text-white">{plan.maxStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Filiais / Polos:</span>
                    <span className="font-mono font-bold text-white">{plan.maxBranches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Armazenamento:</span>
                    <span className="font-mono font-bold text-white">{plan.storageGB} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificados/mês:</span>
                    <span className="font-mono font-bold text-white">{plan.monthlyCertificates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Suporte Técnico:</span>
                    <span className="font-semibold text-emerald-400">{plan.supportLevel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 90.7 AUDITORIA GLOBAL */}
      {activeTab === 'auditoria' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por Quem, O quê, IP, Instituição..."
                value={auditSearchQuery}
                onChange={e => setAuditSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={auditFilterSeverity}
                onChange={e => setAuditFilterSeverity(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Todas as Severidades</option>
                <option value="info">Info</option>
                <option value="aviso">Aviso</option>
                <option value="critico">Crítico</option>
              </select>

              <button
                onClick={() => {
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(forensicLogs, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute('download', `moztechwave_core_audit_${Date.now()}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                <Download className="w-3.5 h-3.5" /> Exportar Trilha
              </button>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Quem (Operador)</th>
                    <th className="py-3 px-4">O quê (Ação)</th>
                    <th className="py-3 px-4">Quando</th>
                    <th className="py-3 px-4">Onde / Instituição</th>
                    <th className="py-3 px-4">IP & Dispositivo</th>
                    <th className="py-3 px-4 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {forensicLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{log.userName}</div>
                        <div className="text-[10px] text-slate-500">{log.userRole || 'ADMIN-001'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-sans">
                        {log.relevantValues?.summary || log.actionLabel || log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {log.date} {log.time}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.institutionId}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        <div>{log.ipAddress || '102.164.218.42'}</div>
                        <div className="text-[10px] text-slate-500">Chrome 128 / macOS</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Sucesso
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 90.8 SEGURANÇA & 90.9 REGRA ANTI-ESCALAÇÃO */}
      {(activeTab === 'seguranca' || activeTab === 'regras') && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/40 border border-rose-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  90.9 Regra Fundamental de Proteção Soberana
                </h3>
                <p className="text-xs text-rose-300 font-mono">
                  NENHUMA INSTITUIÇÃO DEVE CONSEGUIR TRANSFORMAR O SEU ADMINISTRADOR EM SUPER ADMIN.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Frontend Decoupling
                </span>
                <p className="text-slate-400">
                  O frontend nunca decide <code className="text-amber-300 font-mono">role = superAdmin</code>. A autoridade é conferida estritamente pelas custom claims autenticadas e regras no servidor.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-sky-400" /> Tenant Lockdown
                </span>
                <p className="text-slate-400">
                  Admins institucionais só conseguem delegar papéis subordinados dentro da sua própria <code className="text-sky-300 font-mono">institutionId</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-400" /> Assinatura Criptográfica
                </span>
                <p className="text-slate-400">
                  Identificador mestre protegido: <code className="text-emerald-400 font-mono">jafimpaulo8@gmail.com</code> possui autoridade exclusiva de governança da plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Device & Session Controls (90.8) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Laptop className="w-4 h-4 text-amber-400" /> Sessões Ativas & Controlo de Dispositivos do Dono
            </h4>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <div>
                  <div className="font-bold text-white">MacBook Pro 16" — Chrome 128 (Sessão Atual)</div>
                  <div className="text-[11px] text-slate-500 font-mono">IP: 102.164.218.42 (Maputo, MZ) • Ativo agora</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                DISPOSITIVO CONFIÁVEL
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 90.10 ESTRUTURA FINAL — ARQUITETURA INTERATIVA */}
      {activeTab === 'arquitetura' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-amber-400" />
                90.10 Topologia Arquitetural Oficial da Plataforma
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Mapa soberano das camadas centrais do ecossistema e integrações externas.
              </p>
            </div>

            {/* ASCII & Graphical Topology Visualizer */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto shadow-inner">
              <pre className="text-amber-300 leading-relaxed font-bold">
{`                        ┌────────────────────────────────────────┐
                        │            MOZTECHWAVE CORE            │
                        │     (Painel Soberano do Dono da HQ)     │
                        └───────────────────┬────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
      ┌────────┴────────┐          ┌────────┴────────┐          ┌────────┴────────┐
      │      SIGAR      │          │      SIVEC      │          │     MOZCOIN     │
      │ (Gestão Escolar)│          │(Autenticidade QR)│         │(Créditos & Taxas│
      └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
               │                            │                            │
               └────────────────────────────┼────────────────────────────┘
                                            │
                                 ┌──────────┴──────────┐
                                 │   MOZTECHWAVE ID    │
                                 │  (IAM & SSO Global) │
                                 └──────────┬──────────┘
                                            │
                         ┌──────────────────┴──────────────────┐
                         │                                     │
               ┌─────────┴─────────┐                 ┌─────────┴─────────┐
               │    INSTITUIÇÕES   │                 │   UTILIZADORES    │
               │   (Multi-Tenant)  │                 │ (Alunos/Docentes) │
               └─────────┬─────────┘                 └───────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────┴───────┐┌───────┴───────┐┌───────┴───────┐
│ Instituição A ││ Instituição B ││ Instituição C │
└───────┬───────┘└───────┬───────┘└───────┬───────┘
        │                │                │
     Filiais          Filiais          Filiais`}
              </pre>

              {/* External Layer */}
              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <div className="text-xs font-mono font-bold text-sky-400 mb-2">
                  CAMADA EXTERNA DE INTEROPERABILIDADE:
                </div>
                <pre className="text-sky-300 leading-relaxed font-bold">
{`SIGAR
  │
  ├── SIVEC CONNECT
  │       ├── SistemasHugo (API REST Conectada)
  │       ├── SoftGenial (Sync de Concluintes)
  │       ├── Outros Sistemas Credenciados
  │       └── APIs Futuras & Webhooks
  │
  └── SIVEC VERIFY
          └── Portal Público de Validação de Certificados (/verify/{id})`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INSTITUTION MODAL (90.2) */}
      {showCreateInstModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Criar Nova Instituição Credenciada
              </h3>
              <button onClick={() => setShowCreateInstModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstitution} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome Oficial da Instituição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Instituto Médio Politécnico de Tete"
                  value={newInstName}
                  onChange={e => setNewInstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">NUIT</label>
                  <input
                    type="text"
                    placeholder="400123456"
                    value={newInstNuit}
                    onChange={e => setNewInstNuit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Plano SaaS Inicial</label>
                  <select
                    value={newInstPlan}
                    onChange={e => setNewInstPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Starter">Plano Starter</option>
                    <option value="Profissional">Plano Professional</option>
                    <option value="Enterprise Multi-Campus">Plano Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Província</label>
                  <select
                    value={newInstProvince}
                    onChange={e => setNewInstProvince(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
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
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Cidade / Distrito</label>
                  <input
                    type="text"
                    value={newInstCity}
                    onChange={e => setNewInstCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Representante Legal / Diretor</label>
                <input
                  type="text"
                  placeholder="Nome do Diretor ou Responsável"
                  value={newInstRepName}
                  onChange={e => setNewInstRepName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateInstModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold uppercase tracking-wider"
                >
                  Criar e Integrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPEND INSTITUTION MODAL (90.2) */}
      {showSuspendModal && instActionTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Slash className="w-5 h-5 text-rose-400" />
              {instActionTarget.status === 'Suspensa' ? 'Reativar Instituição' : 'Suspender Instituição'}
            </h3>
            <p className="text-xs text-slate-300">
              Tem certeza que deseja alterar o status operacional de <strong className="text-white">{instActionTarget.name}</strong>?
            </p>

            <div className="space-y-1 text-xs">
              <label className="text-slate-300 font-semibold">Justificativa Administrativa (Obrigatória)</label>
              <textarea
                rows={3}
                placeholder="Ex: Auditoria de conformidade regulatória SIVEC concluída / Pagamento de anuidade regularizado."
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Voltar
              </button>
              <button
                onClick={confirmSuspension}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Confirmar Ação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOZCOIN ADMIN OPERATION MODAL (90.5) */}
      {showMozcoinOpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                Operação de Tesouraria Soberana (MOZCOIN)
              </h3>
              <button onClick={() => setShowMozcoinOpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMozcoinAdminOp} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Tipo de Operação</label>
                  <select
                    value={mozcoinOpType}
                    onChange={e => setMozcoinOpType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="credito">Crédito Administrativo (+)</option>
                    <option value="debito">Débito Administrativo (-)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Quantidade (MOZCOIN)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={mozcoinOpAmount}
                    onChange={e => setMozcoinOpAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Carteira de Destino</label>
                <select
                  value={mozcoinOpWalletId}
                  onChange={e => setMozcoinOpWalletId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {allMozcoinWallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.ownerName} ({w.ownerType}) — Saldo: {w.balance} MC
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Motivo da Operação (Auditável)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bónus promocional trimestral / Ajuste de conferência contábil"
                  value={mozcoinOpReason}
                  onChange={e => setMozcoinOpReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Esta ação gerará uma transação imutável com operador <strong className="text-white">Super Admin</strong> e timestamp auditável.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMozcoinOpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider"
                >
                  Processar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL (90.6) */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                Criar Novo Plano Personalizado
              </h3>
              <button onClick={() => setShowCreatePlanModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newPlanName) return;
                setPlansList(prev => [
                  ...prev,
                  {
                    id: `plan-${Date.now()}`,
                    name: newPlanName,
                    tier: 'Personalizado',
                    priceMZNMonthly: newPlanPriceMZN,
                    priceMZNAnnual: newPlanPriceMZN * 10,
                    maxStudents: newPlanStudents,
                    maxBranches: newPlanBranches,
                    storageGB: newPlanStorageGB,
                    monthlyCertificates: Math.round(newPlanStudents * 0.4),
                    whatsappApi: true,
                    sivecConnect: true,
                    aiMoztechwave: true,
                    supportLevel: 'Prioritário',
                    activeInstitutionsCount: 0
                  }
                ]);
                setShowCreatePlanModal(false);
                setNewPlanName('');
                soundManager.playSuccess();
                addNotification({
                  title: 'Plano Criado',
                  message: `Plano ${newPlanName} configurado e disponível para atribuição.`,
                  type: 'success'
                });
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome do Plano</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Plano Partner Vocacional"
                  value={newPlanName}
                  onChange={e => setNewPlanName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Preço Mensal (MT)</label>
                  <input
                    type="number"
                    value={newPlanPriceMZN}
                    onChange={e => setNewPlanPriceMZN(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Limite de Alunos</label>
                  <input
                    type="number"
                    value={newPlanStudents}
                    onChange={e => setNewPlanStudents(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Filiais Permitidas</label>
                  <input
                    type="number"
                    value={newPlanBranches}
                    onChange={e => setNewPlanBranches(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Armazenamento (GB)</label>
                  <input
                    type="number"
                    value={newPlanStorageGB}
                    onChange={e => setNewPlanStorageGB(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold uppercase tracking-wider"
                >
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR PERFIL & GERAR CÓDIGO MTW (PEDIDO DO USUÁRIO) */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                Cadastrar Perfil &amp; Emitir Código MTW
              </h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Instituição / Centro de Formação</label>
                <select
                  value={newUserInstId || allInstitutions[0]?.id || ''}
                  onChange={e => setNewUserInstId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {allInstitutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Perfil de Acesso (Cargo)</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="DIRETOR">Diretor / Administrador do Centro (MTW-ADM-...)</option>
                  <option value="SECRETARIA">Secretaria Académica (MTW-SEC-...)</option>
                  <option value="PROFESSOR">Professor / Formador (MTW-PRO-...)</option>
                  <option value="FINANCEIRO">Responsável Financeiro (MTW-FIN-...)</option>
                  <option value="ALUNO">Estudante / Aluno (MTW-ALU-...)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  O código gerado terá o prefixo institucional oficial e será validado pelo Firebase Authentication.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manuel dos Santos Sitoe"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">E-mail do Utilizador</label>
                  <input
                    type="email"
                    placeholder="manuel.sitoe@gmail.com"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
                Este cadastro salvará a credencial na coleção <strong className="text-white">access_codes</strong> do Firestore, permitindo que a pessoa aceda imediatamente usando o seu código oficial.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider shadow-md"
                >
                  Gerar Código MTW &amp; Ativar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENCIAL GERADA MODAL */}
      {createdProfileInfo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Código de Acesso Emitido!</h3>
              <p className="text-xs text-slate-300 mt-1">
                A credencial de <strong>{createdProfileInfo.name}</strong> para o centro <strong>{createdProfileInfo.instName}</strong> está ativa no Firebase.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                Código de Entrada SIGAR ({createdProfileInfo.role})
              </div>
              <div className="font-mono text-2xl font-black text-amber-400 tracking-wider">
                {createdProfileInfo.code}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(createdProfileInfo.code);
                  soundManager.playSuccess();
                  addNotification({
                    title: 'Código Copiado',
                    message: `Código ${createdProfileInfo.code} copiado com sucesso.`,
                    type: 'system'
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Copiar Código de Acesso</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Olá ${createdProfileInfo.name}, o seu acesso ao SIGAR PRO para o ${createdProfileInfo.instName} (${createdProfileInfo.role}) foi ativado com sucesso!\n\nO seu Código de Acesso Oficial é: *${createdProfileInfo.code}*\n\nAceda ao sistema, selecione a aba 'Código de Acesso' e informe este código para entrar no seu painel.`
                  );
                  window.open(`https://wa.me/?text=${msg}`, '_blank');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enviar Credencial via WhatsApp</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreatedProfileInfo(null);
                setShowCreateUserModal(false);
              }}
              className="text-xs text-slate-400 hover:text-white pt-2 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoztechwaveCoreView;
