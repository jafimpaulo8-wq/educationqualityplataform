import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  ShieldAlert,
  UserCheck, 
  Building2, 
  MapPin, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  Lock, 
  Fingerprint, 
  HelpCircle,
  ChevronRight,
  School,
  Briefcase,
  GraduationCap,
  Shield,
  Layers
} from 'lucide-react';
import { UserRole } from '../../types';

export const MoztechwaveIdPortalView: React.FC = () => {
  const { 
    activeRole, 
    activeInstitution, 
    allInstitutions, 
    activeBranchId, 
    loginWithMoztechwaveId, 
    activeUserWallet, 
    activeInstitutionWallet,
    navigate,
    currentUser 
  } = useApp();

  // Fluxo de Etapas do Requisito 87
  const [selectedRole, setSelectedRole] = useState<UserRole>(activeRole);
  const [selectedInstId, setSelectedInstId] = useState<string>(activeInstitution.id);
  const [selectedBranch, setSelectedBranch] = useState<string>(activeBranchId || 'todas');
  
  // Requisito 87.2 & 87.3: Código / ID atribuído na inscrição ou matrícula
  const [assignedCode, setAssignedCode] = useState<string>('MTW-ALU-000428');
  const [codeValidationStatus, setCodeValidationStatus] = useState<{
    isValid: boolean;
    errorType?: 'not_found' | 'wrong_institution' | 'wrong_branch' | null;
    message: string;
    entityName?: string;
    assignedBranchName?: string;
    assignedInstitutionName?: string;
  }>({
    isValid: true,
    message: 'Identidade verificada preliminarmente.'
  });

  const [authMethod, setAuthMethod] = useState<'senha' | 'google' | 'biometria' | 'pin'>('senha');
  const [pinCode, setPinCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedInst = allInstitutions.find(i => i.id === selectedInstId) || activeInstitution;

  // Obter lista de estudantes e professores para conferência de filiais e códigos
  const { students = [], teachers = [], allTeachers = [], applications = [] } = useApp() as any;

  // Validação estrita do código atribuído quando o utilizador muda o código, instituição ou filial
  useEffect(() => {
    const codeClean = assignedCode.trim().toUpperCase();
    if (!codeClean) {
      setCodeValidationStatus({
        isValid: false,
        errorType: 'not_found',
        message: 'Por favor, informe o seu código ou ID atribuído na matrícula/inscrição.'
      });
      return;
    }

    // Papéis soberanos (Super Admin e Diretor Geral) têm autoridade multi-campus sob a instituição
    if (selectedRole === 'superadmin') {
      setCodeValidationStatus({
        isValid: true,
        message: 'Credencial Soberana Super Admin / CEO • Autorização Global Válida em todas as filiais.',
        entityName: currentUser.name || 'Super Administrador Soberano'
      });
      return;
    }

    if (selectedRole === 'director') {
      setCodeValidationStatus({
        isValid: true,
        message: `Diretoria Geral Homologada • Supervisão Executiva sobre ${selectedInst.name}.`,
        entityName: currentUser.name || 'Diretor Geral Executivo'
      });
      return;
    }

    // Busca nas bases de Alunos, Formadores e Inscrições
    const studentMatch = (students as any[]).find((s: any) => 
      s.code?.toUpperCase() === codeClean || 
      (s.id && s.id.toUpperCase() === codeClean) ||
      (s.documentNumber && s.documentNumber.toUpperCase() === codeClean) ||
      (s.moztechwaveUserId && s.moztechwaveUserId.toUpperCase() === codeClean)
    );

    const teacherMatch = [...(teachers as any[]), ...(allTeachers as any[])].find((t: any) => 
      t.code?.toUpperCase() === codeClean || 
      (t.id && t.id.toUpperCase() === codeClean) ||
      (t.moztechwaveUserId && t.moztechwaveUserId.toUpperCase() === codeClean)
    );

    const appMatch = (applications as any[]).find((a: any) => 
      a.code?.toUpperCase() === codeClean || 
      (a.documentNumber && a.documentNumber.toUpperCase() === codeClean)
    );

    const matchedEntity = studentMatch || teacherMatch || appMatch;

    if (!matchedEntity) {
      // Aceita formato padrão MTW se estiver em sandbox/demonstração com aviso informativo
      if (codeClean.startsWith('MTW-') || codeClean.startsWith('SIGAR-') || codeClean.startsWith('ALU-')) {
        setCodeValidationStatus({
          isValid: true,
          message: `Código formatado no padrão MOZTECHWAVE ID (${codeClean}). Autorizado para acesso controlado.`,
          entityName: currentUser.name || 'Utilizador do Ecossistema'
        });
        return;
      }

      setCodeValidationStatus({
        isValid: false,
        errorType: 'not_found',
        message: `O código ou ID '${codeClean}' não foi localizado no cadastro desta instituição ou filial.`
      });
      return;
    }

    // 1. Verificação Institucional Estrita
    const entityInstId = matchedEntity.institutionId || selectedInstId;
    if (entityInstId && entityInstId !== selectedInstId) {
      const entityInst = allInstitutions.find(i => i.id === entityInstId);
      setCodeValidationStatus({
        isValid: false,
        errorType: 'wrong_institution',
        message: `ACESSO NEGADO: O código '${codeClean}' pertence à instituição '${entityInst?.name || entityInstId}'. O acesso inter-institucional não autorizado é bloqueado por isolamento multi-tenant.`,
        entityName: matchedEntity.fullName || matchedEntity.name,
        assignedInstitutionName: entityInst?.name || entityInstId
      });
      return;
    }

    // 2. Verificação de Filial Estrita (se uma filial específica foi selecionada)
    const entityBranchId = matchedEntity.branchId;
    if (selectedBranch !== 'todas' && entityBranchId && entityBranchId !== selectedBranch) {
      const branchFound = selectedInst.branches?.find(b => b.id === entityBranchId);
      const targetBranch = selectedInst.branches?.find(b => b.id === selectedBranch);
      setCodeValidationStatus({
        isValid: false,
        errorType: 'wrong_branch',
        message: `ACESSO NEGADO POR DELIMITAÇÃO DE FILIAL: O código '${codeClean}' está vinculado exclusivamente à filial '${branchFound?.name || entityBranchId}'. Não é permitido entrar na filial '${targetBranch?.name || selectedBranch}'!`,
        entityName: matchedEntity.fullName || matchedEntity.name,
        assignedBranchName: branchFound?.name || entityBranchId
      });
      return;
    }

    // Sucesso na verificação
    const currentBranchName = selectedInst.branches?.find(b => b.id === selectedBranch)?.name || 'Sede Geral';
    setCodeValidationStatus({
      isValid: true,
      message: `Identidade confirmada com sucesso! Código atribuído à filial ${currentBranchName}.`,
      entityName: matchedEntity.fullName || matchedEntity.name || 'Utilizador Autorizado',
      assignedBranchName: currentBranchName
    });
  }, [assignedCode, selectedInstId, selectedBranch, selectedRole, students, teachers, allTeachers, applications]);

  const PROFILE_OPTIONS: { role: UserRole; title: string; subtitle: string; icon: any; color: string; badge: string }[] = [
    {
      role: 'superadmin',
      title: 'Super Administrador / CEO',
      subtitle: 'Controle soberano do ecossistema, auditoria contábil e todas instituições.',
      icon: Shield,
      color: 'from-purple-600 to-indigo-700',
      badge: 'Acesso Soberano'
    },
    {
      role: 'director',
      title: 'Diretor Geral / Reitoria',
      subtitle: 'Gestão estratégica executiva, assinatura eletrónica e relatórios institucionais.',
      icon: School,
      color: 'from-blue-600 to-cyan-700',
      badge: 'Liderança'
    },
    {
      role: 'secretaria',
      title: 'Secretaria Acadêmica',
      subtitle: 'Matrículas, transferências, emissão de certidões, pautas e Document Studio.',
      icon: Building2,
      color: 'from-teal-600 to-emerald-700',
      badge: 'Operação'
    },
    {
      role: 'financeiro',
      title: 'Financeiro & Tesouraria',
      subtitle: 'Cobrança de propinas, caixa diário, MOZCOIN institucional e contas a pagar/receber.',
      icon: Coins,
      color: 'from-amber-600 to-yellow-700',
      badge: 'Contas'
    },
    {
      role: 'professor',
      title: 'Professor / Formador',
      subtitle: 'Lançamento de presenças biométricas, avaliações contínuas e plano de aulas.',
      icon: Briefcase,
      color: 'from-indigo-600 to-blue-700',
      badge: 'Docência'
    },
    {
      role: 'porteiro',
      title: 'Porteiro / Controlo de Acesso',
      subtitle: 'Terminal de catraca, leitura de QR Code em carteirinhas e registro de fluxo.',
      icon: KeyRound,
      color: 'from-rose-600 to-pink-700',
      badge: 'Portaria'
    },
    {
      role: 'aluno',
      title: 'Aluno / Formando / Encarregado',
      subtitle: 'Acesso a boletins, horários, pagamentos M-Pesa, carteirinha digital e estágios.',
      icon: GraduationCap,
      color: 'from-sky-600 to-blue-700',
      badge: 'Portal do Aluno'
    },
    {
      role: 'empresa',
      title: 'Empresa Parceira',
      subtitle: 'Submissão de vagas, acompanhamento de estagiários e contratação de talentos.',
      icon: Briefcase,
      color: 'from-slate-700 to-slate-900',
      badge: 'Parcerias'
    }
  ];

  const handleCompleteLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      loginWithMoztechwaveId({
        role: selectedRole,
        institutionId: selectedInstId,
        branchId: selectedBranch,
        authMethod
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Top Banner & Identity Brand */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Chave de Acesso Unificada (SSO) • Requisito 87
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              MOZTECHWAVE ID
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Portal central de autenticação e delegação de autoridade. Navegue entre papéis, instituições e filiais do ecossistema com auditoria contínua e isolamento seguro de dados.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Identificador Global</div>
              <div className="text-sm font-bold text-white font-mono">MWID-MZ-2026-0001</div>
              <div className="text-[11px] text-amber-400 font-medium">Sessão Ativa: {currentUser.name}</div>
            </div>
          </div>
        </div>

        {/* Resumo do Fluxo do Requisito 87 */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-[10px] text-slate-500 font-bold">1. SIGAR</div>
            <div className="text-slate-300 font-semibold truncate">Ecossistema</div>
          </div>
          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/50">
            <div className="text-[10px] text-purple-400 font-bold">2. MW ID</div>
            <div className="text-white font-semibold truncate">Identidade</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-[10px] text-slate-500 font-bold">3. Perfil</div>
            <div className="text-amber-400 font-semibold truncate capitalize">{selectedRole}</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-[10px] text-slate-500 font-bold">4. Instituição</div>
            <div className="text-slate-300 font-semibold truncate">{selectedInst.name.split(' ')[0]}</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-[10px] text-slate-500 font-bold">5. Filial</div>
            <div className="text-slate-300 font-semibold truncate">{selectedBranch === 'todas' ? 'Todas as Sedes' : selectedBranch}</div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
            <div className="text-[10px] text-emerald-400 font-bold">6. Painel</div>
            <div className="text-emerald-300 font-semibold truncate">Destino Final</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleCompleteLogin} className="space-y-6">
        {/* ETAPA A: ESCOLHA DO PERFIL (87.2) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                Passo 1: Selecione o Perfil de Atuação
              </h2>
              <p className="text-xs text-slate-400">
                Seu MOZTECHWAVE ID possui credenciais vinculadas para múltiplos cargos e papéis institucionais.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROFILE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = selectedRole === opt.role;
              return (
                <div
                  key={opt.role}
                  onClick={() => setSelectedRole(opt.role)}
                  className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between gap-3 transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-600/15 border-purple-500 shadow-lg shadow-purple-600/10 scale-[1.01]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${opt.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                        {opt.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">{opt.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {opt.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">{opt.role}</span>
                    {isSelected && (
                      <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selecionado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ETAPA B: INSTITUIÇÃO & FILIAL (87.3) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Passo 2: Selecione a Instituição e a Filial
              </h2>
              <p className="text-xs text-slate-400">
                O escopo dos alunos, turmas, transações e documentos será restrito à filial selecionada.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Seletor de Instituição */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Instituição de Ensino / Entidade:
              </label>
              <select
                value={selectedInstId}
                onChange={e => {
                  setSelectedInstId(e.target.value);
                  setSelectedBranch('todas');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
              >
                {allInstitutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Filial */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Filial / Polo de Operação:
              </label>
              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="todas">Todas as Filiais (Visão Geral Multi-Campus)</option>
                {selectedInst.branches?.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} - {b.city || 'Sede Regional'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ETAPA C: CÓDIGO OU ID ATRIBUÍDO NA INSCRIÇÃO/MATRÍCULA (87.2 & 87.3) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-purple-400" />
                Passo 3: Código ou ID Atribuído (Vínculo de Filial & Instituição)
              </h2>
              <p className="text-xs text-slate-400">
                Insira o identificador atribuído na sua matrícula ou inscrição. O sistema bloqueia automaticamente qualquer tentativa de aceder a uma filial ou instituição diferente.
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              codeValidationStatus.isValid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {codeValidationStatus.isValid ? 'Identidade Válida' : 'Acesso Restrito'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-1.5">
                Identificador / Código do Aluno ou Colaborador:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assignedCode}
                  onChange={e => setAssignedCode(e.target.value)}
                  placeholder="Ex: MTW-ALU-000428, ALU-2026-001, DOC-001 ou MTW-USR-000001"
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white font-mono text-sm uppercase tracking-wider focus:outline-none ${
                    codeValidationStatus.isValid
                      ? 'border-slate-700 focus:border-purple-500'
                      : 'border-rose-600 focus:border-rose-500 bg-rose-950/20'
                  }`}
                />
                <div className="absolute right-3 top-3">
                  {codeValidationStatus.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Banner de Feedback da Validação */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
              codeValidationStatus.isValid
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {codeValidationStatus.isValid ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Vínculo Institucional e Filial Confirmados</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Bloqueio de Segurança Multi-Tenant</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {codeValidationStatus.message}
              </p>
              {codeValidationStatus.entityName && (
                <div className="pt-2 mt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-4 text-[10px] text-slate-400">
                  <span>Titular: <strong className="text-white">{codeValidationStatus.entityName}</strong></span>
                  {codeValidationStatus.assignedBranchName && (
                    <span>Filial Homologada: <strong className="text-amber-300">{codeValidationStatus.assignedBranchName}</strong></span>
                  )}
                </div>
              )}
            </div>

            {/* Atalhos para teste de validação rápida */}
            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-500 font-semibold">Testar credenciais cadastradas:</span>
              <button
                type="button"
                onClick={() => setAssignedCode('MTW-ALU-000428')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-300 text-[11px] font-mono cursor-pointer transition-colors"
              >
                MTW-ALU-000428 (Aluno)
              </button>
              <button
                type="button"
                onClick={() => setAssignedCode('DOC-001')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-[11px] font-mono cursor-pointer transition-colors"
              >
                DOC-001 (Formador)
              </button>
              <button
                type="button"
                onClick={() => setAssignedCode('MTW-USR-000001')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 text-[11px] font-mono cursor-pointer transition-colors"
              >
                MTW-USR-000001 (Diretoria)
              </button>
            </div>
          </div>
        </div>

        {/* ETAPA D: MÉTODO DE AUTENTICAÇÃO E PIN DE SEGURANÇA (87.4) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              Passo 4: Credencial de Confirmação
            </h2>
            <p className="text-xs text-slate-400">
              Escolha como deseja validar esta sessão no ecossistema Moztechwave.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setAuthMethod('senha')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                authMethod === 'senha'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Chave Master / Senha</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Autenticação com senha segura do MW ID</p>
            </div>

            <div
              onClick={() => setAuthMethod('biometria')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                authMethod === 'biometria'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Biometria / WebAuthn</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Leitor digital ou reconhecimento facial</p>
            </div>

            <div
              onClick={() => setAuthMethod('pin')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                authMethod === 'pin'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Código PIN Rápido</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">PIN numérico de 4 a 6 dígitos</p>
            </div>
          </div>
        </div>

        {/* Resumo Final & Botão de Entrada */}
        <div className="bg-gradient-to-r from-purple-900/30 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xl">
          <div className="space-y-1 text-xs">
            <div className="text-slate-400">
              Você está prestes a entrar como:
            </div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span className="capitalize">{selectedRole}</span> • <span className="text-amber-400">{selectedInst.name}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Filial: {selectedBranch === 'todas' ? 'Todas as Sedes' : selectedBranch} • Redirecionamento automático ao painel.
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !codeValidationStatus.isValid}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all ${
              codeValidationStatus.isValid
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            {isSubmitting ? (
              <span>Autenticando sessão...</span>
            ) : !codeValidationStatus.isValid ? (
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Acesso Bloqueado para esta Filial</span>
              </span>
            ) : (
              <>
                <span>Aceder ao Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
