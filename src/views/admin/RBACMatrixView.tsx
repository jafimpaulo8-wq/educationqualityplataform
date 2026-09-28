import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Database, 
  Sliders, 
  Key, 
  FileCode, 
  ExternalLink,
  Info,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AiRbacMatrixTab } from '../ai/components/AiRbacMatrixTab';
import { 
  ROLE_DEFINITIONS, 
  CanonicalRole, 
  Permission, 
  toCanonicalRole, 
  UserRole,
  hasPermission
} from '../../types/rbac';

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

interface PermSpec {
  id: Permission;
  label: string;
  category: string;
  desc: string;
  firestoreCollection: string;
  firestoreRule: string;
}

const PERMISSIONS_CATALOG: PermSpec[] = [
  // Alunos
  { id: 'alunos.view', label: 'alunos.view', category: 'Alunos', desc: 'Consultar fichas e dados cadastrais de alunos', firestoreCollection: 'students', firestoreRule: 'allow get, list: if isTenantUser(instId) || isSelf()' },
  { id: 'alunos.create', label: 'alunos.create', category: 'Alunos', desc: 'Realizar novas matrículas escolares', firestoreCollection: 'students', firestoreRule: 'allow create: if isSecretaria(instId)' },
  { id: 'alunos.edit', label: 'alunos.edit', category: 'Alunos', desc: 'Editar cadastro e informações pessoais', firestoreCollection: 'students', firestoreRule: 'allow update: if isSecretaria(instId)' },
  { id: 'alunos.terminate', label: 'alunos.terminate', category: 'Alunos', desc: 'Desligamento / trancamento de matrícula', firestoreCollection: 'students', firestoreRule: 'allow update: if isSecretaria(instId)' },
  { id: 'alunos.delete', label: 'alunos.delete', category: 'Alunos', desc: 'Exclusão irrevogável de registro', firestoreCollection: 'students', firestoreRule: 'allow delete: if isInstAdmin(instId)' },
  { id: 'alunos.export', label: 'alunos.export', category: 'Alunos', desc: 'Exportar relatórios em Excel/PDF', firestoreCollection: 'students', firestoreRule: 'Frontend & Firestore Query bounds' },

  // Notas
  { id: 'notas.view', label: 'notas.view', category: 'Avaliações', desc: 'Consultar pautas e médias', firestoreCollection: 'lessons', firestoreRule: 'allow get, list: if isTenantUser(instId)' },
  { id: 'notas.create', label: 'notas.create', category: 'Avaliações', desc: 'Lançar novas avaliações', firestoreCollection: 'lessons', firestoreRule: 'allow create: if isDocente(instId) || isSecretaria()' },
  { id: 'notas.edit', label: 'notas.edit', category: 'Avaliações', desc: 'Retificar notas atribuídas', firestoreCollection: 'lessons', firestoreRule: 'allow update: if isDocente(instId) || isSecretaria()' },
  { id: 'notas.approve', label: 'notas.approve', category: 'Avaliações', desc: 'Homologar pautas oficiais do termo', firestoreCollection: 'lessons', firestoreRule: 'allow update: if isInstAdmin(instId)' },

  // Pagamentos & Caixa
  { id: 'pagamentos.view', label: 'pagamentos.view', category: 'Financeiro', desc: 'Visualizar propinas e recebíveis', firestoreCollection: 'cashSessions', firestoreRule: 'allow get, list: if isFinanceiro(instId)' },
  { id: 'pagamentos.create', label: 'pagamentos.create', category: 'Financeiro', desc: 'Lançar pagamentos e gerar recibos', firestoreCollection: 'cashSessions', firestoreRule: 'allow create, update: if isFinanceiro(instId)' },
  { id: 'pagamentos.approve', label: 'pagamentos.approve', category: 'Financeiro', desc: 'Homologar depósitos bancários/POS', firestoreCollection: 'cashSessions', firestoreRule: 'allow update: if isFinanceiro(instId)' },
  { id: 'pagamentos.reject', label: 'pagamentos.reject', category: 'Financeiro', desc: 'Estornar ou rejeitar transação', firestoreCollection: 'cashSessions', firestoreRule: 'allow update: if isFinanceiro(instId)' },
  { id: 'pagamentos.export', label: 'pagamentos.export', category: 'Financeiro', desc: 'Exportar livro caixa e balancetes', firestoreCollection: 'cashSessions', firestoreRule: 'allow list: if isFinanceiro(instId)' },
  { id: 'caixa.view', label: 'caixa.view', category: 'Financeiro', desc: 'Aceder terminal de ponto de venda escolar', firestoreCollection: 'cashSessions', firestoreRule: 'allow get, list: if isFinanceiro(instId)' },
  { id: 'caixa.open', label: 'caixa.open', category: 'Financeiro', desc: 'Abertura de turno e fundo de troco', firestoreCollection: 'cashSessions', firestoreRule: 'allow create: if isFinanceiro(instId)' },
  { id: 'caixa.close', label: 'caixa.close', category: 'Financeiro', desc: 'Fechamento cego e conciliação', firestoreCollection: 'cashSessions', firestoreRule: 'allow update: if isFinanceiro(instId)' },
  { id: 'caixa.transact', label: 'caixa.transact', category: 'Financeiro', desc: 'Movimentar valores no caixa', firestoreCollection: 'cashSessions', firestoreRule: 'allow update: if isFinanceiro(instId)' },
  { id: 'caixa.bleed', label: 'caixa.bleed', category: 'Financeiro', desc: 'Sangria de numerário para cofre', firestoreCollection: 'cashSessions', firestoreRule: 'allow update: if isFinanceiro(instId)' },

  // Certificados
  { id: 'certificados.view', label: 'certificados.view', category: 'Certificação SIVERC', desc: 'Verificação pública por QR Code / Hash', firestoreCollection: 'certificates', firestoreRule: 'allow get, list: if true (Público SIVERC)' },
  { id: 'certificados.create', label: 'certificados.create', category: 'Certificação SIVERC', desc: 'Gerar documento formativo', firestoreCollection: 'certificates', firestoreRule: 'allow create: if isSecretaria(instId)' },
  { id: 'certificados.approve', label: 'certificados.approve', category: 'Certificação SIVERC', desc: 'Homologação e assinatura digital', firestoreCollection: 'certificates', firestoreRule: 'allow update: if isInstAdmin(instId)' },
  { id: 'certificados.revoke', label: 'certificados.revoke', category: 'Certificação SIVERC', desc: 'Revogação pública por nulidade', firestoreCollection: 'certificates', firestoreRule: 'allow update: if isInstAdmin(instId)' },
  { id: 'certificados.export', label: 'certificados.export', category: 'Certificação SIVERC', desc: 'Exportar em alta definição (300 DPI)', firestoreCollection: 'certificates', firestoreRule: 'allow get: if true' },

  // Portaria
  { id: 'portaria.view', label: 'portaria.view', category: 'Portaria & Acesso', desc: 'Painel da guarita e leitor QR', firestoreCollection: 'accessLogs', firestoreRule: 'allow get, list: if isPorteiro(instId)' },
  { id: 'portaria.log_entry', label: 'portaria.log_entry', category: 'Portaria & Acesso', desc: 'Registar entrada de formando', firestoreCollection: 'accessLogs', firestoreRule: 'allow create: if isPorteiro(instId)' },
  { id: 'portaria.log_exit', label: 'portaria.log_exit', category: 'Portaria & Acesso', desc: 'Registar saída de formando', firestoreCollection: 'accessLogs', firestoreRule: 'allow create: if isPorteiro(instId)' },
  { id: 'portaria.notify', label: 'portaria.notify', category: 'Portaria & Acesso', desc: 'Disparo de notificação aos pais', firestoreCollection: 'accessLogs', firestoreRule: 'allow create: if isPorteiro(instId)' },

  // Instituições e Usuários
  { id: 'instituicoes.view', label: 'instituicoes.view', category: 'Governança', desc: 'Ver dados e parâmetros do centro', firestoreCollection: 'institutions', firestoreRule: 'allow get, list: if true' },
  { id: 'instituicoes.create', label: 'instituicoes.create', category: 'Governança', desc: 'Criar nova instituição SaaS', firestoreCollection: 'institutions', firestoreRule: 'allow create: if isSuperAdmin()' },
  { id: 'instituicoes.edit', label: 'instituicoes.edit', category: 'Governança', desc: 'Editar parâmetros institucionais', firestoreCollection: 'institutions', firestoreRule: 'allow update: if isInstAdmin(instId)' },
  { id: 'instituicoes.delete', label: 'instituicoes.delete', category: 'Governança', desc: 'Excluir instituição do ecossistema', firestoreCollection: 'institutions', firestoreRule: 'allow delete: if isSuperAdmin()' },
  { id: 'instituicoes.switch', label: 'instituicoes.switch', category: 'Governança', desc: 'Trocar contexto entre instituições', firestoreCollection: 'institutions', firestoreRule: 'Frontend & Firestore security filter' },
  { id: 'usuarios.view', label: 'usuarios.view', category: 'Governança', desc: 'Listar operadores com acesso', firestoreCollection: 'users', firestoreRule: 'allow list: if isSuperAdmin() || isInstAdmin()' },
  { id: 'usuarios.create', label: 'usuarios.create', category: 'Governança', desc: 'Convidar novo colaborador', firestoreCollection: 'users', firestoreRule: 'allow create: if isInstAdmin(instId)' },
  { id: 'usuarios.edit_role', label: 'usuarios.edit_role', category: 'Governança', desc: 'Atribuir ou alterar perfil RBAC', firestoreCollection: 'users', firestoreRule: 'allow update: if isSuperAdmin() || isInstAdmin()' },
  { id: 'usuarios.delete', label: 'usuarios.delete', category: 'Governança', desc: 'Revogar conta de operador', firestoreCollection: 'users', firestoreRule: 'allow delete: if isSuperAdmin()' }
];

