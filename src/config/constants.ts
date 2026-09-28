/**
 * National & System Constants (Moçambique)
 */

export const MOZAMBIQUE_PROVINCES = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Niassa',
  'Cabo Delgado'
] as const;

export const DEFAULT_CURRENCY = {
  code: 'MZN',
  symbol: 'MT',
  name: 'Metical Moçambicano'
} as const;

export const SYSTEM_DEFAULTS = {
  minPassGrade: 10,
  maxGrade: 20,
  excellenceGrade: 16,
  standardSessionTimeoutMinutes: 60
} as const;
