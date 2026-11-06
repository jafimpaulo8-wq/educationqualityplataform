/**
 * SIGAR PRO — Unified Visual Theme Architecture
 * 
 * Centralizes theme variables, preset themes, customized palette generation,
 * luminance calculations, and WCAG AA contrast guard (4.5:1 minimum).
 */

export type ThemePreset = 'claro' | 'escuro-suave' | 'escuro' | 'personalizado';

export interface UserThemePreference {
  theme: ThemePreset;
  background?: string; // Hex format: ^#[0-9A-Fa-f]{6}$
  accent?: string;     // Hex format: ^#[0-9A-Fa-f]{6}$
  updatedAt?: string;
}

export interface ThemeVariables {
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  // Fixed state colors across all themes (Requisito 5)
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface ContrastReport {
  textOnBgRatio: number;
  textOnCardRatio: number;
  accentTextOnAccentRatio: number;
  isAccessible: boolean;
  autoAdjusted: boolean;
  warningMessage?: string;
}

export interface CalculatedTheme {
  preset: ThemePreset;
  variables: ThemeVariables;
  contrastReport: ContrastReport;
}

// Fixed Status Colors (Requisito 5: idênticas em todos os temas)
export const FIXED_STATE_COLORS = {
  success: '#10B981', // Verde esmeralda (operações concluídas)
  error: '#EF4444',   // Vermelho (erros e situações críticas)
  warning: '#F59E0B', // Âmbar (pendente / atenção)
  info: '#0284C7'     // Azul oceano (informativo)
} as const;

// 1. Temas Prontos Oficiais (Requisito 2)
export const PRESET_THEMES: Record<'claro' | 'escuro-suave' | 'escuro', ThemeVariables> = {
  // Claro: fundo #F4F6FA, cartões #FFFFFF, bordas #D8DFEA, texto #111827, secundário #4B5A70, destaque #2563EB
  claro: {
    bg: '#F4F6FA',
    card: '#FFFFFF',
    border: '#D8DFEA',
    text: '#111827',
    textMuted: '#4B5A70',
    accent: '#2563EB',
    accentHover: '#1D4ED8',
    accentText: '#FFFFFF',
    ...FIXED_STATE_COLORS
  },

  // Escuro suave: fundo #1E293B, cartões #273449, bordas #3B4A63, texto #F1F5F9, secundário #A9B8CF, destaque #3B82F6
  'escuro-suave': {
    bg: '#1E293B',
    card: '#273449',
    border: '#3B4A63',
    text: '#F1F5F9',
    textMuted: '#A9B8CF',
    accent: '#3B82F6',
    accentHover: '#2563EB',
    accentText: '#FFFFFF',
    ...FIXED_STATE_COLORS
  },

  // Escuro (atual): fundo #090D16, cartões #0F172A, bordas #1E293B, texto #F8FAFC, secundário #94A3B8, destaque #3B82F6
  escuro: {
    bg: '#090D16',
    card: '#0F172A',
    border: '#1E293B',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    accent: '#3B82F6',
    accentHover: '#2563EB',
    accentText: '#FFFFFF',
    ...FIXED_STATE_COLORS
  }
};

// Paletas rápidas sugeridas para o tema Personalizado (Requisito 3)
export const QUICK_BG_PALETTE = [
  { label: 'Grafite Noturno', hex: '#0B0F19' },
  { label: 'Azul Profundo', hex: '#0A192F' },
  { label: 'Ardósia Escura', hex: '#182234' },
  { label: 'Cinza Carvão', hex: '#18181B' },
  { label: 'Branco Gelo', hex: '#F8FAFC' },
  { label: 'Cinza Perla', hex: '#F1F5F9' },
  { label: 'Nuvem Suave', hex: '#EFF6FF' },
  { label: 'Menta Claro', hex: '#F0FDF4' }
];

export const QUICK_ACCENT_PALETTE = [
  { label: 'Azul Royal', hex: '#2563EB' },
  { label: 'Azul Tecnológico', hex: '#3B82F6' },
  { label: 'Esmeralda', hex: '#10B981' },
  { label: 'Teal Institucional', hex: '#0D9488' },
  { label: 'Índigo Moderno', hex: '#6366F1' },
  { label: 'Violeta Tecnológico', hex: '#8B5CF6' },
  { label: 'Âmbar Dourado', hex: '#D97706' },
  { label: 'Rubi Corporativo', hex: '#E11D48' }
];

// Utilitários de Cor & Cálculo de Luminância (WCAG 2.1)
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return [0, 0, 0];
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/**
 * Calcula a razão de contraste entre duas cores hexadecimais conforme WCAG 2.1.
 * Retorna valor entre 1 e 21 (mínimo exigido para texto normal: 4.5:1).
 */
export function getContrastRatio(fgHex: string, bgHex: string): number {
  const l1 = getRelativeLuminance(fgHex);
  const l2 = getRelativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function isLightColor(hex: string): boolean {
  return getRelativeLuminance(hex) > 0.40;
}

export function mixColors(hexA: string, hexB: string, weightB: number): string {
  const [rA, gA, bA] = hexToRgb(hexA);
  const [rB, gB, bB] = hexToRgb(hexB);
  const wA = 1 - weightB;
  return rgbToHex(
    rA * wA + rB * weightB,
    gA * wA + gB * weightB,
    bA * wA + bB * weightB
  );
}

/**
 * Requisito 4: Guarda de Contraste
 * Ajusta iterativamente uma cor de texto em direção a preto ou branco
 * até atingir a razão mínima de 4.5:1 contra a cor de fundo.
 */
export function ensureMinContrast(
  preferredFgHex: string, 
  bgHex: string, 
  minRatio = 4.5
): { color: string; adjusted: boolean; ratio: number } {
  let currentFg = preferredFgHex;
  let ratio = getContrastRatio(currentFg, bgHex);
  
  if (ratio >= minRatio) {
    return { color: currentFg, adjusted: false, ratio };
  }

  const bgIsLight = isLightColor(bgHex);
  const targetExtreme = bgIsLight ? '#000000' : '#FFFFFF';
  
  // Interpola em direção ao extremo até atingir o contraste WCAG AA
  for (let step = 0.1; step <= 1.0; step += 0.05) {
    const candidate = mixColors(currentFg, targetExtreme, step);
    const newRatio = getContrastRatio(candidate, bgHex);
    if (newRatio >= minRatio) {
      return { color: candidate, adjusted: true, ratio: newRatio };
    }
  }

  // Fallback seguro absoluto
  const finalRatio = getContrastRatio(targetExtreme, bgHex);
  return { color: targetExtreme, adjusted: true, ratio: finalRatio };
}

/**
 * Requisito 3 & 4: Cálculo do Tema Personalizado a partir da cor de fundo e botões
 */
export function calculateCustomTheme(rawBgHex: string, rawAccentHex: string): CalculatedTheme {
  const bgHex = isValidHex(rawBgHex) ? rawBgHex.toUpperCase() : '#090D16';
  let accentHex = isValidHex(rawAccentHex) ? rawAccentHex.toUpperCase() : '#3B82F6';
  
  const bgIsLight = isLightColor(bgHex);
  let autoAdjusted = false;
  let warningMessage: string | undefined;

  // 1. Determina cor dos botões (accentText) com contraste automático preto ou branco
  const contrastWithWhite = getContrastRatio('#FFFFFF', accentHex);
  const contrastWithBlack = getContrastRatio('#000000', accentHex);
  let accentText = contrastWithWhite >= contrastWithBlack ? '#FFFFFF' : '#000000';
  let accentRatio = Math.max(contrastWithWhite, contrastWithBlack);

  // Se o botão não atingir 4.5:1 com nem preto nem branco (ex: cinzento intermédio), ajusta luminância do botão
  if (accentRatio < 4.5) {
    autoAdjusted = true;
    const accentLum = getRelativeLuminance(accentHex);
    if (accentLum > 0.4) {
      // Escurece o botão para suportar texto branco
      accentHex = mixColors(accentHex, '#000000', 0.28);
      accentText = '#FFFFFF';
    } else {
      // Clareia o botão para suportar texto preto
      accentHex = mixColors(accentHex, '#FFFFFF', 0.35);
      accentText = '#000000';
    }
    accentRatio = getContrastRatio(accentText, accentHex);
    warningMessage = 'Ajustámos automaticamente a cor dos botões para garantir legibilidade WCAG AA (mínimo 4,5:1).';
  }

  // 2. Calcula cartões, bordas, texto e texto secundário a partir do fundo
  let cardHex: string;
  let borderHex: string;
  let defaultTextHex: string;
  let defaultMutedHex: string;

  if (bgIsLight) {
    // Fundo Claro: cartões brancos/luz, bordas cinzentas, texto escuro
    cardHex = mixColors(bgHex, '#FFFFFF', 0.85);
    borderHex = mixColors(bgHex, '#0F172A', 0.16);
    defaultTextHex = '#111827';
    defaultMutedHex = '#4B5A70';
  } else {
    // Fundo Escuro: cartões ligeiramente mais claros, bordas contrastadas, texto claro
    cardHex = mixColors(bgHex, '#FFFFFF', 0.08);
    borderHex = mixColors(bgHex, '#FFFFFF', 0.18);
    defaultTextHex = '#F8FAFC';
    defaultMutedHex = '#94A3B8';
  }

  // 3. Aplica guarda de contraste sobre o texto principal e secundário
  const textOnBg = ensureMinContrast(defaultTextHex, bgHex, 4.5);
  const textOnCard = ensureMinContrast(textOnBg.color, cardHex, 4.5);
  const finalTextColor = textOnCard.color;

  const mutedOnBg = ensureMinContrast(defaultMutedHex, bgHex, 3.2);
  const finalMutedColor = mutedOnBg.color;

  if (textOnBg.adjusted || textOnCard.adjusted) {
    autoAdjusted = true;
    warningMessage = warningMessage || 'O texto foi calibrado automaticamente para garantir contraste acessível de pelo menos 4,5:1.';
  }

  // Cor hover do botão (10% mais escura ou mais clara)
  const accentHover = mixColors(accentHex, bgIsLight ? '#000000' : '#FFFFFF', 0.12);

  const variables: ThemeVariables = {
    bg: bgHex,
    card: cardHex,
    border: borderHex,
    text: finalTextColor,
    textMuted: finalMutedColor,
    accent: accentHex,
    accentHover,
    accentText,
    ...FIXED_STATE_COLORS
  };

  const contrastReport: ContrastReport = {
    textOnBgRatio: getContrastRatio(finalTextColor, bgHex),
    textOnCardRatio: getContrastRatio(finalTextColor, cardHex),
    accentTextOnAccentRatio: accentRatio,
    isAccessible: getContrastRatio(finalTextColor, bgHex) >= 4.5 && accentRatio >= 4.5,
    autoAdjusted,
    warningMessage
  };

  return {
    preset: 'personalizado',
    variables,
    contrastReport
  };
}

/**
 * Aplica as variáveis CSS do tema globalmente no elemento raiz do documento (:root).
 */
export function applyThemeToDom(vars: ThemeVariables, preset: ThemePreset): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const isLight = isLightColor(vars.bg);

  // Injeta variáveis CSS no :root
  root.style.setProperty('--theme-bg', vars.bg);
  root.style.setProperty('--theme-card', vars.card);
  root.style.setProperty('--theme-border', vars.border);
  root.style.setProperty('--theme-text', vars.text);
  root.style.setProperty('--theme-text-muted', vars.textMuted);
  root.style.setProperty('--theme-accent', vars.accent);
  root.style.setProperty('--theme-accent-hover', vars.accentHover);
  root.style.setProperty('--theme-accent-text', vars.accentText);

  // Cores de estado fixas
  root.style.setProperty('--theme-success', vars.success);
  root.style.setProperty('--theme-error', vars.error);
  root.style.setProperty('--theme-warning', vars.warning);
  root.style.setProperty('--theme-info', vars.info);

  // Atributos de dados e classes de suporte
  root.setAttribute('data-theme', preset);
  root.setAttribute('data-theme-light', isLight ? 'true' : 'false');

  if (isLight) {
    root.classList.remove('dark');
    root.classList.add('light');
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  }

  // Estilização direta no body para garantia imediata
  document.body.style.backgroundColor = vars.bg;
  document.body.style.color = vars.text;
}

// Chaves de Armazenamento Local (Requisito 8: Cache local para abrir logo)
export const THEME_CACHE_KEY = 'sigar_theme_preference_v2';

export function getSystemPreferredTheme(): ThemePreset {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro';
  }
  return 'escuro';
}

export function loadCachedThemePreference(): UserThemePreference {
  if (typeof window === 'undefined') {
    return { theme: 'escuro' };
  }
  try {
    const raw = localStorage.getItem(THEME_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (['claro', 'escuro-suave', 'escuro', 'personalizado'].includes(parsed.theme)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar cache do tema:', e);
  }
  return { theme: getSystemPreferredTheme() };
}

export function saveCachedThemePreference(pref: UserThemePreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(pref));
  } catch (e) {
    console.warn('Erro ao salvar cache do tema:', e);
  }
}
