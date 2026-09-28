import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  PlusCircle, 
  CheckCheck, 
  X, 
  Check, 
  Calendar, 
  Paperclip, 
  Download, 
  FileText, 
  Users, 
  Save, 
  Clock, 
  UserCheck, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { ClassLesson } from '../../types';

export const TeacherDiaryView: React.FC = () => {
  const { classes, students, lessons, addLesson, saveAttendance, navigate, routeParams, activeInstitution } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    routeParams.classId || classes[0]?.id || ''
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    lessons[0]?.id || ''
  );

  // Estados do Modal de Nova Aula
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDiscipline, setNewDiscipline] = useState('Engenharia de Software');
  const [newDesc, setNewDesc] = useState('');
  const [newFileName, setNewFileName] = useState('');

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classGroupId === currentClass?.id);
  const classLessons = lessons.filter(l => l.classGroupId === currentClass?.id);
  const currentLesson = lessons.find(l => l.id === selectedLessonId) || classLessons[0];

  // Estado local para controle da chamada ativa
  const [localAttendances, setLocalAttendances] = useState<Record<string, any>>(
    currentLesson?.attendances || {}
  );

  // Sincronizar quando mudar de aula
  React.useEffect(() => {
    if (currentLesson) {
      setLocalAttendances(currentLesson.attendances || {});
    }
  }, [currentLesson?.id]);

  // Botão "Presença para Todos"
  const handleMarkAllPresent = () => {
    const allPresent: Record<string, boolean> = {};
    classStudents.forEach(s => {
      allPresent[s.id] = true;
    });
    setLocalAttendances(allPresent);
  };

  const handleToggleAttendance = (studentId: string) => {
    setLocalAttendances(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSaveAttendance = () => {
    if (currentLesson) {
      saveAttendance(currentLesson.id, localAttendances as any);
    }
  };

  const handleCreateLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    addLesson({
      institutionId: currentClass?.institutionId || activeInstitution.id,
      classGroupId: currentClass.id,
      classGroupName: currentClass.name,
      disciplineName: newDiscipline,
      teacherName: currentClass.teacherName,
      date: new Date().toISOString().split('T')[0],
      title: newTitle,
      description: newDesc,
      materials: newFileName ? [
        {
          id: `mat-${Date.now()}`,
          title: newFileName,
          type: newFileName.endsWith('.zip') ? 'zip' : 'pdf',
          url: '#',
          size: '3.2 MB'
        }
      ] : [],
      attendances: {}
    });

    setNewTitle('');
    setNewDesc('');
    setNewFileName('');
    setModalOpen(false);
  };

  return (
    <div id="teacher-diary-container" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Diário do Professor & Chamada Rápida</h1>
            <p className="text-sm text-slate-500">
              Registro de conteúdo das aulas, anexo de materiais em PDF/ZIP e chamada inteligente com 1 clique
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            id="btn-new-lesson"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Cadastrar Nova Aula
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Lista de Aulas Registradas */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              Aulas da Turma ({classLessons.length})
            </h3>

            <div className="space-y-2">
              {classLessons.map(lesson => {
                const isSelected = lesson.id === (currentLesson?.id || '');

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={isSelected ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        {lesson.date}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSelected ? 'bg-slate-800 text-slate-300' : 'bg-white border border-slate-200 text-slate-600'
                      }`}>
                        {lesson.disciplineName}
                      </span>
                    </div>

                    <div className="font-semibold text-xs leading-snug line-clamp-2">
                      {lesson.title}
                    </div>

                    {lesson.materials && lesson.materials.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                        <Paperclip className="w-3 h-3" />
                        <span>{lesson.materials.length} anexo(s) disponível(is)</span>
                      </div>
                    )}
                  </button>
                );
              })}

              {classLessons.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhuma aula cadastrada para esta turma ainda.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Detalhes da Aula & Chamada Rápida */}
        <div className="lg:col-span-8 space-y-6">
          {currentLesson ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              {/* Informações da Aula */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>{currentLesson.date}</span>
                  <span>•</span>
                  <span>Formador: {currentLesson.teacherName}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{currentLesson.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{currentLesson.description}</p>

                {/* Materiais Anexos para Download */}
                {currentLesson.materials && currentLesson.materials.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                    {currentLesson.materials.map(mat => (
                      <div
                        key={mat.id}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>{mat.title}</span>
                        <span className="text-[10px] text-slate-400">({mat.size})</span>
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-900 p-0.5 cursor-pointer"
                          title="Baixar material"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção da Chamada Rápida */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      Lista de Presença & Frequência
                    </h3>
                    <p className="text-xs text-slate-500">
                      Marque presença individualmente ou use o botão de preenchimento rápido
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="btn-presenca-todos"
                      type="button"
                      onClick={handleMarkAllPresent}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Presença para Todos
                    </button>

                    <button
                      id="btn-salvar-chamada"
                      type="button"
                      onClick={handleSaveAttendance}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar Chamada
                    </button>
                  </div>
                </div>

                {/* Grid de Alunos para Chamada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {classStudents.map(student => {
                    const isPresent = localAttendances[student.id] === true;

                    return (
                      <div
                        key={student.id}
                        onClick={() => handleToggleAttendance(student.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isPresent
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-rose-50/40 border-rose-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.photoUrl}
                            alt={student.fullName}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <div className="text-xs font-bold">{student.fullName}</div>
                            <div className="text-[10px] font-mono opacity-70">{student.code}</div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          isPresent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {isPresent ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {isPresent ? 'Presente' : 'Falta'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Selecione uma aula à esquerda para ver a chamada e materiais.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Cadastrar Nova Aula com Anexos */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Cadastrar Nova Aula no Diário</h3>
            <p className="text-xs text-slate-500">
              Turma: <strong>{currentClass.name}</strong> • Formador: {currentClass.teacherName}
            </p>

            <form onSubmit={handleCreateLessonSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Título / Tema da Aula</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Aula 14: Desenvolvimento de APIs REST com Express"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Disciplina / Módulo</label>
                  <input
                    type="text"
                    value={newDiscipline}
                    onChange={e => setNewDiscipline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Anexo Didático (PDF/ZIP)</label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    placeholder="Ex: Slides_Aula_14.pdf"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Resumo do Conteúdo Ministrado</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Descreva as competências e tópicos abordados na aula prática..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Salvar Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
