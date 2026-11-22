import React, { useMemo, useState } from 'react';
import {
  Cake,
  MessageCircle,
  Printer,
  StickyNote,
  Plus,
  Trash2,
  Pin,
  PinOff,
  X,
  Sparkles,
  Users
} from 'lucide-react';
import { Institution, Student, Teacher, TeamSharedNote } from '../../types';
import { useApp } from '../../context/AppContext';
import { printIsolatedElement } from '../../utils/printHelper';

interface BirthdaysAndNotesPanelProps {
  institution: Institution;
  students: Student[];
  teachers: Teacher[];
  openWhatsAppMessage: (phone: string, text: string) => void;
}

interface BirthdayPerson {
  id: string;
  name: string;
  roleLabel: string;
  birthDate: string;
  phone?: string;
  photoUrl?: string;
  day: number;
  month: number;
  isToday: boolean;
}

function parseMonthDay(rawDate?: string): { month: number; day: number } | null {
  if (!rawDate) return null;
  const clean = rawDate.trim();
  // YYYY-MM-DD
  const iso = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) {
    return { month: parseInt(iso[2], 10), day: parseInt(iso[3], 10) };
  }
  // DD/MM/YYYY
  const dmy = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    return { month: parseInt(dmy[2], 10), day: parseInt(dmy[1], 10) };
  }
  return null;
}

