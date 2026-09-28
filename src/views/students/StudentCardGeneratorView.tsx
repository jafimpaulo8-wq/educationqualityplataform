import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PermissionGate } from '../../components/PermissionGate';
import { 
  CreditCard, 
  Printer, 
  QrCode, 
  Upload, 
  Eye, 
  EyeOff, 
  Sliders, 
  Layers, 
  Download, 
  CheckCircle, 
  ShieldCheck, 
  Clock, 
  User, 
  Building, 
  Phone, 
  Calendar, 
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Check,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { Student } from '../../types';

export const StudentCardGeneratorView: React.FC = () => {
  const { 
    students, 
    classes, 
    activeInstitution, 
    addNotification,
    updateStudent
  } = useApp();

  // Mode: Visualizar / Editar Cartão Individual vs Impressão em Lote Folha A4
  const [viewMode, setViewMode] = useState<'individual' | 'folha_a4'>('individual');

  // Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('todas');

  // Configuração da Folha A4
  // "8 cartões por página", "10 cartões por página", configuração editável
  const [cardsPerPage, setCardsPerPage] = useState<8 | 10 | 6 | 12>(8);
  const [printSide, setPrintSide] = useState<'ambos' | 'frente' | 'verso'>('ambos');
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);

  // Customização Visual do Cartão
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');
  const [cardBackgroundUrl, setCardBackgroundUrl] = useState<string>('');
  const [isBackgroundVisible, setIsBackgroundVisible] = useState<boolean>(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(15); // 0-100%
  const [cardThemeColor, setCardThemeColor] = useState<'emerald' | 'navy' | 'dark' | 'burgundy'>('emerald');
  
  // Status do Cartão do Aluno:
  // "ID card waiting" (espera de carta / emissão temporária) vs "ID card for operation" (cartão operacional liberado)
  const [cardOperationalState, setCardOperationalState] = useState<'ID card waiting' | 'ID card for operation'>('ID card for operation');

  // Informações do Verso / Centro HSST
  const [hsstCenterName, setHsstCenterName] = useState<string>('Centro de Formação & Segurança Ocupacional HSST');
  const [hsstEmergencyContact, setHsstEmergencyContact] = useState<string>('+258 84 990 0110 / +258 82 000 1928');
  const [cardValidityDate, setCardValidityDate] = useState<string>('31/12/2026');
  const [customInstructions, setCustomInstructions] = useState<string>(
    '1. Este cartão é pessoal e intransmissível.\n2. Obrigatório o porte diário e apresentação nos torniquetes da portaria.\n3. Em caso de extravio, comunicar imediatamente à Secretaria Central.'
  );

  // Aluno Selecionado
  const currentStudent: Student | undefined = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Alunos Filtrados para Lote A4
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = filterClass === 'todas' || s.classGroupId === filterClass;
      const q = searchStudent.toLowerCase();
      const matchSearch = !searchStudent ||
        s.fullName.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.courseName.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [students, filterClass, searchStudent]);

  // Upload de Imagem do Logotipo do Instituto
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogoUrl(event.target?.result as string);
        addNotification({
          title: 'Logotipo Carregado',
          message: 'Imagem do logotipo da instituição atualizada no cartão.',
          type: 'system'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload de Fundo / Marca d\'água
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCardBackgroundUrl(event.target?.result as string);
        setIsBackgroundVisible(true);
        addNotification({
          title: 'Fundo do Cartão Carregado',
          message: 'Imagem de fundo aplicada ao crachá.',
          type: 'system'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload da Foto do Formando
  const handleStudentPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentStudent) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = event.target?.result as string;
        updateStudent(currentStudent.id, {
          photoUrl: newPhoto
        });
        addNotification({
          title: 'Foto Atualizada',
          message: `Foto de perfil de ${currentStudent.fullName} atualizada com sucesso.`,
          type: 'system'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Theme styling mapping
  const themeClasses = {
    emerald: {
      headerBg: 'bg-gradient-to-r from-emerald-800 to-teal-900',
      accentColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      border: 'border-emerald-600'
    },
    navy: {
      headerBg: 'bg-gradient-to-r from-blue-900 to-indigo-950',
      accentColor: 'text-blue-700',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      border: 'border-blue-600'
    },
    dark: {
      headerBg: 'bg-gradient-to-r from-slate-900 to-zinc-950',
      accentColor: 'text-slate-800',
      badgeBg: 'bg-slate-200 text-slate-900 border-slate-400',
      border: 'border-slate-800'
    },
    burgundy: {
      headerBg: 'bg-gradient-to-r from-rose-900 to-red-950',
      accentColor: 'text-rose-700',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      border: 'border-rose-600'
    }
  }[cardThemeColor];

  // SVG da Bandeira de Moçambique oficial para o Cartão
  const MozambiqueFlagMini = () => (
    <div className="w-8 h-5.5 rounded overflow-hidden shadow-xs border border-black/20 flex flex-col relative shrink-0">
      <div className="h-1/3 bg-[#008000]" />
      <div className="h-1/3 bg-[#000000] border-y border-white" />
      <div className="h-1/3 bg-[#FCE100]" />
      <div 
        className="absolute left-0 top-0 bottom-0 w-3 bg-[#E31B23]" 
        style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
      />
    </div>
  );

  return (
    <PermissionGate permission="alunos.view">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">26. Carteirinha do Aluno</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Frente & Verso Oficial
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Emissão padrão Bilhete de Identidade com Bandeira de Moçambique, SIVERC, QR Code e impressão múltipla em folha A4.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('individual')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'individual' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Visualizar & Personalizar
              </button>
              <button
                onClick={() => setViewMode('folha_a4')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'folha_a4' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Impressão em Folha A4 ({cardsPerPage}/Pág)
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-emerald-950/40"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>

        {/* MODO 1: INDIVIDUAL (CUSTOMIZAÇÃO & VISUALIZAÇÃO FRENTE E VERSO) */}
        {viewMode === 'individual' && currentStudent && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls Column (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Seletor de Aluno */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Selecionar Formando
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.fullName} ({s.classGroupName || 'Sem turma'})
                    </option>
                  ))}
                </select>

                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Estado do Cartão (Controlo de Emissão)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCardOperationalState('ID card waiting')}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                        cardOperationalState === 'ID card waiting'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      ID card waiting
                      <span className="block text-[9px] font-normal text-slate-500">Emissão / Espera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardOperationalState('ID card for operation')}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                        cardOperationalState === 'ID card for operation'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      ID card for operation
                      <span className="block text-[9px] font-normal text-slate-500">Pronto p/ Portaria</span>
                    </button>
                  </div>
                </div>

                {/* Upload Foto do Aluno */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Upload Foto do Aluno (Foto de Máquina)
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full p-2.5 bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-700 rounded-xl cursor-pointer text-xs text-slate-300 transition-colors">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Carregar Foto de Perfil</span>
                    <input type="file" accept="image/*" onChange={handleStudentPhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Upload Logotipo & Fundo / Marca d'água */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Personalização Gráfica do Crachá
                </h3>

                {/* Logotipo */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Logotipo do Instituto</label>
                  <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer text-xs text-slate-300 hover:border-slate-700">
                    <span className="truncate">{customLogoUrl ? 'Logotipo Personalizado' : 'Usar Logotipo Institucional Padrão'}</span>
                    <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>

                {/* Imagem de Fundo / Marca d'água */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400">Imagem de Fundo / Marca d'Água</label>
                    <button
                      type="button"
                      onClick={() => setIsBackgroundVisible(!isBackgroundVisible)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      {isBackgroundVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {isBackgroundVisible ? 'Visível' : 'Invisível'}
                    </button>
                  </div>
                  
                  <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer text-xs text-slate-300 hover:border-slate-700">
                    <span className="truncate">{cardBackgroundUrl ? 'Imagem Carregada' : 'Upload Imagem de Fundo (Ex: Máquinas/Prédio)'}</span>
                    <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
                    <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
                  </label>

                  {/* Opacidade do Fundo */}
                  {isBackgroundVisible && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Opacidade do Fundo</span>
                        <span className="font-mono">{backgroundOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={backgroundOpacity}
                        onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* Paleta de Cores */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Cor do Cabeçalho / Tema</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'emerald', label: 'Verde', color: 'bg-emerald-600' },
                      { id: 'navy', label: 'Azul', color: 'bg-blue-700' },
                      { id: 'dark', label: 'Preto', color: 'bg-slate-900' },
                      { id: 'burgundy', label: 'Bordô', color: 'bg-rose-800' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setCardThemeColor(t.id as any)}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          cardThemeColor === t.id
                            ? 'border-emerald-400 bg-slate-800 text-white shadow'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${t.color}`} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Informações do Verso / HSST */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Informações do Centro HSST (Verso)
                  </label>
                  <input
                    type="text"
                    value={hsstCenterName}
                    onChange={(e) => setHsstCenterName(e.target.value)}
                    placeholder="Nome do Centro HSST"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={hsstEmergencyContact}
                    onChange={(e) => setHsstEmergencyContact(e.target.value)}
                    placeholder="Contactos de Emergência HSST"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    value={cardValidityDate}
                    onChange={(e) => setCardValidityDate(e.target.value)}
                    placeholder="Validade (Ex: 31/12/2026)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>

              </div>

            </div>

            {/* Right Card Preview Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Pré-visualização em Escala Real (Padrão BI Moçambique 85.6mm x 54mm)
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  SIVERC Cert: SIV-{currentStudent.code.slice(-6)}
                </span>
              </div>

              {/* Grid Frente e Verso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ========================================================
                    FRENTE DO CARTÃO (Conforme requisitos oficiais):
                    - foto
                    - nome
                    - número
                    - curso
                    - turma
                    - instituição
                    - QR
                    - bandeira de Moçambique
                    - logotipo com verificação SIVERC
                    - badge ID card waiting / operation
                   ======================================================== */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>FRENTE DO CARTÃO</span>
                    <span className="text-emerald-400 font-mono">ANVERSO</span>
                  </div>

                  <div 
                    className="w-full aspect-[85.6/54] rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-xl relative overflow-hidden flex flex-col justify-between p-3 select-none"
                    style={{ minHeight: '230px' }}
                  >
                    {/* Imagem de Fundo Personalizada / Marca d'água */}
                    {isBackgroundVisible && (cardBackgroundUrl || true) && (
                      <div 
                        className="absolute inset-0 pointer-events-none bg-cover bg-center transition-opacity"
                        style={{
                          backgroundImage: cardBackgroundUrl 
                            ? `url(${cardBackgroundUrl})` 
                            : `radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)`,
                          opacity: backgroundOpacity / 100
                        }}
                      />
                    )}

                    {/* Cabeçalho do Cartão: Bandeira de Moçambique, Nome da Instituição e Logotipo */}
                    <div className="relative z-10 flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <div className="flex items-center gap-2">
                        <MozambiqueFlagMini />
                        <div className="leading-tight">
                          <div className="font-black text-slate-900 text-[11px] uppercase tracking-tight line-clamp-1">
                            {activeInstitution.name}
                          </div>
                          <div className="text-[8px] text-slate-500 font-medium">
                            REPÚBLICA DE MOÇAMBIQUE • MINEDH / ANEP
                          </div>
                        </div>
                      </div>

                      {/* Logotipo / Selo SIVERC */}
                      <div className="flex items-center gap-1">
                        {customLogoUrl ? (
                          <img src={customLogoUrl} alt="Logo" className="h-6 w-auto object-contain" />
                        ) : activeInstitution.logoUrl ? (
                          <img src={activeInstitution.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
                        ) : (
                          <div className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[9px] font-bold">
                            {activeInstitution.code || 'MTW'}
                          </div>
                        )}
                        <span className="text-[7px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded border border-emerald-300">
                          SIVERC
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo Principal: Foto, Dados do Aluno e QR Code */}
                    <div className="relative z-10 flex items-center gap-3 my-auto py-1">
                      {/* Foto */}
                      <div className="relative shrink-0">
                        <img
                          src={currentStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                          alt={currentStudent.fullName}
                          className="w-16 h-20 rounded-lg object-cover border-2 border-slate-300 shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5">
                          <CheckCircle className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Informações Obrigatórias: Nome, Número, Curso, Turma */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="font-black text-slate-950 text-xs leading-tight line-clamp-1">
                          {currentStudent.fullName}
                        </div>

                        <div className="text-[9px] text-slate-500 font-semibold line-clamp-1">
                          <span className="text-slate-400 uppercase text-[8px]">Curso:</span> {currentStudent.courseName}
                        </div>

                        <div className="text-[9px] text-slate-700">
                          <span className="text-slate-400 uppercase text-[8px]">Turma:</span>{' '}
                          <span className="font-semibold">{currentStudent.classGroupName || 'Geral'}</span>
                        </div>

                        <div className="text-[9px] text-slate-900 font-mono font-bold">
                          <span className="text-slate-400 font-normal uppercase text-[8px]">N.º Matrícula:</span>{' '}
                          {currentStudent.code}
                        </div>

                        {/* Badge de Estado: ID card waiting ou ID card for operation */}
                        <div className="pt-0.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                            cardOperationalState === 'ID card for operation'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            <ShieldCheck className="w-2.5 h-2.5" />
                            {cardOperationalState}
                          </span>
                        </div>
                      </div>

                      {/* QR Code de Leitura Rápida */}
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center shadow-xs">
                          <QrCode className="w-12 h-12 text-slate-950" />
                        </div>
                        <span className="text-[7px] font-mono text-slate-400 mt-0.5">SCAN PORTARIA</span>
                      </div>
                    </div>

                    {/* Rodapé do Cartão */}
                    <div className="relative z-10 border-t border-slate-200 pt-1 flex items-center justify-between text-[8px] text-slate-600">
                      <div>
                        <span>BI / Doc: </span>
                        <strong className="font-mono text-slate-900">{currentStudent.documentNumber || '1101928374M'}</strong>
                      </div>
                      <div className="font-bold text-emerald-700 uppercase tracking-wider">
                        VÁLIDO EM TERRITÓRIO NACIONAL
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    VERSO DO CARTÃO (Conforme requisitos oficiais):
                    - contactos
                    - validade
                    - instruções
                    - QR
                    - informações do centro HSST
                    - verificação SIVERC
                   ======================================================== */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>VERSO DO CARTÃO</span>
                    <span className="text-cyan-400 font-mono">REVERSO</span>
                  </div>

                  <div 
                    className="w-full aspect-[85.6/54] rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-xl relative overflow-hidden flex flex-col justify-between p-3 select-none"
                    style={{ minHeight: '230px' }}
                  >
                    {/* Marca d'água de fundo */}
                    {isBackgroundVisible && (
                      <div 
                        className="absolute inset-0 pointer-events-none bg-cover bg-center"
                        style={{
                          backgroundImage: cardBackgroundUrl ? `url(${cardBackgroundUrl})` : undefined,
                          opacity: (backgroundOpacity / 100) * 0.5
                        }}
                      />
                    )}

                    {/* Cabeçalho do Verso: Centro HSST & Instruções */}
                    <div className="relative z-10 border-b border-slate-200 pb-1 flex justify-between items-start">
                      <div>
                        <div className="font-black text-slate-950 text-[10px] uppercase leading-tight">
                          {hsstCenterName}
                        </div>
                        <div className="text-[7.5px] text-slate-500">
                          Higiene, Saúde e Segurança no Trabalho • Normas Técnicas
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[7px] font-bold uppercase bg-slate-100 text-slate-700 px-1 py-0.5 rounded border border-slate-200 font-mono">
                          VALIDADE: {cardValidityDate}
                        </span>
                      </div>
                    </div>

                    {/* Corpo Central: Instruções Oficiais & Contactos */}
                    <div className="relative z-10 my-auto py-1 grid grid-cols-12 gap-2 text-[8px] leading-tight">
                      <div className="col-span-8 space-y-1 text-slate-700">
                        <div className="font-bold text-slate-900 text-[8.5px] uppercase">
                          Instruções & Termos de Uso:
                        </div>
                        <p className="text-[7.5px] text-slate-600 whitespace-pre-line leading-relaxed">
                          {customInstructions}
                        </p>
                        
                        <div className="pt-1 border-t border-slate-200 text-[7.5px]">
                          <span className="font-bold text-slate-900">Linha SOS / HSST: </span>
                          <span className="font-mono text-slate-700">{hsstEmergencyContact}</span>
                        </div>
                      </div>

                      {/* QR de Validação Pública SIVERC no Verso */}
                      <div className="col-span-4 flex flex-col items-center justify-center border-l border-slate-200 pl-2">
                        <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center shadow-xs">
                          <QrCode className="w-12 h-12 text-slate-950" />
                        </div>
                        <span className="text-[6.5px] font-mono font-bold text-slate-500 mt-0.5 text-center">
                          AUTENTICAÇÃO SIVERC
                        </span>
                      </div>
                    </div>

                    {/* Rodapé do Verso: Contactos Institucionais & Assinatura */}
                    <div className="relative z-10 border-t border-slate-200 pt-1 flex items-center justify-between text-[7.5px] text-slate-600">
                      <div>
                        <span>Endereço: {activeInstitution.address} • Tel: {activeInstitution.phone}</span>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-800">
                        SIVEC-ID-{currentStudent.id.slice(-6).toUpperCase()}
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Botões de Ação */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Pronto para emissão gráfica. Suporta corte em guilhotina e laminação PVC/plástica.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('folha_a4')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Gerar Folha A4 em Lote
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir Este Cartão
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* MODO 2: IMPRESSÃO EM FOLHA A4 (8 OU 10 CARTÕES POR PÁGINA COM CONFIGURAÇÃO EDITÁVEL) */}
        {viewMode === 'folha_a4' && (
          <div className="space-y-6">
            
            {/* Barra de Configurações da Folha A4 */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Seletor de Quantidade por Página: 8 ou 10 cartões por página */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 px-2 font-semibold">Cartões por Folha A4:</span>
                  <button
                    onClick={() => setCardsPerPage(8)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cardsPerPage === 8 ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    8 por página (2x4)
                  </button>
                  <button
                    onClick={() => setCardsPerPage(10)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cardsPerPage === 10 ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    10 por página (2x5)
                  </button>
                  <button
                    onClick={() => setCardsPerPage(6)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cardsPerPage === 6 ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    6 (2x3)
                  </button>
                  <button
                    onClick={() => setCardsPerPage(12)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cardsPerPage === 12 ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    12 (3x4)
                  </button>
                </div>

                {/* Filtro por Turma */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-white">
                  <span className="text-slate-400">Turma:</span>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="todas" className="bg-slate-900">Todas as Turmas ({students.length})</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Seletor de Face: Ambos / Frente / Verso */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setPrintSide('ambos')}
                    className={`px-2.5 py-1 rounded-lg font-medium ${printSide === 'ambos' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    Frente & Verso Lado a Lado
                  </button>
                  <button
                    onClick={() => setPrintSide('frente')}
                    className={`px-2.5 py-1 rounded-lg font-medium ${printSide === 'frente' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    Apenas Frente
                  </button>
                  <button
                    onClick={() => setPrintSide('verso')}
                    className={`px-2.5 py-1 rounded-lg font-medium ${printSide === 'verso' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    Apenas Verso
                  </button>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCropMarks(!showCropMarks)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    showCropMarks ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {showCropMarks ? 'Linhas de Corte Ativas' : 'Sem Linhas de Corte'}
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Folha A4 ({filteredStudents.length} Cartões)
                </button>
              </div>

            </div>

            {/* Container da Folha A4 para Impressão */}
            <div className="bg-slate-100 p-6 rounded-2xl border border-slate-300 overflow-x-auto text-slate-900 shadow-inner">
              <div className="text-center pb-4 text-xs text-slate-500 font-semibold font-mono">
                PÁGINA A4 DE IMPRESSÃO • GRADE DE {cardsPerPage} CARTÕES POR FOLHA • {filteredStudents.length} ALUNOS SELECIONADOS
              </div>

              {/* Grid A4 Responsivo */}
              <div className={`grid gap-4 mx-auto max-w-[1000px] ${
                cardsPerPage === 12 
                  ? 'grid-cols-1 md:grid-cols-3' 
                  : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {filteredStudents.map((student) => (
                  <div 
                    key={student.id} 
                    className={`bg-white rounded-xl border-2 ${showCropMarks ? 'border-dashed border-slate-400' : 'border-slate-300'} p-3 shadow-sm relative overflow-hidden flex flex-col justify-between`}
                    style={{ minHeight: '210px' }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <MozambiqueFlagMini />
                        <div className="leading-tight">
                          <div className="font-bold text-slate-900 text-[10px] uppercase line-clamp-1">
                            {activeInstitution.name}
                          </div>
                          <div className="text-[7.5px] text-slate-500">CARTEIRA DISCENTE OFICIAL</div>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {cardOperationalState}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                        alt={student.fullName}
                        className="w-14 h-18 rounded object-cover border border-slate-300 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-0.5 text-[8.5px]">
                        <div className="font-black text-slate-900 text-[10px] leading-tight line-clamp-1">
                          {student.fullName}
                        </div>
                        <div className="text-slate-600 line-clamp-1">
                          <span className="text-slate-400">Curso:</span> {student.courseName}
                        </div>
                        <div className="text-slate-600">
                          <span className="text-slate-400">Turma:</span> {student.classGroupName || 'Geral'}
                        </div>
                        <div className="font-mono font-bold text-slate-900">
                          <span className="text-slate-400 font-normal">N.º:</span> {student.code}
                        </div>
                      </div>

                      <div className="shrink-0 text-center">
                        <div className="w-12 h-12 bg-white p-0.5 border border-slate-200 rounded flex items-center justify-center">
                          <QrCode className="w-10 h-10 text-slate-900" />
                        </div>
                        <span className="text-[6.5px] font-mono text-slate-400 block mt-0.5">SIVERC</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 pt-1 mt-2 flex items-center justify-between text-[7.5px] text-slate-500">
                      <span>Doc: {student.documentNumber || '1101928374M'}</span>
                      <span className="text-emerald-700 font-bold uppercase">Válido em Território Nacional</span>
                    </div>

                    {/* Crop marks corner indicators */}
                    {showCropMarks && (
                      <>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-600 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-600 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-600 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-600 pointer-events-none" />
                      </>
                    )}
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>
    </PermissionGate>
  );
};
