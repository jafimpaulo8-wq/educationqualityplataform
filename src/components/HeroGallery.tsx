import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  CheckCircle2, 
  Play, 
  Pause,
  Repeat,
  FileBadge2
} from 'lucide-react';
import { GALLERY_SLIDES } from '../data/mockData';

interface HeroGalleryProps {
  onStartRegistration: () => void;
  onViewCertificates: () => void;
  onOpenPayments: () => void;
}

export const HeroGallery: React.FC<HeroGalleryProps> = ({
  onStartRegistration,
  onViewCertificates,
  onOpenPayments
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [photoEffectMode, setPhotoEffectMode] = useState<'fade' | 'slide' | 'zoom'>('slide');

  // Interactive student spotlight photos switcher ("mudar as fotos daqui para aqui")
  const [studentPhotoIndex, setStudentPhotoIndex] = useState(0);
  const studentPhotos = [
    {
      name: 'Benedito Cossa',
      role: 'Engenheiro de Software Graduado',
      company: 'Contratado na Vodacom Moçambique',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      badge: 'Alunado Nota 18',
      course: 'Engenharia de Software'
    },
    {
      name: 'Yolanda Mondlane',
      role: 'Analista de Segurança & Redes',
      company: 'Especialista em Banco Comercial',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
      badge: 'Certificada Cisco & SIVERC',
      course: 'Cibersegurança'
    },
    {
      name: 'Arnaldo Mabunda',
      role: 'Consultor Contábil & Fiscal',
      company: 'Auditor Tributário Independente',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
      badge: 'Alunado Nota 19',
      course: 'Contabilidade Informatizada'
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % GALLERY_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + GALLERY_SLIDES.length) % GALLERY_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % GALLERY_SLIDES.length);
  };

  const currentSlide = GALLERY_SLIDES[currentSlideIndex];
  const activeStudent = studentPhotos[studentPhotoIndex];

  return (
    <section id="inicio" className="relative overflow-hidden pt-6 pb-16 lg:py-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Announcement Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-semibold text-sky-400 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>PORTAL SIGAR • INSCRIÇÕES ABERTAS 2026/2027</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400">Vagas Limitadas por Turma</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sistema Homologado Moztechwave com Validação SIVERC</span>
          </div>
        </div>

        {/* Hero Grid: Left Content, Right Dynamic Photo Transition Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headlines & Portal Directives */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Portal Integrado de{' '}
                <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Inscrições &amp; Gestão Acadêmica
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                O mais avançado sistema de matrículas, emissão de certificados digitais autenticados e pagamentos integrados em Moçambique. Desenvolvido para a <strong className="text-white">Moztechwave</strong> com suporte oficial <strong className="text-sky-400">SIVERC Integrados</strong>.
              </p>
            </div>

            {/* Key Value Points */}
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="flex items-center gap-2.5 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Inscrição 100% Online &amp; Rápida</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>M-Pesa &amp; E-Mola em Tempo Real</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Certificado com QR Code SIVERC</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Portaria Digital com Cartão Virtual</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-enroll-btn"
                onClick={onStartRegistration}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>Preencher Inscrição Online</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-certificates-btn"
                onClick={onViewCertificates}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-700/80 hover:border-sky-500/50 font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-md"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Ver Modelo de Certificado</span>
              </button>

              <button
                id="hero-payments-btn"
                onClick={onOpenPayments}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
              >
                <span>Pagamento via M-Pesa / E-Mola &rarr;</span>
              </button>
            </div>

            {/* Interactive Student Spotlight Photo Switcher ("efeitos de mudar as fotos daqui para aqui") */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  Galeria de Graduados em Destaque
                </span>
                <span className="text-[11px] text-slate-500">Clique para alternar perfil</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <img 
                      src={activeStudent.photo} 
                      alt={activeStudent.name}
                      className="w-13 h-13 rounded-full object-cover border-2 border-sky-500/60 shadow-md transition-all duration-500 transform hover:scale-105"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {activeStudent.name}
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                        {activeStudent.badge}
                      </span>
                    </h4>
                    <p className="text-xs text-sky-400">{activeStudent.role}</p>
                    <p className="text-[11px] text-slate-400">{activeStudent.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {studentPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setStudentPhotoIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        studentPhotoIndex === idx
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={`Ver foto do graduado ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setStudentPhotoIndex((prev) => (prev + 1) % studentPhotos.length)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
                    title="Mudar para próxima foto"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Stage with Dynamic Photo Changing Transitions */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl group">
              {/* Photo Display Viewport */}
              <div className="relative h-[380px] sm:h-[430px] w-full overflow-hidden bg-slate-950">
                {GALLERY_SLIDES.map((slide, index) => {
                  const isActive = index === currentSlideIndex;
                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                        isActive
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-105 pointer-events-none z-0'
                      }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center transform transition-transform duration-7000 ease-out scale-105"
                      />
                      {/* Gradient overlay for text legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    </div>
                  );
                })}

                {/* Floating Top Badges */}
                <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-sky-400 border border-sky-500/30 backdrop-blur-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    {currentSlide.tag}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                      {currentSlide.stats}
                    </span>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={isPlaying ? 'Pausar troca automática' : 'Ativar troca automática'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Left/Right Carousel Nav Arrows */}
                <button
                  id="prev-slide-btn"
                  onClick={handlePrevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700/60 shadow-lg backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  id="next-slide-btn"
                  onClick={handleNextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700/60 shadow-lg backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Bottom Slide Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/85 backdrop-blur-md p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                        {currentSlide.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 mt-0.5">
                        {currentSlide.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 text-xs font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded">
                      0{currentSlideIndex + 1} / 0{GALLERY_SLIDES.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thumbnails Row: Direct photo switcher ("mudar as fotos daqui para aqui") */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-4 gap-2">
                {GALLERY_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => {
                      setCurrentSlideIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      currentSlideIndex === idx
                        ? 'border-sky-400 shadow-md shadow-sky-500/30 scale-95'
                        : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                    }`}
                  >
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 px-1 rounded text-[9px] font-mono bg-black/80 text-white font-bold">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>

              {/* Bottom Quick Control Bar */}
              <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <FileBadge2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Moztechwave Campus Virtual • SIVERC</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px]">Transição:</span>
                  {(['slide', 'fade', 'zoom'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPhotoEffectMode(mode)}
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold cursor-pointer ${
                        photoEffectMode === mode
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Stats Bar Below Hero */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="p-3 text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">+12.500</span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Certificados Emitidos &amp; Reconhecidos</p>
          </div>
          <div className="p-3 text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">94,2%</span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Taxa de Empregabilidade dos Cursos</p>
          </div>
          <div className="p-3 text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono tracking-tight">100% Instantâneo</span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Validação de Pagamentos M-Pesa &amp; E-Mola</p>
          </div>
          <div className="p-3 text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">SIVERC v4.8</span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Homologação de Registro Acadêmico</p>
          </div>
        </div>
      </div>
    </section>
  );
};
