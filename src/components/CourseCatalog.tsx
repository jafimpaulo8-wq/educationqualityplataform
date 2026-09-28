import React, { useState } from 'react';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Filter, 
  BadgePercent,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { COURSES_DATA } from '../data/mockData';
import { Course } from '../types';

interface CourseCatalogProps {
  onSelectCourseToEnroll: (courseId: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectCourseToEnroll }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Tecnologia', 'Gestão', 'Engenharia'];

  const filteredCourses = selectedCategory === 'Todos'
    ? COURSES_DATA
    : COURSES_DATA.filter((c) => c.category === selectedCategory);

  return (
    <section id="cursos" className="py-16 sm:py-20 bg-slate-900/60 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Oferta Formativa 2026/2027
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Cursos Técnicos Profissionais &amp; Vagas Abertas
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Selecione o seu curso e garanta a sua vaga. Cursos com certificação oficial Moztechwave e validação digital no SIVERC.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Filtrar:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: Course) => {
            const percentageFilled = Math.round((course.filledVacancies / course.totalVacancies) * 100);
            const remaining = course.totalVacancies - course.filledVacancies;

            return (
              <div
                key={course.id}
                className="flex flex-col bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Course Image Header */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-950/80 text-sky-400 border border-sky-500/30 backdrop-blur-md">
                      {course.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {course.regime}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      {course.duration}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {course.feeMonthly.toLocaleString()} MT / mês
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors leading-snug">
                      {course.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Key Highlights */}
                    <div className="mt-3 space-y-1.5">
                      {course.highlights.slice(0, 2).map((hl, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vacancy Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        Ocupação de Turma:
                      </span>
                      <span className={`font-semibold ${remaining <= 5 ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                        {course.filledVacancies}/{course.totalVacancies} ({remaining} vagas restantes)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentageFilled > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-sky-500 to-emerald-400'
                        }`}
                        style={{ width: `${percentageFilled}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <button
                    onClick={() => onSelectCourseToEnroll(course.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-sky-500 transition-all duration-200 cursor-pointer group/btn"
                  >
                    <span>Inscrever-se neste Curso</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
