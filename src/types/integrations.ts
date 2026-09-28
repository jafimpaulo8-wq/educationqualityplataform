// Types for Module 64: Future Integrations Architecture

export type IntegrationCategory = 
  | 'mpesa'
  | 'emola'
  | 'bancos'
  | 'whatsapp'
  | 'email'
  | 'sms'
  | 'google'
  | 'microsoft'
  | 'sistemas_externos'
  | 'sivec_api';

export type IntegrationStatus = 'connected' | 'disconnected' | 'sandbox' | 'testing' | 'error';

export interface BaseIntegrationConfig {
  id: string;
  category: IntegrationCategory;
  name: string;
  description: string;
  status: IntegrationStatus;
  environment: 'sandbox' | 'production';
  enabled: boolean;
  lastTestedAt?: string;
  lastSyncAt?: string;
  lastError?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  notes?: string;
}

// 1. M-Pesa (Vodacom Moçambique)
export interface MPesaIntegrationConfig extends BaseIntegrationConfig {
  category: 'mpesa';
  shortCode: string;
  consumerKey: string;
  consumerSecret: string;
  apiKey: string;
  initiatorIdentifier?: string;
  securityCredential?: string;
  publicKeyCert?: string;
  c2bEnabled: boolean;
  b2cEnabled: boolean;
  autoReconciliation: boolean;
  callbackTimeoutMs: number;
}

// 2. e-Mola (Movitel Moçambique)
export interface EMolaIntegrationConfig extends BaseIntegrationConfig {
  category: 'emola';
  merchantId: string;
  serviceId: string;
  apiKey: string;
  encryptionKey: string;
  endpointUrl: string;
  ipnCallbackUrl: string;
  autoReconciliation: boolean;
}

// 3. Bancos Moçambicanos (BIM, Standard Bank, BCI, Moza, Absa)
export interface BankIntegrationConfig extends BaseIntegrationConfig {
  category: 'bancos';
  supportedBanks: ('millennium_bim' | 'standard_bank' | 'bci' | 'moza_banco' | 'absa')[];
  connectionMethod: 'open_banking_api' | 'sftp_host_to_host' | 'mt940_parser' | 'webhook';
  sftpHost?: string;
  sftpUsername?: string;
  sftpPort?: number;
  apiClientId?: string;
  apiClientSecret?: string;
  certificateFingerprint?: string;
  autoStatementSync: boolean;
  syncCadenceMinutes: number;
  camt053Supported: boolean;
}

// 4. WhatsApp Gateway
export interface WhatsAppIntegrationConfig extends BaseIntegrationConfig {
  category: 'whatsapp';
  provider: 'evolution_api' | 'meta_cloud_api' | 'baileys_gateway' | 'zenvia';
  instanceName: string;
  apiUrl: string;
  apiKey: string;
  qrCodeStatus: 'connected' | 'disconnected' | 'pairing_required';
  autoNotifyEnrollment: boolean;
  autoNotifyPaymentDue: boolean;
  autoNotifyReceipt: boolean;
  autoNotifyCertificate: boolean;
}

// 5. Email (SMTP / Transacional)
export interface EmailIntegrationConfig extends BaseIntegrationConfig {
  category: 'email';
  provider: 'smtp' | 'sendgrid' | 'postmark' | 'ses' | 'resend';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  dkimVerified: boolean;
  spfVerified: boolean;
}

// 6. SMS Gateway (Moçambique)
export interface SmsIntegrationConfig extends BaseIntegrationConfig {
  category: 'sms';
  provider: 'bulk_sms_mz' | 'twilio' | 'infobip' | 'vodacom_sms_gateway';
  senderId: string; // e.g. "CFTPM", "MOZTECH"
  apiKey: string;
  accountSid?: string;
  availableCredits: number;
  pricePerSmsMzn: number;
  deliveryReceiptsEnabled: boolean;
}

// 7. Google Workspace
export interface GoogleIntegrationConfig extends BaseIntegrationConfig {
  category: 'google';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  googleClassroomEnabled: boolean;
  googleMeetEnabled: boolean;
  googleDriveBackupEnabled: boolean;
  googleSsoEnabled: boolean;
  hostedDomain?: string; // e.g. "cftpm.ac.mz"
}

// 8. Microsoft 365 / Azure AD
export interface MicrosoftIntegrationConfig extends BaseIntegrationConfig {
  category: 'microsoft';
  tenantId: string;
  clientId: string;
  clientSecret: string;
  teamsClassesEnabled: boolean;
  oneDriveSyncEnabled: boolean;
  azureAdSsoEnabled: boolean;
}

// 9. Sistemas Académicos Externos (SIGAR, SoftGenial, Moodle, LTI)
export interface ExternalAcademicSystemsConfig extends BaseIntegrationConfig {
  category: 'sistemas_externos';
  systemType: 'sigar' | 'softgenial' | 'moodle' | 'canvas' | 'lti_1_3' | 'custom_rest';
  apiEndpoint: string;
  apiKey: string;
  syncStudents: boolean;
  syncGrades: boolean;
  syncAttendance: boolean;
  bidirectionalSync: boolean;
  lastSyncResult?: {
    recordsSynced: number;
    errorsCount: number;
    timestamp: string;
  };
}

// 10. SIVEC API (Sistema Nacional de Verificação de Certificados DINET / ANEP)
export interface SivecApiConfig extends BaseIntegrationConfig {
  category: 'sivec_api';
  apiEndpoint: string;
  nationalCenterCode: string;
  digitalCertificateThumbprint: string;
  apiKey: string;
  autoHomologateOnIssue: boolean;
  instantQrVerification: boolean;
  strictBiometricValidation: boolean;
  governmentEndpointStatus: 'online' | 'degraded' | 'offline';
  verifiedCertificatesCount: number;
}

export type AnyIntegrationConfig = 
  | MPesaIntegrationConfig
  | EMolaIntegrationConfig
  | BankIntegrationConfig
  | WhatsAppIntegrationConfig
  | EmailIntegrationConfig
  | SmsIntegrationConfig
  | GoogleIntegrationConfig
  | MicrosoftIntegrationConfig
  | ExternalAcademicSystemsConfig
  | SivecApiConfig;

export interface IntegrationLog {
  id: string;
  category: IntegrationCategory;
  timestamp: string;
  action: string;
  status: 'success' | 'warning' | 'error' | 'info';
  statusCode?: number;
  payloadSummary: string;
  latencyMs: number;
  ipAddress?: string;
}

export interface InstitutionIntegrationsMap {
  institutionId: string;
  updatedAt: string;
  configs: {
    mpesa: MPesaIntegrationConfig;
    emola: EMolaIntegrationConfig;
    bancos: BankIntegrationConfig;
    whatsapp: WhatsAppIntegrationConfig;
    email: EmailIntegrationConfig;
    sms: SmsIntegrationConfig;
    google: GoogleIntegrationConfig;
    microsoft: MicrosoftIntegrationConfig;
    sistemas_externos: ExternalAcademicSystemsConfig;
    sivec_api: SivecApiConfig;
  };
}
