/**
 * Strict Design System Tokens (Anti-Slop & Responsive Architecture)
 * 
 * Enforces:
 * - Minimum 44px touch targets for mobile accessibility
 * - WCAG AA compliant contrast ratios
 * - Non-pure black/white palettes (<5% HSB saturation)
 * - Container outer padding >= inner element padding (min 16px)
 * - Button horizontal padding = 2x vertical padding
 * - Single-line badges and pills with white-space: nowrap
 */

export const DESIGN_TOKENS = {
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
    },
    minBodySize: '16px',
    bodyLineHeight: '1.6',
    maxTextWidth: '70ch'
  },
  touchTarget: {
    minSize: '44px',
    recommendedPadding: '12px 24px'
  },
  radii: {
    button: '12px',
    card: '16px',
    pill: '9999px',
    modal: '20px'
  },
  colors: {
    canvas: {
      dark: '#020617', // slate-950
      darkCard: '#0f172a', // slate-900
      darkCardBorder: '#1e293b' // slate-800
    },
    accent: {
      primary: '#10b981', // emerald-500
      primaryHover: '#059669', // emerald-600
      secondary: '#6366f1', // indigo-500
      danger: '#ef4444', // red-500
      warning: '#f59e0b', // amber-500
      info: '#3b82f6' // blue-500
    }
  },
  spacing: {
    minContainerPadding: '16px',
    standardCardPadding: '24px',
    sectionGap: '32px'
  }
} as const;
