import React, { useState, useMemo } from 'react';
import { 
  X, 
  Palette, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Sparkles,
  Sliders,
  Eye,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  ThemePreset, 
  UserThemePreference, 
  PRESET_THEMES, 
  QUICK_BG_PALETTE, 
  QUICK_ACCENT_PALETTE, 
  calculateCustomTheme,
  isValidHex,
  getContrastRatio,
  isLightColor,
  FIXED_STATE_COLORS
} from '../../theme/themeConfig';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: ThemePreset;
  currentBg?: string;
  currentAccent?: string;
  onSave: (pref: UserThemePreference) => Promise<void> | void;
  onResetDefault: () => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  currentBg = '#090D16',
  currentAccent = '#3B82F6',
  onSave,
  onResetDefault
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset>(currentPreset);
  const [customBg, setCustomBg] = useState<string>(currentBg);
  const [customAccent, setCustomAccent] = useState<string>(currentAccent);
  const [isSaving, setIsSaving] = useState(false);

  // Calcula o tema em tempo real para a pré-visualização ao vivo
  const calculatedCustom = useMemo(() => {
    return calculateCustomTheme(customBg, customAccent);
  }, [customBg, customAccent]);

  // Variáveis ativas na pré-visualização de acordo com o preset selecionado
  const previewVariables = useMemo(() => {
    if (selectedPreset === 'personalizado') {
      return calculatedCustom.variables;
    }
    return PRESET_THEMES[selectedPreset] || PRESET_THEMES.escuro;
  }, [selectedPreset, calculatedCustom]);

  // Relatório de contraste da pré-visualização
  const previewContrast = useMemo(() => {
    const bg = previewVariables.bg;
    const card = previewVariables.card;
    const text = previewVariables.text;
    const accent = previewVariables.accent;
    const accentText = previewVariables.accentText;

    const textOnBgRatio = getContrastRatio(text, bg);
    const textOnCardRatio = getContrastRatio(text, card);
    const accentTextRatio = getContrastRatio(accentText, accent);

    const isAccessible = textOnBgRatio >= 4.5 && accentTextRatio >= 4.5;

    return {
      textOnBgRatio,
      textOnCardRatio,
      accentTextRatio,
      isAccessible,
      warningMessage: calculatedCustom.contrastReport.warningMessage
    };
  }, [previewVariables, calculatedCustom]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pref: UserThemePreference = {
        theme: selectedPreset,
        background: selectedPreset === 'personalizado' ? calculatedCustom.variables.bg : undefined,
        accent: selectedPreset === 'personalizado' ? calculatedCustom.variables.accent : undefined,
        updatedAt: new Date().toISOString()
      };
      await onSave(pref);
      onClose();
    } catch (e) {
      console.error('Erro ao guardar preferências de tema:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    onResetDefault();
    setSelectedPreset('escuro');
    setCustomBg('#090D16');
    setCustomAccent('#3B82F6');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700/80 bg-[#0F172A] text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Aparência & Preferências de Cor
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  SIGAR PRO
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Personalize o ambiente visual com guarda de contraste WCAG AA integrada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Seletor de Temas Prontos */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
              1. Selecionar Tema Base
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Claro */}
              <button
                type="button"
                onClick={() => setSelectedPreset('claro')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedPreset === 'claro'
                    ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/30 shadow-md'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    <Sun className="w-4 h-4" />
                  </span>
                  {selectedPreset === 'claro' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <p className="text-xs font-bold text-white">Claro</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Fundo #F4F6FA, texto nítido</p>
                <div className="flex gap-1 mt-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: '#F4F6FA' }} />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#2563EB' }} />
                </div>
              </button>

              {/* Escuro Suave */}
              <button
                type="button"
                onClick={() => setSelectedPreset('escuro-suave')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedPreset === 'escuro-suave'
                    ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/30 shadow-md'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-1.5 rounded-lg bg-slate-800 text-sky-300 border border-slate-700">
                    <Moon className="w-4 h-4" />
                  </span>
                  {selectedPreset === 'escuro-suave' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <p className="text-xs font-bold text-white">Escuro suave</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Fundo #1E293B, ardósia</p>
                <div className="flex gap-1 mt-2.5">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#1E293B' }} />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#273449' }} />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                </div>
              </button>

              {/* Escuro (Atual) */}
              <button
                type="button"
                onClick={() => setSelectedPreset('escuro')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedPreset === 'escuro'
                    ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/30 shadow-md'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-1.5 rounded-lg bg-slate-950 text-indigo-300 border border-slate-800">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  {selectedPreset === 'escuro' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <p className="text-xs font-bold text-white">Escuro (Padrão)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Fundo #090D16, profundo</p>
                <div className="flex gap-1 mt-2.5">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#090D16' }} />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#0F172A' }} />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                </div>
              </button>

              {/* Personalizado */}
              <button
                type="button"
                onClick={() => setSelectedPreset('personalizado')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedPreset === 'personalizado'
                    ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/30 shadow-md'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-1.5 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800">
                    <Sliders className="w-4 h-4" />
                  </span>
                  {selectedPreset === 'personalizado' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <p className="text-xs font-bold text-white">Personalizado</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Fundo & Botões à escolha</p>
                <div className="flex gap-1 mt-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600" style={{ backgroundColor: customBg }} />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: customAccent }} />
                </div>
              </button>
            </div>
          </div>

          {/* Secção de Ajuste Fino quando "Personalizado" está selecionado */}
          {selectedPreset === 'personalizado' && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Configuração de Cores Personalizadas
                </span>
                <span className="text-[11px] text-slate-400">
                  Cartões, bordas e textos calculados matematicamente
                </span>
              </div>

              {/* Cor de Fundo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Cor de Fundo Principal</span>
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">{customBg}</span>
                </div>
                
                <div className="flex items-center gap-3 mb-2.5">
                  <input
                    type="color"
                    value={isValidHex(customBg) ? customBg : '#090D16'}
                    onChange={(e) => setCustomBg(e.target.value.toUpperCase())}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                    title="Seletor de Cor de Fundo"
                  />
                  <input
                    type="text"
                    value={customBg}
                    maxLength={7}
                    onChange={(e) => setCustomBg(e.target.value.toUpperCase())}
                    placeholder="#090D16"
                    className="w-28 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-hidden focus:border-blue-500 uppercase"
                  />
                  <span className="text-[11px] text-slate-400">
                    Luminância calculada: {isLightColor(customBg) ? 'Clara (modo claro automático)' : 'Escura (modo escuro automático)'}
                  </span>
                </div>

                {/* Paleta Rápida Fundo */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 mr-1">Paleta Rápida:</span>
                  {QUICK_BG_PALETTE.map((item) => (
                    <button
                      key={item.hex}
                      type="button"
                      onClick={() => setCustomBg(item.hex)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                        customBg.toUpperCase() === item.hex.toUpperCase()
                          ? 'border-blue-500 bg-blue-950/60 text-blue-200'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                      title={item.label}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-600" style={{ backgroundColor: item.hex }} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor dos Botões / Acentos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Cor de Destaque & Botões</span>
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">{customAccent}</span>
                </div>

                <div className="flex items-center gap-3 mb-2.5">
                  <input
                    type="color"
                    value={isValidHex(customAccent) ? customAccent : '#3B82F6'}
                    onChange={(e) => setCustomAccent(e.target.value.toUpperCase())}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                    title="Seletor de Cor dos Botões"
                  />
                  <input
                    type="text"
                    value={customAccent}
                    maxLength={7}
                    onChange={(e) => setCustomAccent(e.target.value.toUpperCase())}
                    placeholder="#3B82F6"
                    className="w-28 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-hidden focus:border-blue-500 uppercase"
                  />
                  <span className="text-[11px] text-slate-400">
                    Texto do botão automático: <strong className="font-mono text-white">{calculatedCustom.variables.accentText}</strong>
                  </span>
                </div>

                {/* Paleta Rápida Destaque */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 mr-1">Paleta Rápida:</span>
                  {QUICK_ACCENT_PALETTE.map((item) => (
                    <button
                      key={item.hex}
                      type="button"
                      onClick={() => setCustomAccent(item.hex)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                        customAccent.toUpperCase() === item.hex.toUpperCase()
                          ? 'border-blue-500 bg-blue-950/60 text-blue-200'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                      title={item.label}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.hex }} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensagem da Guarda de Contraste */}
              {calculatedCustom.contrastReport.warningMessage && (
                <div className="p-3 rounded-lg bg-blue-950/50 border border-blue-800/80 flex items-start gap-2.5 text-xs text-blue-200">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {calculatedCustom.contrastReport.warningMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pré-visualização ao Vivo com Guarda de Contraste */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                2. Pré-Visualização ao Vivo & Guarda de Contraste WCAG AA
              </label>

              {/* Selo de Contraste */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                {previewContrast.isAccessible ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    WCAG AA Aprovado ({previewContrast.textOnBgRatio}:1)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Contraste Insuficiente ({previewContrast.textOnBgRatio}:1)
                  </span>
                )}
              </div>
            </div>

            {/* Content Container Simulating Live Dashboard View */}
            <div 
              className="p-5 rounded-2xl border transition-all duration-200 shadow-inner space-y-4"
              style={{
                backgroundColor: previewVariables.bg,
                borderColor: previewVariables.border,
                color: previewVariables.text
              }}
            >
              {/* Header preview */}
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: previewVariables.border }}>
                <div>
                  <h4 className="text-sm font-bold tracking-tight" style={{ color: previewVariables.text }}>
                    Portal SIGAR PRO — Pré-Visualização
                  </h4>
                  <p className="text-xs" style={{ color: previewVariables.textMuted }}>
                    Exibição fiel dos cartões, textos, botões e estados fixos
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-opacity hover:opacity-90 flex items-center gap-1.5"
                  style={{
                    backgroundColor: previewVariables.accent,
                    color: previewVariables.accentText
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Botão de Ação Primária
                </button>
              </div>

              {/* Card preview */}
              <div 
                className="p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: previewVariables.card,
                  borderColor: previewVariables.border
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: previewVariables.text }}>
                    Cartão Informativo de Gestão
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm" style={{ backgroundColor: previewVariables.bg, color: previewVariables.textMuted }}>
                    Cartão #{selectedPreset}
                  </span>
                </div>
                
                <p className="text-xs leading-relaxed" style={{ color: previewVariables.text }}>
                  Este bloco simula a densidade visual e o contraste real aplicado sobre o painel de Utilizadores, 
                  Secretaria e Módulos Financeiros.
                </p>

                {/* Cores de Estado Fixas (Requisito 5) */}
                <div className="pt-2 border-t flex flex-wrap items-center gap-2" style={{ borderColor: previewVariables.border }}>
                  <span className="text-[10px] font-bold uppercase" style={{ color: previewVariables.textMuted }}>
                    Estados Fixos:
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: FIXED_STATE_COLORS.success }}
                  >
                    Sucesso (Concluído)
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: FIXED_STATE_COLORS.error }}
                  >
                    Erro (Crítico)
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: FIXED_STATE_COLORS.warning }}
                  >
                    Aviso (Pendente)
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: FIXED_STATE_COLORS.info }}
                  >
                    Informativo
                  </span>
                </div>
              </div>

              {/* Ratios Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                <div className="p-2 rounded-lg border" style={{ backgroundColor: previewVariables.card, borderColor: previewVariables.border }}>
                  <span className="block" style={{ color: previewVariables.textMuted }}>Texto / Fundo</span>
                  <strong className="text-xs font-mono font-bold" style={{ color: previewVariables.text }}>
                    {previewContrast.textOnBgRatio}:1 {previewContrast.textOnBgRatio >= 4.5 ? '✓' : '⚠️'}
                  </strong>
                </div>
                <div className="p-2 rounded-lg border" style={{ backgroundColor: previewVariables.card, borderColor: previewVariables.border }}>
                  <span className="block" style={{ color: previewVariables.textMuted }}>Texto / Cartão</span>
                  <strong className="text-xs font-mono font-bold" style={{ color: previewVariables.text }}>
                    {previewContrast.textOnCardRatio}:1 {previewContrast.textOnCardRatio >= 4.5 ? '✓' : '⚠️'}
                  </strong>
                </div>
                <div className="p-2 rounded-lg border" style={{ backgroundColor: previewVariables.card, borderColor: previewVariables.border }}>
                  <span className="block" style={{ color: previewVariables.textMuted }}>Texto / Botão</span>
                  <strong className="text-xs font-mono font-bold" style={{ color: previewVariables.text }}>
                    {previewContrast.accentTextRatio}:1 {previewContrast.accentTextRatio >= 4.5 ? '✓' : '⚠️'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0B1120]">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Repor tema padrão do sistema"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Repor Padrão
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || (!previewContrast.isAccessible && selectedPreset === 'personalizado')}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                previewContrast.isAccessible || selectedPreset !== 'personalizado'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'A guardar...' : 'Aplicar e Guardar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