export const RBACMatrixView: React.FC = () => {
  const { activeRole, setActiveRole } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'matrix' | 'cards' | 'rules' | 'ai_matrix'>('matrix');

  const categories = ['all', ...Array.from(new Set(PERMISSIONS_CATALOG.map(p => p.category)))];

  const filteredPerms = PERMISSIONS_CATALOG.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.firestoreCollection.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const canonicalActive = toCanonicalRole(activeRole);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Matriz Profissional de Perfis & Permissões (RBAC)
                </h1>
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  SEGURANÇA ATIVA NO FIRESTORE
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
                Sistema granular com 11 perfis canônicos. Cada ação é validada no frontend e garantida rigorosamente nas Firebase Security Rules, prevenindo escalonamento de privilégios e acessos cruzados.
              </p>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                Perfil Simulado Atual:
              </span>
              <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${ROLE_DEFINITIONS[canonicalActive]?.badgeBg} ${ROLE_DEFINITIONS[canonicalActive]?.badgeColor}`}>
                {canonicalActive}
              </span>
            </div>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:outline-hidden focus:border-sky-500 cursor-pointer"
            >
              {ALL_ROLES.map(r => (
                <option key={r} value={r}>
                  {ROLE_DEFINITIONS[r].title} ({r})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>Matriz Granular (11 Perfis)</span>
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'cards'
                ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>Cartões de Perfis & Atribuições</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Auditoria Firebase Security Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'ai_matrix'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md font-black'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>47. Permissões Moztechwave AI</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por ação, coleção ou regra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Todas Categorias' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Matriz Tabela Completa */}
      {activeTab === 'matrix' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 sticky top-0 z-10">
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] min-w-[240px]">
                    Permissão Granular & Descrição
                  </th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] min-w-[120px]">
                    Coleção Firestore
                  </th>
                  {ALL_ROLES.map((roleKey) => {
                    const isCurrent = canonicalActive === roleKey;
                    return (
                      <th
                        key={roleKey}
                        className={`p-3 font-bold uppercase tracking-wider text-[10px] text-center min-w-[85px] transition-colors ${
                          isCurrent ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400'
                        }`}
                        title={ROLE_DEFINITIONS[roleKey].title}
                      >
                        <div className="flex flex-col items-center">
                          <span>{roleKey.split('_')[0]}</span>
                          <span className="text-[9px] opacity-75 font-mono">
                            {roleKey.split('_')[1] || ''}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] text-emerald-400 font-black mt-0.5">● ATIVO</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPerms.map((perm) => (
                  <tr key={perm.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-sky-400" />
                        {perm.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {perm.desc}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                        /{perm.firestoreCollection}
                      </span>
                    </td>
                    {ALL_ROLES.map((roleKey) => {
                      const granted = hasPermission(roleKey, perm.id);
                      const isCurrent = canonicalActive === roleKey;

                      return (
                        <td
                          key={roleKey}
                          className={`p-3 text-center transition-colors ${
                            isCurrent ? 'bg-sky-500/5' : ''
                          }`}
                        >
                          {granted ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-slate-600 border border-slate-800">
                              <Lock className="w-3 h-3" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Cartões de Perfis */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_ROLES.map((roleKey) => {
            const def = ROLE_DEFINITIONS[roleKey];
            const isCurrent = canonicalActive === roleKey;

            return (
              <div
                key={roleKey}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-slate-900 border-sky-500/60 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-md border ${def.badgeBg} ${def.badgeColor}`}>
                      {def.role}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 capitalize">
                      Escopo: <strong className="text-white">{def.scope}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {def.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {def.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                      <span>Permissões Concedidas:</span>
                      <span className="font-mono text-white font-bold">{def.permissions.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pr-1">
                      {def.permissions.map(p => (
                        <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => setActiveRole(def.role as UserRole)}
                    disabled={isCurrent}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md font-extrabold'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{isCurrent ? '✓ Perfil Ativo' : 'Simular Este Perfil'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Auditoria Firebase Security Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                Regras de Segurança Firestore Ativas no Servidor (Deploy Concluído)
              </h4>
              <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                As regras de segurança estão compiladas e implantadas no projeto Firebase Firestore. Toda tentativa direta de bypass pela console do navegador ou SDK é terminada imediatamente com <code>PERMISSION_DENIED</code> se o utilizador não possuir o perfil e instituição requeridos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPerms.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400">
                    {p.id}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                    /{p.firestoreCollection}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{p.desc}</p>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  <code>{p.firestoreRule}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba da Matriz da IA Moztechwave */}
      {activeTab === 'ai_matrix' && (
        <AiRbacMatrixTab />
      )}
    </div>
  );
};
