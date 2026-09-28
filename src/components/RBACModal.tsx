import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Sparkles, 
  Key,
  Layers,
  Database,
  Search
} from 'lucide-react';
import { 
  ROLE_DEFINITIONS, 
  CanonicalRole, 
  Permission, 
  hasPermission, 
  toCanonicalRole,
  UserRole 
} from '../types/rbac';
import { useApp } from '../context/AppContext';

interface RBACModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERMISSION_GROUPS: { group: string; permissions: { id: Permission; label: string; desc: string }[] }[] = [
  {
    group: 'Gestão de Alunos (SIGAR)',
    permissions: [
      { id: 'alunos.view', label: 'alunos.view', desc: 'Visualizar lista e perfil de alunos' },
      { id: 'alunos.create', label: 'alunos.create', desc: 'Cadastrar nova matrícula' },
      { id: 'alunos.edit', label: 'alunos.edit', desc: 'Atualizar dados cadastrais de alunos' },
      { id: 'alunos.terminate', label: 'alunos.terminate', desc: 'Dar baixa / desligamento de aluno' },
      { id: 'alunos.delete', label: 'alunos.delete', desc: 'Exclusão definitiva de registro de aluno' },
      { id: 'alunos.export', label: 'alunos.export', desc: 'Exportar listas e relatórios em PDF/Excel' }
    ]
  },
  {
    group: 'Notas, Pautas & Avaliações',
    permissions: [
      { id: 'notas.view', label: 'notas.view', desc: 'Visualizar pautas e boletins' },
      { id: 'notas.create', label: 'notas.create', desc: 'Lançar novas notas parciais' },
      { id: 'notas.edit', label: 'notas.edit', desc: 'Retificar notas e médias' },
      { id: 'notas.approve', label: 'notas.approve', desc: 'Homologar pautas oficiais finais' }
    ]
  },
  {
    group: 'Tesouraria & Caixa Escolar',
    permissions: [
      { id: 'pagamentos.view', label: 'pagamentos.view', desc: 'Consultar histórico de propinas e pagamentos' },
      { id: 'pagamentos.create', label: 'pagamentos.create', desc: 'Registar pagamento e emitir recibo' },
      { id: 'pagamentos.approve', label: 'pagamentos.approve', desc: 'Validar comprovativos e transferências' },
      { id: 'pagamentos.reject', label: 'pagamentos.reject', desc: 'Rejeitar transações inconsistentes' },
      { id: 'caixa.view', label: 'caixa.view', desc: 'Visualizar sessão diária de caixa' },
      { id: 'caixa.open', label: 'caixa.open', desc: 'Abertura de caixa com saldo inicial' },
      { id: 'caixa.transact', label: 'caixa.transact', desc: 'Lançar entradas/saídas no caixa' },
      { id: 'caixa.bleed', label: 'caixa.bleed', desc: 'Efetuar sangrias para cofre bancário' },
      { id: 'caixa.close', label: 'caixa.close', desc: 'Fechamento diário e prestação de contas' }
    ]
  },
  {
    group: 'SIVERC Document Studio & Certificados',
    permissions: [
      { id: 'certificados.view', label: 'certificados.view', desc: 'Consultar e validar autenticidade pública' },
      { id: 'certificados.create', label: 'certificados.create', desc: 'Emitir novo certificado ou diploma' },
      { id: 'certificados.approve', label: 'certificados.approve', desc: 'Assinatura digital e outorga do diretor' },
      { id: 'certificados.revoke', label: 'certificados.revoke', desc: 'Revogar certificado por irregularidade' },
      { id: 'certificados.export', label: 'certificados.export', desc: 'Exportar lote de certificados em alta resolução' }
    ]
  },
  {
    group: 'Portaria & Controlo de Acesso',
    permissions: [
      { id: 'portaria.view', label: 'portaria.view', desc: 'Acesso ao painel da guarita' },
      { id: 'portaria.log_entry', label: 'portaria.log_entry', desc: 'Registar entrada de aluno via QR' },
      { id: 'portaria.log_exit', label: 'portaria.log_exit', desc: 'Registar saída de aluno da instituição' },
      { id: 'portaria.notify', label: 'portaria.notify', desc: 'Disparo de WhatsApp para encarregado' }
    ]
  },
  {
    group: 'Contratos, Instituições & Utilizadores',
    permissions: [
      { id: 'contratos.view', label: 'contratos.view', desc: 'Visualizar termos e minutas contratuais' },
      { id: 'contratos.create', label: 'contratos.create', desc: 'Gerar contrato formativo personalizado' },
      { id: 'contratos.sign_director', label: 'contratos.sign_director', desc: 'Assinatura institucional da diretoria' },
      { id: 'instituicoes.view', label: 'instituicoes.view', desc: 'Aceder dados institucionais' },
      { id: 'instituicoes.create', label: 'instituicoes.create', desc: 'Cadastrar nova instituição no SaaS Core' },
      { id: 'instituicoes.edit', label: 'instituicoes.edit', desc: 'Editar prefixos, bancos e parâmetros' },
      { id: 'instituicoes.switch', label: 'instituicoes.switch', desc: 'Alternar entre instituições' },
      { id: 'usuarios.view', label: 'usuarios.view', desc: 'Listar operadores do sistema' },
      { id: 'usuarios.edit_role', label: 'usuarios.edit_role', desc: 'Alterar perfil/permissão de operadores' }
    ]
  }
];

