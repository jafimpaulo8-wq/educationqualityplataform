import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  Save, 
  Check, 
  AlertTriangle, 
  Sliders, 
  Info,
  Sparkles,
  Users,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  CanonicalRole, 
  ROLE_DEFINITIONS, 
  toCanonicalRole 
} from '../../../types/rbac';
import { 
  AI_PERMISSIONS_CATALOG, 
  AiPermissionKey, 
  AiRolePermissionsMatrix, 
  getAiPermissionsMatrix, 
  saveAiPermissionsMatrix, 
  resetAiPermissionsMatrix 
} from '../../../types/aiPermissions';
import { useApp } from '../../../context/AppContext';

export const AiRbacMatrixTab: React.FC = () => {
  const { activeRole, setActiveRole } = useApp();
  const [matrix, setMatrix] = useState<AiRolePermissionsMatrix>(getAiPermissionsMatrix());
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    setMatrix(getAiPermissionsMatrix());
  }, []);

  const rolesList = Object.keys(ROLE_DEFINITIONS) as CanonicalRole[];

  const handleToggle = (role: CanonicalRole, permKey: AiPermissionKey) => {
    // SUPER_ADMIN is immutable core security, but let other roles be editable
    setMatrix(prev => {
      const currentVal = !!prev[role]?.[permKey];
      const updatedRolePerms = {
        ...prev[role],
        [permKey]: !currentVal
      };
      const updated = {
        ...prev,
        [role]: updatedRolePerms
      };
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = () => {
    saveAiPermissionsMatrix(matrix);
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar a matriz de permissões da IA para os padrões originais de segurança?')) {
      const def = resetAiPermissionsMatrix();
      setMatrix(def);
      setHasChanges(false);
    }
  };

  const filteredPerms = AI_PERMISSIONS_CATALOG.filter(p => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  const canonicalActive = toCanonicalRole(activeRole);

  return (
    <div className="space-y-6">
      {/* Top Banner & Governance Description */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 shrink-0">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">
                Matriz Editável de Acessos & Comandos da Moztechwave AI
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                RBAC Dinâmico
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Defina com precisão cirúrgica quais perfis têm autorização para interagir com a IA: consultar inadimplentes, emitir documentos, cadastrar alunos via foto/PDF ou lançar notas.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrões
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges && !saveSuccess}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : hasChanges
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Matriz Salva!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {hasChanges ? 'Salvar Alterações' : 'Sem Alterações'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Role Switcher & Live Simulation Sandbox */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Simulação em Tempo Real no Assistente:
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-2">
              Perfil Selecionado: <strong className="text-sky-300">{ROLE_DEFINITIONS[canonicalActive]?.title || canonicalActive}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Trocar Perfil:</span>
          <select
            value={activeRole}
            onChange={e => setActiveRole(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-sky-500 cursor-pointer"
          >
            {rolesList.map(r => (
              <option key={r} value={r}>
                {ROLE_DEFINITIONS[r]?.title || r} ({r})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'Consultas & Inteligência', 'Ações Críticas & Cadastro', 'Emissão de Documentos'].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat === 'all' ? 'Todas as Permissões da IA' : cat}
          </button>
        ))}
      </div>

      {/* The Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4 w-72 sticky left-0 bg-slate-50 z-10">
                  Permissão da Moztechwave AI
                </th>
                {rolesList.map(role => {
                  const isCurrent = role === canonicalActive;
                  return (
                    <th 
                      key={role} 
                      className={`p-3 text-center border-l border-slate-200/60 font-mono text-[10px] ${
                        isCurrent ? 'bg-sky-50 text-sky-950 font-black' : ''
                      }`}
                    >
                      <div className="truncate max-w-[90px] mx-auto" title={ROLE_DEFINITIONS[role]?.title}>
                        {role}
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] text-sky-600 font-bold block mt-0.5">
                          (ATIVO)
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredPerms.map(perm => (
                <tr key={perm.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 sticky left-0 bg-white shadow-xs z-10 border-r border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{perm.label}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        perm.riskLevel === 'Crítico' 
                          ? 'bg-rose-100 text-rose-800' 
                          : perm.riskLevel === 'Alto'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {perm.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      {perm.description}
                    </p>
                    <span className="font-mono text-[10px] text-indigo-600 block mt-1">
                      {perm.key}
                    </span>
                  </td>

                  {rolesList.map(role => {
                    const isAllowed = !!matrix[role]?.[perm.key];
                    const isCurrent = role === canonicalActive;
                    const isSuper = role === 'SUPER_ADMIN';

                    return (
                      <td 
                        key={role} 
                        className={`p-3 text-center border-l border-slate-200/60 ${
                          isCurrent ? 'bg-sky-50/50' : ''
                        }`}
                      >
                        <button
                          type="button"
                          disabled={isSuper}
                          onClick={() => handleToggle(role, perm.key)}
                          title={`${role}: ${isAllowed ? 'Permitido' : 'Bloqueado'} (Clique para alternar)`}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            isSuper 
                              ? 'cursor-not-allowed opacity-80' 
                              : 'cursor-pointer hover:scale-110 active:scale-95'
                          } ${
                            isAllowed
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-rose-50 text-rose-400 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          {isAllowed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
