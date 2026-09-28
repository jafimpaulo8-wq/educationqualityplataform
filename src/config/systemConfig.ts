/**
 * System Configuration & Platform Metadata
 */

export interface SystemConfig {
  version: string;
  name: string;
  codename: string;
  releaseDate: string;
  environment: 'development' | 'production';
  sivecIntegrationEnabled: boolean;
  aiIntegrationEnabled: boolean;
  multiBranchEnabled: boolean;
}

export const SYSTEM_CONFIG: SystemConfig = {
  version: '2.8.0',
  name: 'MozTechWave Education Platform',
  codename: 'SIGAR_MOZ_ENTERPRISE',
  releaseDate: '2026-09-21',
  environment: 'production',
  sivecIntegrationEnabled: true,
  aiIntegrationEnabled: true,
  multiBranchEnabled: true
};
