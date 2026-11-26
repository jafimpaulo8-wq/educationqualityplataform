import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Mail,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  KeyRound,
  MessageCircle,
  Users,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import {
  CanonicalRole,
  Institution,
  Permission,
  ROLE_DEFINITIONS,
  UserInvitation,
  toCanonicalRole
} from '../../types';
import {
  createUserInvitation,
  getAllowedInviteRoles,
  listInstitutionUsers,
  listUserInvitations,
  revokeUserInvitation,
  sanitizeInvitePermissions,
  buildInviteActivationUrl
} from '../../services/inviteAuthService';
import { getRoleDisplayName } from '../../security/routeSecurity';
import { validateAndFormatInternationalPhone } from '../../utils/registrationConfigUtils';

interface UserInvitationsPanelProps {
  institution?: Institution | null;
  allowAllInstitutions?: boolean;
}

export const UserInvitationsPanel: React.FC<UserInvitationsPanelProps> = ({
  institution,
  allowAllInstitutions = false
}) => {
  const {
    activeInstitution,
    allInstitutions,
    firebaseUser,
    userProfile,
    activeRole,
    students,
    teachers,
    addNotification
  } = useApp();
  const { success, error: toastError } = useToast();

  const callerCanonical = toCanonicalRole(String(activeRole));
  const isSuperAdmin = callerCanonical === 'SUPER_ADMIN';

  const [selectedInstId, setSelectedInstId] = useState<string>(
    () => institution?.id || activeInstitution?.id || allInstitutions[0]?.id || ''
  );

  useEffect(() => {
    if (institution?.id) {
      setSelectedInstId(institution.id);
    } else if (!selectedInstId && activeInstitution?.id) {
      setSelectedInstId(activeInstitution.id);
    }
  }, [institution?.id, activeInstitution?.id]);

  const targetInstitution = useMemo(() => {
    if (!allowAllInstitutions && (institution || activeInstitution?.id)) {
      return institution || activeInstitution;
    }
    return allInstitutions.find((i) => i.id === selectedInstId) || institution || activeInstitution;
  }, [allowAllInstitutions, institution, activeInstitution, allInstitutions, selectedInstId]);

  const allowedRoles = useMemo<CanonicalRole[]>(
    () => getAllowedInviteRoles(callerCanonical),
    [callerCanonical]
  );

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<CanonicalRole>(() => allowedRoles[0] || 'ALUNO');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(() =>
    sanitizeInvitePermissions(callerCanonical, allowedRoles[0] || 'ALUNO')
  );
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [linkedEntityId, setLinkedEntityId] = useState<string>('');
  const [creating, setCreating] = useState(false);

  // Lists
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [institutionUsers, setInstitutionUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastCreatedResult, setLastCreatedResult] = useState<{
    invitation: UserInvitation;
    activationUrl: string;
  } | null>(null);

  useEffect(() => {
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      const nextRole = allowedRoles[0];
      setRole(nextRole);
      setSelectedPermissions(sanitizeInvitePermissions(callerCanonical, nextRole));
    }
  }, [allowedRoles, callerCanonical]);

  const handleRoleChange = (nextRole: CanonicalRole) => {
    setRole(nextRole);
    setSelectedPermissions(sanitizeInvitePermissions(callerCanonical, nextRole));
    setLinkedEntityId('');
  };

  const togglePermission = (perm: Permission) => {
    const ceiling = sanitizeInvitePermissions(callerCanonical, role);
    if (!ceiling.includes(perm)) return;
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const loadData = async () => {
    const instId = targetInstitution?.id || '';
    if (!instId && !isSuperAdmin) return;
    setLoadingData(true);
    try {
      const [invs, users] = await Promise.all([
        listUserInvitations(instId || 'all', isSuperAdmin && allowAllInstitutions && !selectedInstId),
        listInstitutionUsers(instId || 'all', isSuperAdmin && allowAllInstitutions && !selectedInstId)
      ]);
      setInvitations(invs);
      setInstitutionUsers(users);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetInstitution?.id, isSuperAdmin]);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInstitution?.id) {
      toastError('Instituição Necessária', 'Seleccione a instituição antes de gerar um convite.');
      return;
    }

    setCreating(true);
    try {
      const linkedType = role === 'ALUNO'
        ? (linkedEntityId ? 'student' : undefined)
        : (role === 'PROFESSOR' || role === 'FORMADOR')
          ? (linkedEntityId ? 'teacher' : undefined)
          : undefined;

      const result = await createUserInvitation(
        {
          uid: firebaseUser?.uid || userProfile?.id || 'admin',
          name: userProfile?.name || firebaseUser?.displayName || 'Administrador',
          email: firebaseUser?.email || userProfile?.email || '',
          role: callerCanonical,
          institutionId: isSuperAdmin ? targetInstitution.id : (userProfile?.institutionId || targetInstitution.id)
        },
        {
          fullName,
          email,
          phone,
          institutionId: targetInstitution.id,
          institutionName: targetInstitution.name,
          branchId: targetInstitution.branches?.[0]?.id || 'todas',
          role,
          permissions: selectedPermissions,
          linkedEntityType: linkedType,
          linkedEntityId: linkedEntityId || undefined,
          expiresInDays
        }
      );

      setLastCreatedResult(result);
      setFullName('');
      setEmail('');
      setPhone('');
      setLinkedEntityId('');
      success('Convite Gerado!', `Link único criado para ${result.invitation.fullName} (${result.invitation.role}).`);
      addNotification({
        title: 'Convite de Acesso Emitido',
        message: `${result.invitation.fullName} (${getRoleDisplayName(result.invitation.role)}) convidado para ${targetInstitution.name}.`,
        type: 'registration'
      });
      await loadData();
    } catch (err: any) {
      toastError('Erro ao Emitir Convite', err?.message || 'Não foi possível criar o convite.');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (inv: UserInvitation) => {
    try {
      await revokeUserInvitation(inv.id, firebaseUser?.uid || 'admin');
      success('Convite Revogado', `O link de activação para ${inv.email} foi anulado.`);
      await loadData();
    } catch (err: any) {
      toastError('Erro ao Revogar', err?.message || 'Não foi possível revogar o convite.');
    }
  };

  const getEffectiveStatus = (inv: UserInvitation): 'ativado' | 'revogado' | 'expirado' | 'pendente' => {
    if (inv.revoked || inv.status === 'revogado') return 'revogado';
    if (inv.used || inv.status === 'ativado') return 'ativado';
    const expMs = typeof inv.expiresAtMs === 'number' ? inv.expiresAtMs : new Date(inv.expiresAt).getTime();
    if (!Number.isFinite(expMs) || expMs <= Date.now()) return 'expirado';
    return 'pendente';
  };

  const availableCeilingPermissions = useMemo(
    () => sanitizeInvitePermissions(callerCanonical, role),
    [callerCanonical, role]
  );

  const filteredInvitations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return invitations;
    return invitations.filter(
      (i) =>
        i.fullName.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        String(i.role).toLowerCase().includes(q)
    );
  }, [invitations, searchTerm]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return institutionUsers;
    return institutionUsers.filter(
      (u) =>
        (u.name || u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        String(u.role || '').toLowerCase().includes(q)
    );
  }, [institutionUsers, searchTerm]);

  if (allowedRoles.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/30 text-center space-y-2">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-white">Sem Permissão para Emitir Convites</h3>
        <p className="text-xs text-slate-400">
          Apenas Super Admin, Admin Institucional, Direção e Secretaria (dentro do limite operacional) podem convidar utilizadores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Emissão de Convite Único */}
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-400" />
              Emitir Convite Oficial de Acesso (Uso Único)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Nenhum utilizador escolhe o seu próprio papel. O convite define o vínculo institucional, o papel e as permissões.
            </p>
          </div>
          {callerCanonical === 'SECRETARIA' && (
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Tecto Secretaria: Alunos, Docentes e Portaria
            </span>
          )}
        </div>

        <form onSubmit={handleCreateInvite} className="space-y-4">
          {allowAllInstitutions && isSuperAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Instituição de Destino *
              </label>
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-semibold focus:border-sky-500 focus:outline-hidden cursor-pointer"
              >
                <option value="">Seleccionar instituição...</option>
                {allInstitutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.code || inst.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Maria João Armando"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail do Convidado *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilizador@exemplo.co.mz"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telefone / WhatsApp (Opcional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+258 84 000 0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Perfil RBAC Atribuído *</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as CanonicalRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:border-sky-500 focus:outline-hidden cursor-pointer"
              >
                {allowedRoles.map((r) => (
                  <option key={r} value={r}>
                    {getRoleDisplayName(r)} ({r})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Validade do Convite (Dias)</label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-hidden cursor-pointer"
              >
                <option value={1}>24 horas (1 dia)</option>
                <option value={3}>3 dias</option>
                <option value={7}>7 dias (Recomendado)</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
              </select>
            </div>

            {role === 'ALUNO' && targetInstitution?.id === activeInstitution?.id && students.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Vincular Processo de Aluno (Opcional)
                </label>
                <select
                  value={linkedEntityId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setLinkedEntityId(sid);
                    const stu = students.find((s) => s.id === sid);
                    if (stu) {
                      if (!fullName) setFullName(stu.fullName);
                      if (!email && stu.email) setEmail(stu.email);
                      if (!phone && stu.phone) setPhone(stu.phone);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="">Sem vínculo prévio</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(role === 'PROFESSOR' || role === 'FORMADOR') &&
              targetInstitution?.id === activeInstitution?.id &&
              teachers.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Vincular Registo Docente (Opcional)
                  </label>
                  <select
                    value={linkedEntityId}
                    onChange={(e) => {
                      const tid = e.target.value;
                      setLinkedEntityId(tid);
                      const t = teachers.find((x) => x.id === tid);
                      if (t) {
                        if (!fullName) setFullName(t.fullName);
                        if (!email && t.email) setEmail(t.email);
                        if (!phone && t.phone) setPhone(t.phone);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Sem vínculo prévio</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
          </div>

          {/* Permissões autorizadas dentro do tecto */}
          <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Permissões Concedidas ao Convidado ({selectedPermissions.length}/{availableCeilingPermissions.length})
              </span>
              <button
                type="button"
                onClick={() => setSelectedPermissions([...availableCeilingPermissions])}
                className="text-[11px] text-sky-400 hover:underline cursor-pointer"
              >
                Restaurar padrão de {role}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {availableCeilingPermissions.map((perm) => {
                const checked = selectedPermissions.includes(perm);
                return (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => togglePermission(perm)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
                      checked
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {perm}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>{creating ? 'A gerar convite...' : 'Gerar Link Único de Activação'}</span>
            </button>
          </div>
        </form>

        {/* Resultado imediato do convite recém-criado */}
        {lastCreatedResult && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Convite gerado para {lastCreatedResult.invitation.fullName} ({getRoleDisplayName(lastCreatedResult.invitation.role)})
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                Expira em {new Date(lastCreatedResult.invitation.expiresAt).toLocaleDateString('pt-MZ')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={lastCreatedResult.activationUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={() => handleCopy(lastCreatedResult.activationUrl, 'last-invite')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'last-invite' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'last-invite' ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
              {validateAndFormatInternationalPhone(lastCreatedResult.invitation.phone) && (
                <button
                  type="button"
                  onClick={() => {
                    const phoneWa = validateAndFormatInternationalPhone(lastCreatedResult.invitation.phone);
                    const msg = encodeURIComponent(
                      `Olá ${lastCreatedResult.invitation.fullName}, foi convidado(a) para aceder ao SIGAR PRO (${targetInstitution?.name || 'Instituição'}) como ${getRoleDisplayName(lastCreatedResult.invitation.role)}. Active a sua conta aqui: ${lastCreatedResult.activationUrl}`
                    );
                    window.open(`https://wa.me/${phoneWa}?text=${msg}`, '_blank');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filtro & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#090d16] border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar convites ou utilizadores por nome, e-mail ou perfil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d1527] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
          />
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loadingData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* Lista de Convites Emitidos */}
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-400" />
            Convites de Activação ({filteredInvitations.length})
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            {targetInstitution?.name || 'Todas as Instituições'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1527] border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Convidado &amp; E-mail</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Validade</th>
                <th className="py-3 px-4 text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredInvitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum convite encontrado no Firestore para este filtro.
                  </td>
                </tr>
              ) : (
                filteredInvitations.map((inv) => {
                  const effStatus = getEffectiveStatus(inv);
                  const url = buildInviteActivationUrl(inv.token || inv.id);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{inv.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{inv.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono text-[10px] font-bold">
                          {getRoleDisplayName(inv.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {effStatus === 'ativado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Activado
                          </span>
                        )}
                        {effStatus === 'pendente' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}
                        {effStatus === 'revogado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-bold">
                            <Ban className="w-3 h-3" /> Revogado
                          </span>
                        )}
                        {effStatus === 'expirado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 text-[10px] font-bold">
                            <XCircle className="w-3 h-3" /> Expirado
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(inv.expiresAt).toLocaleDateString('pt-MZ')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {effStatus === 'pendente' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopy(url, inv.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                {copiedId === inv.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedId === inv.id ? 'Copiado' : 'Link'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRevoke(inv)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold cursor-pointer"
                              >
                                Revogar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utilizadores Registados no Firestore */}
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Utilizadores Associados no Firestore ({filteredUsers.length})
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1527] border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Utilizador &amp; E-mail</th>
                <th className="py-3 px-4">Papel</th>
                <th className="py-3 px-4">Instituição</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum utilizador encontrado para esta instituição.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{u.name || u.displayName || 'Utilizador'}</div>
                      <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                        {getRoleDisplayName(u.role || 'VISITANTE')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {allInstitutions.find((i) => i.id === u.institutionId)?.name || u.institutionId || 'Global'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        {u.estado || u.status || 'Activo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