export const BirthdaysAndNotesPanel: React.FC<BirthdaysAndNotesPanelProps> = ({
  institution,
  students,
  teachers,
  openWhatsAppMessage
}) => {
  const {
    teamSharedNotes,
    addTeamSharedNote,
    toggleTeamNoteShowOnHome,
    deleteTeamSharedNote,
    currentUser
  } = useApp();

  const [birthdayScope, setBirthdayScope] = useState<'hoje' | 'mes'>('hoje');
  const [showBirthdayPrintModal, setShowBirthdayPrintModal] = useState(false);

  // Notas partilhadas state
  const [notesFilter, setNotesFilter] = useState<'home' | 'todas'>('home');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<TeamSharedNote['category']>('geral');
  const [notePriority, setNotePriority] = useState<TeamSharedNote['priority']>('normal');
  const [noteShowOnHome, setNoteShowOnHome] = useState(true);

  const now = new Date();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  const allBirthdays = useMemo<BirthdayPerson[]>(() => {
    const people: BirthdayPerson[] = [];

    students.forEach(s => {
      const parsed = parseMonthDay(s.birthDate || s.dataNascimento);
      if (!parsed || parsed.month !== todayMonth) return;
      people.push({
        id: `stu-${s.id}`,
        name: s.fullName || s.name || 'Aluno',
        roleLabel: s.courseName || 'Estudante',
        birthDate: s.birthDate || s.dataNascimento || '',
        phone: s.phone || s.guardianPhone,
        photoUrl: s.photoUrl,
        day: parsed.day,
        month: parsed.month,
        isToday: parsed.day === todayDay
      });
    });

    teachers
      .filter(t => !institution?.id || !t.institutionId || t.institutionId === institution.id)
      .forEach(t => {
        const rawBirth = (t as any).birthDate || (t as any).dataNascimento;
        const parsed = parseMonthDay(rawBirth);
        if (!parsed || parsed.month !== todayMonth) return;
        people.push({
          id: `tch-${t.id}`,
          name: t.fullName || 'Formador',
          roleLabel: 'Formador / Docente',
          birthDate: rawBirth || '',
          phone: t.phone,
          photoUrl: t.photoUrl,
          day: parsed.day,
          month: parsed.month,
          isToday: parsed.day === todayDay
        });
      });

    return people.sort((a, b) => a.day - b.day);
  }, [students, teachers, institution?.id, todayMonth, todayDay]);

  const todayBirthdays = useMemo(() => allBirthdays.filter(b => b.isToday), [allBirthdays]);
  const visibleBirthdays = birthdayScope === 'hoje' ? todayBirthdays : allBirthdays;

  const displayedNotes = useMemo(() => {
    if (notesFilter === 'home') {
      return teamSharedNotes.filter(n => n.showOnHome);
    }
    return teamSharedNotes;
  }, [teamSharedNotes, notesFilter]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    addTeamSharedNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: noteCategory,
      priority: notePriority,
      showOnHome: noteShowOnHome,
      authorName: currentUser?.name || institution.representativeName || 'Administração',
      authorRole: String(currentUser?.role || 'Gestão')
    });
    setNoteTitle('');
    setNoteContent('');
    setShowNoteForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Faixa de Destaque para Aniversariantes de HOJE */}
      {todayBirthdays.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-amber-500/10 border border-pink-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">
                Hoje é dia de celebração! ({todayBirthdays.length} aniversariante{todayBirthdays.length > 1 ? 's' : ''} hoje)
              </h4>
              <p className="text-[11px] text-pink-200/90">
                {todayBirthdays.map(b => b.name).join(', ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBirthdayScope('hoje')}
            className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
          >
            Felicitar Agora
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BLOCO ESQUERDO: ANIVERSARIANTES DO DIA & DO MÊS */}
        <div className="lg:col-span-6 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cake className="w-4 h-4 text-pink-400" />
              Aniversariantes ({allBirthdays.length} no mês)
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setBirthdayScope('hoje')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
                    birthdayScope === 'hoje' ? 'bg-pink-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hoje ({todayBirthdays.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBirthdayScope('mes')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
                    birthdayScope === 'mes' ? 'bg-pink-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Este Mês ({allBirthdays.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowBirthdayPrintModal(true)}
                title="Imprimir Lista de Aniversariantes"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {visibleBirthdays.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  {birthdayScope === 'hoje'
                    ? 'Nenhum aniversariante registado para a data de hoje.'
                    : 'Nenhum aniversariante registado para este mês.'}
                </p>
                {birthdayScope === 'hoje' && allBirthdays.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBirthdayScope('mes')}
                    className="text-xs text-pink-400 font-bold hover:underline cursor-pointer"
                  >
                    Ver {allBirthdays.length} aniversariantes deste mês
                  </button>
                )}
              </div>
            ) : (
              visibleBirthdays.map(person => (
                <div
                  key={person.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    person.isToday
                      ? 'bg-pink-950/30 border-pink-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-pink-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {person.photoUrl ? (
                      <img
                        src={person.photoUrl}
                        alt={person.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-300 font-black text-xs shrink-0">
                        {person.day}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-white truncate">{person.name}</h5>
                        {person.isToday && (
                          <span className="px-1.5 py-0.5 rounded bg-pink-500 text-slate-950 text-[9px] font-black uppercase">
                            HOJE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{person.roleLabel}</p>
                      <span className="text-[10px] font-mono text-pink-400 font-bold">
                        Dia {String(person.day).padStart(2, '0')}/{String(person.month).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {person.phone && (
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Olá ${person.name}! Em nome da Direção e de toda a equipa de ${institution.name}, desejamos-lhe um Feliz Aniversário e muito sucesso!`;
                        openWhatsAppMessage(person.phone || '', msg);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer transition-all shrink-0 shadow"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* BLOCO DIREITO: ANOTAÇÕES INTERNAS PARTILHADAS COM PIN HOME */}
        <div className="lg:col-span-6 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-400" />
              Anotações Internas da Equipa
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setNotesFilter('home')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
                    notesFilter === 'home' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Na Home ({teamSharedNotes.filter(n => n.showOnHome).length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotesFilter('todas')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
                    notesFilter === 'todas' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todas ({teamSharedNotes.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowNoteForm(v => !v)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Nota</span>
              </button>
            </div>
          </div>

          {showNoteForm && (
            <form onSubmit={handleSaveNote} className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="Título da anotação..."
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
                <div className="flex gap-2">
                  <select
                    value={noteCategory}
                    onChange={e => setNoteCategory(e.target.value as TeamSharedNote['category'])}
                    className="flex-1 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="geral">Geral</option>
                    <option value="secretaria">Secretaria</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="pedagogico">Pedagógico</option>
                  </select>
                  <select
                    value={notePriority}
                    onChange={e => setNotePriority(e.target.value as TeamSharedNote['priority'])}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={2}
                required
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Lembrete partilhado com secretaria, direção ou tesouraria..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noteShowOnHome}
                    onChange={e => setNoteShowOnHome(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Mostrar na Home (Dashboard Principal)</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer"
                  >
                    Guardar Nota
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {displayedNotes.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <StickyNote className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  {notesFilter === 'home'
                    ? 'Nenhuma anotação fixada na Home. Crie uma nota ou veja todas.'
                    : 'Sem anotações internas partilhadas.'}
                </p>
              </div>
            ) : (
              displayedNotes.map(note => (
                <div
                  key={note.id}
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    note.priority === 'alta'
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                        {note.category}
                      </span>
                      {note.priority === 'alta' && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          Urgente
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-white">{note.title}</h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleTeamNoteShowOnHome(note.id)}
                        title={note.showOnHome ? 'Remover destaque da Home' : 'Mostrar na Home'}
                        className={`p-1.5 rounded-lg cursor-pointer transition ${
                          note.showOnHome
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {note.showOnHome ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTeamSharedNote(note.id)}
                        title="Excluir Anotação"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">{note.content}</p>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Por: {note.authorName}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString('pt-MZ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Lista de Aniversariantes A4 para Impressão */}
      {showBirthdayPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <h3 className="text-base font-bold text-slate-900">Lista de Aniversariantes do Mês</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    printIsolatedElement('birthdays-print-area', `Aniversariantes - ${institution.name}`)
                  }
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Lista
                </button>
                <button
                  type="button"
                  onClick={() => setShowBirthdayPrintModal(false)}
                  className="p-1.5 bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div id="birthdays-print-area" className="p-4 bg-white text-slate-900 space-y-4">
              <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black uppercase">{institution.name}</h2>
                  <p className="text-xs text-slate-500">
                    Aniversariantes de {now.toLocaleDateString('pt-MZ', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">Total: {allBirthdays.length}</span>
              </div>

              {allBirthdays.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Sem aniversariantes registados neste mês.
                </p>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600 uppercase text-[10px]">
                      <th className="py-2">Dia</th>
                      <th className="py-2">Nome</th>
                      <th className="py-2">Vínculo / Curso</th>
                      <th className="py-2">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {allBirthdays.map(b => (
                      <tr key={b.id}>
                        <td className="py-2 font-mono font-bold">
                          {String(b.day).padStart(2, '0')}/{String(b.month).padStart(2, '0')}
                        </td>
                        <td className="py-2 font-semibold">{b.name}</td>
                        <td className="py-2 text-slate-600">{b.roleLabel}</td>
                        <td className="py-2 font-mono text-slate-600">{b.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