const ALL_ROLES: CanonicalRole[] = [
  'SUPER_ADMIN',
  'ADMIN_INSTITUICAO',
  'DIRETOR',
  'SECRETARIA',
  'FINANCEIRO',
  'PROFESSOR',
  'FORMADOR',
  'PORTEIRO',
  'ALUNO',
  'RESPONSAVEL',
  'EMPRESA'
];

export const RBACModal: React.FC<RBACModalProps> = ({ isOpen, onClose }) => {
  const { activeRole, setActiveRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<CanonicalRole>(toCanonicalRole(activeRole));
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const currentRoleDef = ROLE_DEFINITIONS[selectedRole];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Matriz Profissional de Perfis & Permissões (RBAC)
                </h2>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  FIRESTORE SECURITY ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                11 perfis canônicos com permissões granulares e aplicação estrita em Firebase Security Rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Selector Tabs */}
        <div className="border-b border-slate-800 bg-slate-900/40 p-3 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
          {ALL_ROLES.map((roleKey) => {
            const def = ROLE_DEFINITIONS[roleKey];
            const isSelected = selectedRole === roleKey;
            const isSimulatedActive = toCanonicalRole(activeRole) === roleKey;

            return (
              <button
                key={roleKey}
                onClick={() => setSelectedRole(roleKey)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? `${def.badgeBg} ${def.badgeColor} shadow-md`
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{def.title.split(' ')[0]}</span>
                {isSimulatedActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Perfil em uso no momento" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Role Summary & Simulator Action */}
        <div className="p-4 bg-slate-900/20 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-md font-mono font-black uppercase border ${currentRoleDef.badgeBg} ${currentRoleDef.badgeColor}`}>
                {currentRoleDef.role}
              </span>
              <span className="text-sm font-bold text-white">
                {currentRoleDef.title}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                • Escopo: <strong className="text-sky-300 capitalize">{currentRoleDef.scope}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentRoleDef.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveRole(currentRoleDef.role as UserRole);
              }}
              disabled={toCanonicalRole(activeRole) === currentRoleDef.role}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                toCanonicalRole(activeRole) === currentRoleDef.role
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md font-extrabold'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>
                {toCanonicalRole(activeRole) === currentRoleDef.role
                  ? '✓ Perfil Ativo na Aplicação'
                  : 'Simular Este Perfil Agora'}
              </span>
            </button>
          </div>
        </div>

        {/* Permissions Inspector with Search */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar permissão granular..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {currentRoleDef.permissions.length} permissões concedidas a este perfil
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {PERMISSION_GROUPS.map((grp) => {
            const filteredPerms = grp.permissions.filter(p => 
              p.id.toLowerCase().includes(searchFilter.toLowerCase()) || 
              p.desc.toLowerCase().includes(searchFilter.toLowerCase())
            );

            if (filteredPerms.length === 0) return null;

            return (
              <div key={grp.group} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  {grp.group}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredPerms.map((perm) => {
                    const isGranted = currentRoleDef.permissions.includes(perm.id);

                    return (
                      <div
                        key={perm.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isGranted
                            ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                            : 'bg-slate-900/30 border-slate-800/60 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-white block">
                            {perm.label}
                          </span>
                          {isGranted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {perm.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Security Rules Explanation Footer */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Garantia de Segurança em Camada Tripla (Defense in Depth)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. <strong>Frontend Guard:</strong> Elementos visuais não autorizados são ocultados da interface para limpeza e ergonomia.
              <br />
              2. <strong>Firestore Security Rules:</strong> O Firebase Firestore valida a nível de documento no servidor se o operador possui o perfil e a chave <code className="text-amber-300 font-mono">institutionId</code> correspondente antes de qualquer leitura ou gravação.
              <br />
              3. <strong>Anti-Privilege Escalation:</strong> Utilizadores não podem modificar o próprio perfil ou escalar níveis de acesso.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="text-[11px] text-slate-400">
            Moztechwave Education Platform • SIVERC Security Subsystem
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-all"
          >
            Fechar Matriz
          </button>
        </div>
      </div>
    </div>
  );
};
