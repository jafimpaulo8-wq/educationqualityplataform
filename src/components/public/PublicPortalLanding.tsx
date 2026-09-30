import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Building2, 
  HelpCircle, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  Award, 
  CreditCard, 
  FileText, 
  Lock, 
  Globe, 
  Sparkles, 
  ExternalLink, 
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Filter,
  Users,
  School,
  MapPin,
  Tag,
  Check,
  KeyRound,
  BookOpen,
  X,
  Phone,
  Mail,
  Info
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { useApp } from '../../context/AppContext';
import { COURSES_DATA } from '../../data/mockData';
import { Course, Institution } from '../../types';

interface PublicPortalLandingProps {
  onOpenAuthModal: (mode?: 'google' | 'credentials' | 'code') => void;
  onOpenPublicVerify: () => void;
  onOpenOnlineRegistration?: (courseName?: string) => void;
  onOpenRegisterInstitution: () => void;
  onOpenHelp: () => void;
}

export const PublicPortalLanding: React.FC<PublicPortalLandingProps> = ({
  onOpenAuthModal,
  onOpenPublicVerify,
  onOpenOnlineRegistration,
  onOpenRegisterInstitution,
  onOpenHelp,
}) => {
  const [quickVerifyCode, setQuickVerifyCode] = useState('');
  const [selectedInstFilter, setSelectedInstFilter] = useState<string>('todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<(Course & { instName: string; instCode: string; instCity?: string }) | null>(null);

  const { 
    themeMode, 
    allInstitutions, 
    activeInstitution, 
    courses = [], 
    allCourses = [],
    navigate 
  } = useApp();

  const isLight = themeMode === 'branco';

  const handleQuickVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickVerifyCode.trim()) {
      soundManager.playClick();
      window.location.href = `/verify/${encodeURIComponent(quickVerifyCode.trim())}`;
    }
  };

  // Combine courses from registered institutions and default certified curricula
  const combinedCourses = useMemo(() => {
    const list: (Course & { instName: string; instCode: string; instCity?: string })[] = [];
    const sourceCourses = (allCourses && allCourses.length > 0) ? allCourses : COURSES_DATA;

    sourceCourses.forEach((c) => {
      const inst = allInstitutions.find(i => i.id === c.institutionId) || activeInstitution;
      
      // Ensure high quality educational photography for each course category
      let courseImg = c.image;
      if (!courseImg || courseImg.includes('placeholder') || courseImg.trim() === '') {
        const cat = (c.category || '').toLowerCase();
        const nm = (c.name || '').toLowerCase();
        if (cat.includes('tec') || nm.includes('soft') || nm.includes('prog') || nm.includes('web')) {
          courseImg = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
        } else if (nm.includes('rede') || nm.includes('cisco') || nm.includes('ciber')) {
          courseImg = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80';
        } else if (cat.includes('gest') || nm.includes('contab') || nm.includes('primavera') || nm.includes('neg')) {
          courseImg = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
        } else if (nm.includes('elet') || nm.includes('auto') || nm.includes('plc')) {
          courseImg = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
        } else if (nm.includes('maq') || nm.includes('pesad') || nm.includes('escav')) {
          courseImg = 'https://images.unsplash.com/photo-1579273166657-1901844bca03?auto=format&fit=crop&w=800&q=80';
        } else if (nm.includes('mec') || nm.includes('diesel') || nm.includes('motor')) {
          courseImg = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80';
        } else if (nm.includes('adu') || nm.includes('júe') || nm.includes('logist') || nm.includes('port')) {
          courseImg = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80';
        } else if (nm.includes('ing') || nm.includes('ling') || nm.includes('petr')) {
          courseImg = 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80';
        } else if (nm.includes('saud') || nm.includes('enf') || nm.includes('farm')) {
          courseImg = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80';
        } else {
          courseImg = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
        }
      }

      list.push({
        ...c,
        image: courseImg,
        instName: inst?.name || 'CFTPM Moztechwave',
        instCode: inst?.code || 'MTW-CF-0001',
        instCity: inst?.city || 'Matola'
      });
    });

    return list;
  }, [allCourses, allInstitutions, activeInstitution]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return combinedCourses.filter((c) => {
      const matchInst = selectedInstFilter === 'todas' || c.institutionId === selectedInstFilter;
      const matchCat = selectedCategory === 'Todos' || c.category === selectedCategory || 
        (selectedCategory === 'Tecnologia' && (c.category?.includes('Tec') || c.category?.includes('Inf'))) ||
        (selectedCategory === 'Gestão' && (c.category?.includes('Gest') || c.category?.includes('Cont'))) ||
        (selectedCategory === 'Engenharia & Mecânica' && (c.category?.includes('Mec') || c.category?.includes('Elet') || c.category?.includes('Máq'))) ||
        (selectedCategory === 'Aduaneiras & Logística' && (c.category?.includes('Adu') || c.category?.includes('Log')));
      return matchInst && matchCat;
    });
  }, [combinedCourses, selectedInstFilter, selectedCategory]);

  const categories = [
    'Todos', 
    'Tecnologia', 
    'Gestão', 
    'Engenharia & Mecânica',
    'Aduaneiras & Logística'
  ];

  return (
    <div className={`flex flex-col min-h-screen font-sans transition-colors ${
      isLight ? 'bg-white text-slate-900 selection:bg-blue-600 selection:text-white' : 'bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white'
    }`}>
      
      {/* Hero Section */}
      <section className={`relative overflow-hidden py-16 sm:py-24 border-b ${
        isLight 
          ? 'border-slate-200 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.12),rgba(255,255,255,1))]' 
          : 'border-slate-800/60 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 ${
            isLight 
              ? 'bg-sky-50 border border-sky-200 text-sky-700 shadow-2xs' 
              : 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Educação digital. Gestão inteligente. Futuro melhor.</span>
          </div>

          <h1 className={`text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-none max-w-4xl mx-auto ${
            isLight ? 'text-slate-950' : 'text-white'
          }`}>
            SIGAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">PRO</span>
          </h1>

          <p className={`text-base sm:text-xl max-w-3xl mx-auto mt-4 font-normal leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Plataforma Integrada de Gestão de Centros de Formação, Cursos Profissionais e Emissão de Certificados SIVEC em Moçambique.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            {onOpenOnlineRegistration && (
              <button
                type="button"
                onClick={() => onOpenOnlineRegistration()}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <GraduationCap className="w-5 h-5 text-white" />
                <span>Inscrição Online nos Cursos</span>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenAuthModal('google')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Aceder à Gestão SIGAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Master Access with Code Button */}
            <button
              type="button"
              onClick={() => onOpenAuthModal('code')}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs' 
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Entrar com Código MTW / CEO</span>
            </button>

            <button
              type="button"
              onClick={onOpenPublicVerify}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Search className="w-4 h-4 text-sky-500" />
              <span>Verificação SIVEC</span>
            </button>

            <button
              type="button"
              onClick={onOpenRegisterInstitution}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>Registar Centro / Instituição</span>
            </button>
          </div>

          {/* CEO Master Code Access Card */}
          <div className={`max-w-2xl mx-auto mt-8 p-4 rounded-2xl border text-left transition-all ${
            isLight
              ? 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border-amber-300 shadow-sm'
              : 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/30'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <span className={`text-xs font-bold ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
                    É o CEO ou Cadastrador de Centros?
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold border border-amber-300">
                    MOZTECHWAVE CORE
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Insira o código mestre soberano <strong className="font-mono text-amber-700 dark:text-amber-300">MTW-CEO-MASTER-2026</strong> na aba de código para cadastrar centros e delegar perfis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenAuthModal('code')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>Acessar via Código</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Certificate Verification Box */}
          <div className={`max-w-xl mx-auto mt-8 p-5 rounded-2xl border backdrop-blur-md shadow-xl ${
            isLight 
              ? 'bg-white/95 border-slate-200 shadow-slate-200/50' 
              : 'bg-slate-900/80 border-slate-800 shadow-2xl'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider text-left mb-2.5 flex items-center gap-1.5 ${
              isLight ? 'text-slate-700' : 'text-slate-400'
            }`}>
              <Award className="w-4 h-4 text-amber-500" />
              <span>Verificação Rápida de Certificados &amp; Diplomas SIVEC</span>
            </h3>
            <form onSubmit={handleQuickVerifySubmit} className="flex gap-2">
              <input
                type="text"
                value={quickVerifyCode}
                onChange={(e) => setQuickVerifyCode(e.target.value)}
                placeholder="Insira o código SIVEC (Ex: SIVEC-2026-XXXX)"
                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-mono uppercase focus:outline-hidden transition-colors ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500' 
                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-sky-500'
                }`}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Validar
              </button>
            </form>
            <p className={`text-[11px] text-left mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Validação pública de autenticidade criptográfica de documentos emitidos por instituições autorizadas.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SEÇÃO PRINCIPAL: CURSOS COM FOTOS DOS CENTROS CADASTRADOS (PEDIDO DO USER)*/}
      {/* ========================================================================= */}
      <section id="cursos-section" className={`py-16 sm:py-20 border-b ${
        isLight ? 'bg-slate-50/60 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header da Vitrine de Cursos */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Vitrine de Cursos &amp; Centros Credenciados</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                Cursos Profissionais e Técnicos Disponíveis
              </h2>
              <p className={`text-xs sm:text-sm mt-1.5 max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Formações acreditadas com aulas teóricas e práticas em oficinas, laboratórios e empresas parceiras. Selecione o curso para ver detalhes ou inscrever-se.
              </p>
            </div>

            {/* Filtro por Instituição / Centro */}
            <div className="flex items-center gap-2">
              <Building2 className={`w-4 h-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
              <select
                value={selectedInstFilter}
                onChange={(e) => setSelectedInstFilter(e.target.value)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                  isLight 
                    ? 'bg-white border-slate-300 text-slate-800 focus:border-sky-500' 
                    : 'bg-slate-900 border-slate-800 text-white focus:border-sky-500'
                }`}
              >
                <option value="todas">Todos os Centros de Formação</option>
                {allInstitutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.city || inst.province})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro por Categoria */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-sky-600 text-white shadow-md' 
                    : (isLight 
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200' 
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800')
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grade de Cursos com Fotos Reais */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((c) => (
                <div
                  key={c.id}
                  className={`group rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                    isLight 
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Foto do Curso com Tags Sobrepostas */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Badge do Centro / Instituição */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 truncate max-w-[200px]">
                        <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate">{c.instName}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black tracking-wide uppercase">
                        <Award className="w-3 h-3" />
                        SIVEC
                      </span>
                    </div>

                    {/* Preço / Mensalidade no canto inferior da imagem */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-[11px] font-medium bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {c.modality || 'Presencial'}
                      </span>
                      <div className="font-mono text-sm font-black text-emerald-300 drop-shadow-sm">
                        {c.monthlyFee || c.feeMonthly ? (
                          `${(c.monthlyFee || c.feeMonthly || 0).toLocaleString()} MT/mês`
                        ) : (
                          'Inscrições Abertas'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                          isLight ? 'text-sky-600' : 'text-sky-400'
                        }`}>
                          {c.category}
                        </span>
                        {c.code && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {c.code}
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base font-bold line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {c.name}
                      </h3>

                      <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {c.description || 'Formação profissional com módulos teóricos e práticos, materiais didáticos e certificação reconhecida.'}
                      </p>

                      {/* Informações Rápidas */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.duration || '6 Meses'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{c.instCity || 'Moçambique'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação do Curso */}
                    <div className="flex items-center gap-2 mt-5 pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCourseDetails(c)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                          isLight 
                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        Ver Detalhes
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenOnlineRegistration) {
                            onOpenOnlineRegistration(c.name);
                          } else {
                            navigate('inscricao_publica');
                          }
                        }}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <span>Inscrever-se</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-12 text-center rounded-3xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Nenhum curso encontrado nesta categoria
              </h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Tente selecionar outra categoria ou visualizar todos os centros de formação.
              </p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('Todos'); setSelectedInstFilter('todas'); }}
                className="mt-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
              >
                Ver Todos os Cursos
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SEÇÃO DOS CENTROS DE FORMAÇÃO CREDENCIADOS NO ECOSSISTEMA                */}
      {/* ========================================================================= */}
      <section className={`py-16 sm:py-20 border-b ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <School className="w-3.5 h-3.5" />
              <span>Rede de Instituições Conectadas</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
              Centros de Formação &amp; Instituições Credenciadas
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Instituições com ambientes autorizados no SIGAR para gestão de alunos, pautas e emissão de diplomas oficiais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allInstitutions.map((inst) => {
              const instCoursesCount = combinedCourses.filter(c => c.institutionId === inst.id).length;
              return (
                <div
                  key={inst.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-lg ${
                    isLight ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                          {inst.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className={`text-sm font-bold leading-snug line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {inst.name}
                          </h3>
                          <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {inst.code}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        Ativo
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{inst.city || 'Cidade'}, {inst.province || 'Moçambique'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Representante: {inst.representativeName || 'Direção Geral'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{instCoursesCount} Cursos ativos no catálogo</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInstFilter(inst.id);
                        const el = document.getElementById('cursos-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver Cursos deste Centro</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      SIVEC Ativo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Modern SaaS Features Overview */}
      <section className={`py-16 sm:py-20 border-b ${
        isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800/60 bg-slate-900/30'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isLight ? 'text-slate-950' : 'text-white'
            }`}>
              Tecnologia Completa para o Ensino Técnico e Universitário
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Desenvolvido sob padrões rigorosos de segurança e soberania de dados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className={`p-6 rounded-2xl border space-y-3 flex flex-col justify-between transition-shadow ${
              isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-slate-900/70 border-slate-800'
            }`}>
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-sky-50 border border-sky-200 text-sky-600' : 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Inscrições &amp; Matrículas Digitais
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Recepção e triagem de candidaturas online, envio de documentos e gestão de turmas com redução de filas.
                </p>
              </div>
              {onOpenOnlineRegistration && (
                <button
                  type="button"
                  onClick={() => onOpenOnlineRegistration()}
                  className={`mt-3 w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isLight
                      ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700'
                      : 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400 hover:text-sky-300'
                  }`}
                >
                  <span>Fazer Inscrição Agora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 transition-shadow ${
              isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-slate-900/70 border-slate-800'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              }`}>
                <Award className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Certificados &amp; Selo SIVEC
              </h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Emissão segura de diplomas com hash criptográfico, código QR de validação e rastreamento oficial.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 transition-shadow ${
              isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-slate-900/70 border-slate-800'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-cyan-50 border border-cyan-200 text-cyan-600' : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
              }`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Pagamentos M-Pesa &amp; e-Mola
              </h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Conciliação financeira de propinas e taxas escolares em tempo real com emissão imediata de recibos.
              </p>
            </div>

          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => onOpenAuthModal('google')}
              className={`inline-flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer ${
                isLight ? 'text-sky-600 hover:text-sky-700' : 'text-sky-400 hover:text-sky-300'
              }`}
            >
              <span>Aceda ao seu painel institucional autorizado</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Course Details Modal */}
      {selectedCourseDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            {/* Header Image */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100 shrink-0">
              <img
                src={selectedCourseDetails.image}
                alt={selectedCourseDetails.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <button
                type="button"
                onClick={() => setSelectedCourseDetails(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="px-2.5 py-1 rounded-md bg-sky-500 text-white text-[11px] font-black uppercase tracking-wider">
                  {selectedCourseDetails.category}
                </span>
                <h3 className="text-xl font-black mt-1 text-white">
                  {selectedCourseDetails.name}
                </h3>
                <p className="text-xs text-slate-200 mt-0.5">
                  Oferecido por: <strong>{selectedCourseDetails.instName}</strong>
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div>
                <h4 className="font-bold text-sm mb-1.5 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-500" />
                  <span>Descrição Geral do Curso</span>
                </h4>
                <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {selectedCourseDetails.description || 'Formação profissional com módulos teóricos e práticos, materiais didáticos e certificação reconhecida.'}
                </p>
              </div>

              {/* Informações Estruturais */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Duração</span>
                  <div className="font-bold text-sm mt-0.5">{selectedCourseDetails.duration || '6 Meses'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Carga Horária</span>
                  <div className="font-bold text-sm mt-0.5">{selectedCourseDetails.workloadHours || 360} horas</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Modalidade</span>
                  <div className="font-bold text-sm mt-0.5">{selectedCourseDetails.modality || 'Presencial'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Mensalidade</span>
                  <div className="font-bold text-sm mt-0.5 text-emerald-600 dark:text-emerald-400">
                    {selectedCourseDetails.monthlyFee || selectedCourseDetails.feeMonthly 
                      ? `${(selectedCourseDetails.monthlyFee || selectedCourseDetails.feeMonthly || 0).toLocaleString()} MT`
                      : 'Consultar'}
                  </div>
                </div>
              </div>

              {/* Requisitos */}
              {selectedCourseDetails.requirements && selectedCourseDetails.requirements.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm mb-2">Requisitos de Ingresso:</h4>
                  <ul className="space-y-1.5">
                    {selectedCourseDetails.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certificação */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              }`}>
                <Award className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Certificação Oficial Acreditada:</div>
                  <div className="text-xs font-medium mt-0.5">{selectedCourseDetails.certificate || 'Certificado de Formação Profissional Acreditado pelo SIVEC'}</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => setSelectedCourseDetails(null)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                  isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => {
                  const courseName = selectedCourseDetails.name;
                  setSelectedCourseDetails(null);
                  if (onOpenOnlineRegistration) {
                    onOpenOnlineRegistration(courseName);
                  } else {
                    navigate('inscricao_publica');
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Inscrever-se neste Curso</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`py-8 border-t text-xs ${
        isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-800/80 bg-slate-950 text-slate-400'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
            <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>SIGAR PRO</span>
            <span className="text-slate-400">|</span>
            <span>Moztechwave Tecnologia</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenHelp} className={`transition-colors cursor-pointer ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              Ajuda
            </button>
            <button onClick={onOpenPublicVerify} className={`transition-colors cursor-pointer ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              Verificação
            </button>
            <button onClick={onOpenRegisterInstitution} className={`transition-colors cursor-pointer ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              Registar Instituição
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
