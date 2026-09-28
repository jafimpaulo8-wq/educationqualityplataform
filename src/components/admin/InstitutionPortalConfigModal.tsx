import React, { useState } from 'react';
import { 
  Building2, 
  Shield, 
  Sliders, 
  GraduationCap, 
  UserCheck, 
  DoorOpen, 
  DollarSign, 
  BookOpen, 
  Award, 
  Briefcase, 
  Megaphone, 
  FileText, 
  BarChart3, 
  Lock, 
  Save, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Institution, InstitutionFeatureModules, TeacherPortalPermissions, StudentPortalPermissions } from '../../types';

interface InstitutionPortalConfigModalProps {
  institution: Institution;
  isOpen: boolean;
  onClose: () => void;
}

export const InstitutionPortalConfigModal: React.FC<InstitutionPortalConfigModalProps> = ({
  institution,
  isOpen,
  onClose
}) => {
  const { updateInstitutionModules } = useApp();

  const [activeTab, setActiveTab] = useState<'modulos' | 'professor' | 'aluno'>('modulos');

  // Local state for institution tools/modules
  const [modules, setModules] = useState<InstitutionFeatureModules>({
    secretaria: institution.enabledModules?.secretaria ?? true,
    portal_aluno: institution.enabledModules?.portal_aluno ?? true,
    portal_professor: institution.enabledModules?.portal_professor ?? true,
    portaria: institution.enabledModules?.portaria ?? true,
    financeiro: institution.enabledModules?.financeiro ?? true,
    pedagogico: institution.enabledModules?.pedagogico ?? true,
    certificados: institution.enabledModules?.certificados ?? true,
    estagios: institution.enabledModules?.estagios ?? true,
    comunicados: institution.enabledModules?.comunicados ?? true,
    relatorios_academicos: institution.enabledModules?.relatorios_academicos ?? true,
    relatorios_administrativos: institution.enabledModules?.relatorios_administrativos ?? true,
    auditoria: institution.enabledModules?.auditoria ?? true
  });

  // Local state for teacher permissions
  const [teacherPerms, setTeacherPerms] = useState<TeacherPortalPermissions>({
    verNotas: institution.teacherPermissions?.verNotas ?? true,
    lancarNotas: institution.teacherPermissions?.lancarNotas ?? true,
    fazerChamada: institution.teacherPermissions?.fazerChamada ?? true,
    verPautas: institution.teacherPermissions?.verPautas ?? true,
    gerarRelatorios: institution.teacherPermissions?.gerarRelatorios ?? false,
    verFinanceiro: institution.teacherPermissions?.verFinanceiro ?? false
  });

  // Local state for student permissions
  const [studentPerms, setStudentPerms] = useState<StudentPortalPermissions>({
    verPerfil: institution.studentPermissions?.verPerfil ?? true,
    verNotas: institution.studentPermissions?.verNotas ?? true,
    verHorario: institution.studentPermissions?.verHorario ?? true,
    verFinanceiro: institution.studentPermissions?.verFinanceiro ?? true,
    solicitarDocumentos: institution.studentPermissions?.solicitarDocumentos ?? true,
    verAulasOnline: institution.studentPermissions?.verAulasOnline ?? true,
    verEstagio: institution.studentPermissions?.verEstagio ?? true,
    carteirinhaDigital: institution.studentPermissions?.carteirinhaDigital ?? true
  });

  if (!isOpen) return null;

  const handleSave = () => {
    updateInstitutionModules(institution.id, modules, teacherPerms, studentPerms);
    onClose();
  };

  const handleToggleModule = (key: keyof InstitutionFeatureModules) => {
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleTeacher = (key: keyof TeacherPortalPermissions) => {
    setTeacherPerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleStudent = (key: keyof StudentPortalPermissions) => {
    setStudentPerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Personalização de Painéis & Acessos
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {institution.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono">Código: {institution.code}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('modulos')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'modulos' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Módulos da Instituição
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('professor')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'professor' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Portal do Professor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aluno')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'aluno' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Portal do Aluno
          </button>
        </div>

        {/* Tab 1: Institution Enabled Tools/Modules */}
        {activeTab === 'modulos' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Ferramentas Habilitadas para esta Instituição</h3>
              <p className="text-xs text-slate-400">
                Ative apenas os módulos operacionais necessários contratados por esta instituição de ensino.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'secretaria', label: 'Secretaria Académica', desc: 'Gestão de matrículas, turmas e formandos', icon: GraduationCap },
                { key: 'portal_aluno', label: 'Portal do Aluno', desc: 'Acesso web e consultas do estudante', icon: UserCheck },
                { key: 'portal_professor', label: 'Portal do Professor', desc: 'Lançamento de notas e presenças', icon: BookOpen },
                { key: 'portaria', label: 'Portaria & Acessos', desc: 'Registo de portaria e controlo de fluxo', icon: DoorOpen },
                { key: 'financeiro', label: 'Módulo Financeiro', desc: 'Caixa escolar, propinas e contas a pagar', icon: DollarSign },
                { key: 'pedagogico', label: 'Gestão Pedagógica', desc: 'Cursos, planos modulares e fórmulas', icon: Sparkles },
                { key: 'certificados', label: 'Certificados & Diplomas', desc: 'Emissão e homologação com selo SIVEC', icon: Award },
                { key: 'estagios', label: 'Estágios Curriculares', desc: 'Parcerias empresariais e contratos', icon: Briefcase },
                { key: 'comunicados', label: 'Comunicados Oficiais', desc: 'Mural de avisos institucionais', icon: Megaphone },
                { key: 'relatorios_academicos', label: 'Relatórios Académicos', desc: 'Pautas, boletins e aproveitamento', icon: FileText },
                { key: 'relatorios_administrativos', label: 'Relatórios Administrativos', desc: 'Exportação gerencial PDF/CSV/Excel', icon: BarChart3 },
                { key: 'auditoria', label: 'Auditoria & Governança', desc: 'Trilha de auditoria e ações críticas', icon: Shield }
              ].map(item => {
                const isEnabled = modules[item.key as keyof InstitutionFeatureModules];
                const Icon = item.icon;
                return (
                  <div 
                    key={item.key}
                    onClick={() => handleToggleModule(item.key as keyof InstitutionFeatureModules)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                      isEnabled 
                        ? 'bg-amber-500/10 border-amber-500/30 text-white' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl mt-0.5 ${isEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{item.desc}</div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isEnabled ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Teacher Portal Permissions */}
        {activeTab === 'professor' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Permissões Específicas do Portal do Professor</h3>
              <p className="text-xs text-slate-400">
                Defina o que os professores desta instituição poderão visualizar e operar no seu painel exclusivo.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { key: 'verNotas', label: 'Ver Notas dos Alunos', desc: 'Visualização das avaliações e médias de suas turmas' },
                { key: 'lancarNotas', label: 'Lançar Notas & Avaliações', desc: 'Permissão para submeter notas contínuas e exames' },
                { key: 'fazerChamada', label: 'Fazer Chamada & Frequências', desc: 'Registo diário de presenças e faltas justificadas' },
                { key: 'verPautas', label: 'Ver Pautas da Coordenação', desc: 'Acesso a pautas preliminares e homologadas' },
                { key: 'gerarRelatorios', label: 'Gerar Relatórios de Turma', desc: 'Exportação de aproveitamento da turma em PDF' },
                { key: 'verFinanceiro', label: 'Ver Situação de Propinas', desc: 'Sinalização de formandos em atraso na pauta' }
              ].map(item => {
                const isChecked = teacherPerms[item.key as keyof TeacherPortalPermissions];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleTeacher(item.key as keyof TeacherPortalPermissions)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked 
                        ? 'bg-sky-500/10 border-sky-500/30' 
                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isChecked ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Student Portal Permissions */}
        {activeTab === 'aluno' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Permissões Específicas do Portal do Aluno</h3>
              <p className="text-xs text-slate-400">
                Defina os recursos e dados acessíveis ao estudante ao entrar com seu código único de formando.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { key: 'verPerfil', label: 'Ver Perfil e Dados Cadastrais', desc: 'Consulta de dados pessoais, curso e regime de inscrição' },
                { key: 'verNotas', label: 'Ver Boletim & Notas', desc: 'Consulta de notas contínuas, faltas e situação modular' },
                { key: 'verHorario', label: 'Ver Horário Escolar', desc: 'Agenda semanal de aulas, salas e docentes' },
                { key: 'verFinanceiro', label: 'Ver Extrato Financeiro & Propinas', desc: 'Faturas, pagamentos efetuados e recibos emitidos' },
                { key: 'solicitarDocumentos', label: 'Solicitar Declarações & Documentos', desc: 'Pedido online de declarações de frequência e notas' },
                { key: 'verAulasOnline', label: 'Aceder a Aulas & Materiais', desc: 'Links de videoconferência e apostilas em PDF' },
                { key: 'verEstagio', label: 'Acompanhar Estágio Profissional', desc: 'Visualização da empresa e avaliação de estágio' },
                { key: 'carteirinhaDigital', label: 'Carteirinha Digital com Código Único', desc: 'Cartão de formando com código de barras e QR code' }
              ].map(item => {
                const isChecked = studentPerms[item.key as keyof StudentPortalPermissions];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleStudent(item.key as keyof StudentPortalPermissions)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="text-xs text-slate-500">
            Alterações gravadas no RBAC e registadas na trilha de auditoria.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Permissões do Painel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
