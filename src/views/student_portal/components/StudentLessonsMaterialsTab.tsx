import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  User, 
  CheckCircle2, 
  FileArchive, 
  ExternalLink,
  Filter
} from 'lucide-react';

interface StudentLessonsMaterialsTabProps {
  currentStudent: Student;
  mode?: 'ambos' | 'aulas' | 'materiais';
}

export const StudentLessonsMaterialsTab: React.FC<StudentLessonsMaterialsTabProps> = ({ 
  currentStudent,
  mode = 'ambos'
}) => {
  const { lessons } = useApp();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('todas');
  const [searchFilter, setSearchFilter] = useState('');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Filtrar aulas da turma do aluno
  const studentLessons = lessons.filter(l => 
    l.classGroupId === currentStudent.classGroupId ||
    l.classGroupName === currentStudent.classGroupName
  );

  // Disciplinas únicas para o filtro
  const disciplines = Array.from(new Set(studentLessons.map(l => l.disciplineName).filter(Boolean)));

  const filteredLessons = studentLessons.filter(l => {
    const matchesDiscipline = selectedDiscipline === 'todas' || l.disciplineName === selectedDiscipline;
    const matchesSearch = 
      l.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.disciplineName.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesDiscipline && matchesSearch;
  });

  const handleDownload = (materialTitle: string) => {
    setDownloadSuccessMsg(`Download iniciado: "${materialTitle}"`);
    setTimeout(() => {
      setDownloadSuccessMsg(null);
    }, 3500);
  };

  return (
    <div id="student-lessons-materials-tab" className="space-y-6">
      
      {/* Toast de Download */}
      {downloadSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{downloadSuccessMsg}</span>
        </div>
      )}

      {/* Header & Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              {mode === 'materiais' 
                ? 'Repositório Acadêmico & Bibliografia' 
                : mode === 'aulas'
                ? 'Diário Pedagógico & Sumários'
                : 'Plano Pedagógico & Conteúdos'}
            </span>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              {mode === 'materiais' 
                ? 'Materiais Didáticos & Apostilas de Estudo' 
                : mode === 'aulas'
                ? 'Aulas Ministradas & Plano de Lições'
                : 'Aulas Ministradas & Materiais Didáticos'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'materiais'
                ? 'Acesse e baixe apostilas, apresentações em slides, exercícios práticos e códigos laboratoriais'
                : mode === 'aulas'
                ? 'Consulte os sumários das aulas, temas lecionados pelos docentes e competências trabalhadas'
                : 'Consulte sumários das aulas, exercícios laboratoriais e faça o download das apostilas e slides'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
              {mode === 'materiais' ? 'Repositório Aberto' : `${studentLessons.length} Aulas Registradas`}
            </span>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por tema da aula, palavra-chave ou disciplina..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDiscipline}
              onChange={e => setSelectedDiscipline(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todas">Todas as Disciplinas</option>
              {disciplines.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Aulas e Materiais */}
      <div className="space-y-4">
        {filteredLessons.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Nenhuma aula encontrada para o filtro atual</p>
            <p className="text-xs text-slate-400">Tente buscar com outros termos ou selecione outra disciplina.</p>
          </div>
        ) : (
          filteredLessons.map(lesson => (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:border-slate-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    {lesson.disciplineName}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{lesson.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {lesson.date} ({lesson.time})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {lesson.teacherName}
                  </span>
                </div>
              </div>

              {/* Descrição e Sumário da Aula */}
              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>{lesson.description}</p>
                {lesson.content && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-mono text-[11px] whitespace-pre-line">
                    <span className="font-bold text-slate-900 block font-sans mb-1 text-xs">Sumário Desenvolvido:</span>
                    {lesson.content}
                  </div>
                )}
              </div>

              {/* Materiais Didáticos em Anexo para Download */}
              {lesson.materials && lesson.materials.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Ficheiros e Materiais Disponíveis ({lesson.materials.length})
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {lesson.materials.map(mat => (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => handleDownload(mat.title)}
                        className="px-3 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-800 hover:text-emerald-900 flex items-center gap-2 transition cursor-pointer shadow-2xs"
                      >
                        {mat.type === 'zip' ? (
                          <FileArchive className="w-4 h-4 text-amber-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>{mat.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({mat.size})</span>
                        <Download className="w-3.5 h-3.5 text-slate-400 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
