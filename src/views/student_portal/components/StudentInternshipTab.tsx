import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  Briefcase, 
  Building2, 
  UserCheck, 
  Clock, 
  Calendar, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Send, 
  Award,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface StudentInternshipTabProps {
  currentStudent: Student;
  onRequestInternshipDoc: () => void;
}

export const StudentInternshipTab: React.FC<StudentInternshipTabProps> = ({
  currentStudent,
  onRequestInternshipDoc
}) => {
  const [reportText, setReportText] = useState('');
  const [reportHours, setReportHours] = useState('20');
  const [reportSuccess, setReportSuccess] = useState(false);

  const internshipData = {
    companyName: 'Vodacom Moçambique, S.A.',
    department: 'Direção de Engenharia de Software & Cloud',
    companySupervisor: 'Eng. Nelson Tembe (Líder Técnico de TI)',
    academicTutor: 'Eng. Arone Malendza (Moztechwave)',
    startDate: '01 de Julho de 2026',
    endDate: '31 de Outubro de 2026',
    totalHours: 360,
    completedHours: 290,
    status: 'Em Andamento',
    evaluationScore: 18.5,
    location: 'Av. 25 de Setembro, Maputo',
    stipend: 'Bolsa de Estágio Ativa'
  };

  const completedPercentage = Math.round((internshipData.completedHours / internshipData.totalHours) * 100);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReportSuccess(true);
    setReportText('');
    setTimeout(() => setReportSuccess(false), 4000);
  };

  return (
    <div id="student-internship-tab" className="space-y-6">
      
      {/* Header do Estágio */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Inserção Profissional & Prática no Terreno
            </span>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-emerald-600" />
              Estágio Curricular / Profissional
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Acompanhamento de horas práticas, tutoria acadêmica e envio de relatórios de atividades
            </p>
          </div>

          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {internshipData.status}
          </span>
        </div>

        {/* Barra de Progresso das Horas */}
        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 font-semibold">Progresso da Carga Horária Exigida:</span>
            <span className="font-bold text-slate-900">
              {internshipData.completedHours}h de {internshipData.totalHours}h ({completedPercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${completedPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid de Informações do Estágio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Dados da Empresa & Supervisores */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Entidade Concedente do Estágio
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Empresa</span>
              <p className="font-bold text-slate-900 text-sm">{internshipData.companyName}</p>
              <p className="text-slate-500">{internshipData.department}</p>
              <p className="text-slate-400 text-[11px]">{internshipData.location}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Supervisor na Empresa</span>
                <p className="font-semibold text-slate-800">{internshipData.companySupervisor}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tutor Institucional</span>
                <p className="font-semibold text-slate-800">{internshipData.academicTutor}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Período de Vigência</span>
                <span className="font-mono font-medium text-slate-800">
                  {internshipData.startDate} a {internshipData.endDate}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Classificação Preliminar</span>
                <span className="font-black text-emerald-700 text-sm">{internshipData.evaluationScore} Valores</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onRequestInternshipDoc}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Solicitar Declaração de Estágio à Secretaria</span>
            </button>
          </div>
        </div>

        {/* Submissão de Relatório Periódico de Atividades */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Enviar Relatório Semanal de Atividades
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registre as tarefas executadas no ambiente corporativo para validação pelo tutor.
            </p>
          </div>

          {reportSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Relatório Submetido com Sucesso!</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Seu tutor acadêmico e o supervisor da empresa foram notificados para validação das horas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Horas Cumpridas nesta Semana</label>
                <input
                  type="number"
                  value={reportHours}
                  onChange={e => setReportHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resumo das Tarefas Executadas *</label>
                <textarea
                  rows={4}
                  required
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  placeholder="Descreva projetos, tecnologias utilizadas, incidentes resolvidos e aprendizados da semana..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submeter Relatório ao Tutor</span>
              </button>
            </form>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              O cumprimento integral do estágio com aprovação de relatório é requisito curricular obrigatório para emissão do diploma final.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
