import React from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  Download, 
  Printer, 
  Award, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  GraduationCap,
  Building2
} from 'lucide-react';

interface StudentBoletimTabProps {
  currentStudent: Student;
}

export const StudentBoletimTab: React.FC<StudentBoletimTabProps> = ({ currentStudent }) => {
  const { activeInstitution } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const disciplines = [
    { name: 'Algoritmos & Lógica de Programação', t1: 18.0, t2: 17.5, exame: 18.0, media: 18.0, freq: 98, situacao: 'Aprovado' },
    { name: 'Arquitetura de Software & Microsserviços', t1: 17.0, t2: 17.0, exame: 17.5, media: 17.2, freq: 96, situacao: 'Aprovado' },
    { name: 'Engenharia de Dados & Bancos SQL/NoSQL', t1: 16.5, t2: 17.0, exame: 18.0, media: 17.3, freq: 94, situacao: 'Aprovado' },
    { name: 'Desenvolvimento Frontend Moderno (React & TS)', t1: 19.0, t2: 18.5, exame: 18.0, media: 18.5, freq: 100, situacao: 'Aprovado' },
    { name: 'Cibersegurança & Práticas DevSecOps', t1: 16.0, t2: 16.5, exame: 17.0, media: 16.5, freq: 92, situacao: 'Aprovado' },
    { name: 'Gestão de Projetos Ágeis & Soft Skills', t1: 17.5, t2: 18.0, exame: 17.5, media: 17.7, freq: 96, situacao: 'Aprovado' }
  ];

  return (
    <div id="student-boletim-tab" className="space-y-6">
      
      {/* Barra de Ações Rápidas do Boletim */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Documento Oficial Escolar
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Boletim de Aproveitamento & Frequência
          </h2>
          <p className="text-xs text-slate-500">Ano Letivo 2026 • 1º e 2º Semestres</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO DO BOLETIM OFICIAL (ESTILIZADO PARA IMPRESSÃO) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-sm space-y-6 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        
        {/* Cabeçalho Oficial da Instituição */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg tracking-wider">
              MTW
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 uppercase tracking-wider">
                {activeInstitution?.name || 'Moztechwave Professional Institute'}
              </h1>
              <p className="text-[11px] text-slate-600 font-medium">
                SIGAR • Sistema Integrado de Gestão Acadêmica e Reconhecimento
              </p>
              <p className="text-[10px] text-slate-400">
                Homologado pelo Ministério da Educação e Cultura • República de Moçambique
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-bold">
              BOLETIM Nº {currentStudent.code.slice(-4)}/2026
            </span>
            <p className="text-[10px] text-slate-400 font-mono mt-1">Data de Emissão: 17/09/2026</p>
          </div>
        </div>

        {/* Informações do Estudante */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Estudante</span>
            <p className="font-bold text-slate-900">{currentStudent.fullName}</p>
            <p className="font-mono text-slate-600 text-[11px]">{currentStudent.documentType}: {currentStudent.documentNumber}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Curso & Especialidade</span>
            <p className="font-bold text-slate-900">{currentStudent.courseName}</p>
            <p className="text-slate-600 text-[11px]">{currentStudent.classGroupName} ({currentStudent.regime})</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Situação Escolar</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                {currentStudent.status}
              </span>
              <span className="font-bold text-emerald-700">Aprovado por Mérito</span>
            </div>
          </div>
        </div>

        {/* Tabela de Disciplinas e Notas */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2.5">Disciplina / Módulo Formativo</th>
                <th className="px-3 py-2.5 text-center">1º Teste</th>
                <th className="px-3 py-2.5 text-center">2º Teste</th>
                <th className="px-3 py-2.5 text-center">Exame Final</th>
                <th className="px-3 py-2.5 text-center">Média (0-20)</th>
                <th className="px-3 py-2.5 text-center">Freq. (%)</th>
                <th className="px-3 py-2.5 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {disciplines.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-bold text-slate-900">{d.name}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600 font-mono">{d.t1.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600 font-mono">{d.t2.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600 font-mono">{d.exame.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center font-black text-emerald-800 font-mono">{d.media.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center text-slate-700 font-mono">{d.freq}%</td>
                  <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{d.situacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo Final & Deliberação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-900 block">Média Final Ponderada</span>
            <span className="text-2xl font-black text-emerald-800">{currentStudent.averageGrade} Valores</span>
            <p className="text-[11px] text-emerald-700 mt-0.5">Escala de 0 a 20 (Aprovado com Louvor)</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-900 block">Assiduidade Global</span>
            <span className="text-2xl font-black text-slate-900">{currentStudent.attendancePercentage}%</span>
            <p className="text-[11px] text-slate-600 mt-0.5">Frequência regular comprovada</p>
          </div>
        </div>

        {/* Rodapé com Assinaturas e Autenticação QR */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
              <p className="font-bold text-slate-800">Autenticação SIVEC-MOZTECH</p>
              <p>Chave: 9f8a-2026-c741-90a1</p>
              <p>Validação: sigar.moztechwave.co.mz</p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-center text-[10px] text-slate-600">
            <div>
              <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                Dra. Amina Abdul
              </div>
              <span>Diretora Pedagógica</span>
            </div>
            <div>
              <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                Eng. Paulo Jafim
              </div>
              <span>Diretor Geral</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
