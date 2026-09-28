import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  Award, 
  FileCheck, 
  Lock, 
  Send, 
  Calendar, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  FileSpreadsheet,
  QrCode
} from 'lucide-react';

interface StudentEvaluationsPautasTabProps {
  currentStudent: Student;
  onRequestReview: (refInfo?: string) => void;
  forceView?: 'notas' | 'pauta';
  initialSubView?: 'avaliacoes' | 'pautas';
}

export const StudentEvaluationsPautasTab: React.FC<StudentEvaluationsPautasTabProps> = ({
  currentStudent,
  onRequestReview,
  forceView,
  initialSubView
}) => {
  const { allEvaluations, pautaHomologations } = useApp();
  const defaultSub = forceView === 'pauta' ? 'pautas' : (initialSubView || 'avaliacoes');
  const [activeSubView, setActiveSubView] = useState<'avaliacoes' | 'pautas'>(defaultSub);

  React.useEffect(() => {
    if (forceView === 'pauta') {
      setActiveSubView('pautas');
    } else if (forceView === 'notas') {
      setActiveSubView('avaliacoes');
    } else if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [forceView, initialSubView]);

  // Avaliações cadastradas no estudante ou no sistema de avaliações
  const studentAssessments = currentStudent.assessments || [];

  // Pautas homologadas da turma
  const classPautas = pautaHomologations.filter(p => 
    p.classGroupId === currentStudent.classGroupId ||
    p.classGroupName === currentStudent.classGroupName
  );

  return (
    <div id="student-evaluations-pautas-tab" className="space-y-6">
      
      {/* Banner de Proteção de Notas & Pautas */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 text-amber-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Notas e Pautas Oficiais Protegidas (Somente Leitura)
              </h3>
              <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-md text-[10px] font-bold uppercase tracking-wider">
                SIVEC Homologado
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
              As notas e pautas são documentos oficiais autenticados e consolidados. O estudante <strong>não tem permissão para alterar notas, médias ou situações acadêmicas</strong>. Se identificar divergência de pontos ou erro de contagem, submeta um pedido de Revisão de Prova à secretaria.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRequestReview()}
          className="px-4 py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Solicitar Revisão de Prova</span>
        </button>
      </div>

      {/* Alternador de Sub-Aba: Avaliações vs Pautas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubView('avaliacoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSubView === 'avaliacoes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Avaliações & Testes ({studentAssessments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('pautas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSubView === 'pautas'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Pautas Oficiais Homologadas ({classPautas.length || 1})</span>
        </button>
      </div>

      {/* SUB-VIEW 1: AVALIAÇÕES & NOTAS */}
      {activeSubView === 'avaliacoes' && (
        <div className="space-y-4">
          
          {/* Card Resumo da Média */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Aproveitamento Acadêmico Consolidado
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                Média Ponderada: <span className="text-emerald-700">{currentStudent.averageGrade} Valores</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Escala oficial moçambicana de 0 a 20 valores (Mínimo de aprovação: 10 valores)</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                {currentStudent.averageGrade >= 14 ? '★ Aprovado com Louvor' : '✓ Aprovado'}
              </span>
            </div>
          </div>

          {/* Tabela de Avaliações */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">Quadro de Provas, Trabalhos e Exames</h4>
              <span className="text-[11px] text-slate-500">Resultados homologados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Avaliação & Módulo</th>
                    <th className="px-4 py-3">Docente Responsável</th>
                    <th className="px-4 py-3">Data da Prova</th>
                    <th className="px-4 py-3 text-center">Peso (%)</th>
                    <th className="px-4 py-3 text-right">Nota Obtida (0-20)</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAssessments.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">{item.moduleName}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{item.teacher || 'Corpo Docente'}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">{item.date}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-700">{item.weight}%</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`text-sm font-black ${
                          item.score >= 14 ? 'text-emerald-700' : item.score >= 10 ? 'text-blue-700' : 'text-rose-700'
                        }`}>
                          {item.score.toFixed(1)} <span className="text-slate-400 text-xs font-normal">/ {item.maxScore}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onRequestReview(`Avaliação: ${item.title} (${item.moduleName})`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                        >
                          Pedir Revisão
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 2: PAUTAS OFICIAIS */}
      {activeSubView === 'pautas' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pautas Oficiais da Turma Homologadas</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pautas oficiais chanceladas pela Direção Pedagógica com validade institucional e termo de encerramento
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pauta Exemplo Homologada */}
              <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/20 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded uppercase">
                      Pauta Oficial Homologada
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-2">
                      Pauta Geral de Aproveitamento Semestral
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentStudent.classGroupName} • 1º e 2º Trimestres 2026
                    </p>
                  </div>
                  <FileCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Situação Oficial do Aluno:</span>
                    <span className="font-bold text-emerald-700">APROVADO POR MÉRITO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Média Final Homologada:</span>
                    <span className="font-black text-slate-900">{currentStudent.averageGrade} Valores</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Homologado Por:</span>
                    <span className="font-semibold text-slate-800">Dra. Amina Abdul (Dir. Pedagógica)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-emerald-100">
                  <span className="font-mono">Chave: SIVEC-PT-2026-9921</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Assinatura Digital Ativa
                  </span>
                </div>
              </div>

              {/* Informação sobre recursos */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Regulamento de Homologação & Recursos
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Após a publicação e afixação da pauta oficial pela Secretaria, é facultado ao estudante requerer a retificação de erro material de cálculo ou revisão de exame no prazo máximo de 5 dias úteis.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onRequestReview('Pauta Oficial Homologada')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submeter Recurso à Secretaria</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
