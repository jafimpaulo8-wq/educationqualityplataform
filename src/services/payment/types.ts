/**
 * Camada de Arquitetura de Provedores de Pagamento (Módulo 31 - E-Mola e M-Pesa)
 * Preparada para transição transparente entre Verificação Manual e API Oficial Futura.
 * 
 * DIRETRIZ FUNDAMENTAL:
 * Nunca fingir integração automática quando não existir.
 * Em modo MANUAL, o sistema processa por código de transação e comprovativo.
 * Em modo OFFICIAL_API, requer credenciais de produção homologadas junto à operadora/banco.
 */

export type PaymentProviderType = 'MPESA' | 'EMOLA' | 'BANK' | 'CARD' | 'OUTROS';

export type IntegrationMode = 'MANUAL' | 'OFFICIAL_API';

export type ApiEnvironment = 'NOT_CONFIGURED' | 'SANDBOX' | 'PRODUCTION';

export type PaymentCapability = 
  | 'MANUAL_VERIFICATION'        // Conferência por código de transação e comprovativo
  | 'C2B_PUSH_STK'               // Solicitação de PIN ao telemóvel do cliente (Customer-to-Business)
  | 'B2C_DISBURSEMENT'           // Reembolso / Pagamento a funcionários (Business-to-Customer)
  | 'TRANSACTION_STATUS_QUERY'   // Consulta direta de transação em tempo real via API
  | 'WEBHOOK_LISTENER'           // Recebimento de notificações assíncronas (Callback IPN)
  | 'QR_CODE_DYNAMIC'            // Geração de QR Code EMVCo / M-Pesa QR
  | 'BANK_REFERENCE_SIMO'        // Geração de Entidade e Referência Ponto24 / SIMO
  | 'POS_INTEGRATION';           // Integração com terminal físico de pagamento

export interface ProviderManualSettings {
  accountOrNumber: string;        // Número Vodacom / Movitel / NIB bancário
  beneficiaryName: string;        // Titular da conta / Nome da instituição
  ussdInstructions: string;      // Passo a passo de envio via USSD (*150# ou *898#)
  referencePrefix: string;       // Prefixo de referência (ex: SIVERC-)
  minAmount: number;             // Valor mínimo permitido
  maxAmount: number;             // Valor máximo permitido
  transactionCodeRegex: string;  // Padrão de validação do código (ex: M-Pesa: 10 alfanuméricos)
  transactionCodeExample: string;// Exemplo legível para o aluno
  feeNotice?: string;            // Aviso sobre taxas cobradas pela operadora
}

export interface ProviderApiSettings {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  publicKeyOrCert: string;
  shortCodeOrMerchant: string;   // Service Provider Code / Shortcode do M-Pesa ou e-Mola
  initiatorIdentifier: string;   // Utilizador iniciador da API
  securityCredential: string;    // Credencial criptografada
  webhookUrl: string;            // Endpoint HTTPS do SIVERC para receber callbacks
  webhookSecret: string;         // Chave para validação de assinatura HMAC
  ipWhitelist: string[];         // IPs autorizados
  timeoutMs: number;             // Timeout da requisição (padrão 15000ms)
}

export interface OfficialRequirementsChecklist {
  companyContractRequired: boolean;
  companyContractStatus: 'PENDENTE' | 'ASSINADO' | 'NAO_APLICAVEL';
  x509CertificateRequired: boolean;
  x509CertificateStatus: 'PENDENTE' | 'INSTALADO' | 'NAO_APLICAVEL';
  fixedIpRequired: boolean;
  fixedIpStatus: 'PENDENTE' | 'CONFIGURADO' | 'NAO_APLICAVEL';
  webhookDomainRequired: boolean;
  webhookDomainStatus: 'PENDENTE' | 'ATIVO' | 'NAO_APLICAVEL';
  operatorPortalUrl: string;
  specificationDocName: string;
}

export interface ProviderConfig {
  providerType: PaymentProviderType;
  name: string;
  shortName: string;
  brandColor: string;
  accentColor: string;
  isEnabled: boolean;
  activeMode: IntegrationMode;
  apiEnvironment: ApiEnvironment;
  manualSettings: ProviderManualSettings;
  apiSettings: ProviderApiSettings;
  requirements: OfficialRequirementsChecklist;
  lastUpdated: string;
}

export interface PaymentInitiationRequest {
  orderId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  serviceCategory: string;
  serviceDescription: string;
  amount: number;
  currency: 'MZN';
  customerEnteredPhone?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitiationResult {
  success: boolean;
  providerType: PaymentProviderType;
  modeUsed: IntegrationMode;
  orderId: string;
  referenceCode: string;
  instructions: string;
  requiresManualProof: boolean;
  status: 'PENDING_MANUAL_PROOF' | 'PENDING_CUSTOMER_PIN' | 'PROCESSED' | 'FAILED';
  
  // Regra de Integridade e Transparência:
  honestDisclaimer: string;
  
  // Informações de API (quando em modo API Oficial)
  apiDetails?: {
    endpointCalled: string;
    environment: ApiEnvironment;
    conversationId?: string;
    responseCode?: string;
    responseDescription?: string;
    isSimulatedSandbox: boolean;
    rawPayload?: any;
  };
  errorMessage?: string;
}

export interface TransactionVerificationRequest {
  transactionCode: string;
  amount: number;
  providerType: PaymentProviderType;
  senderPhone?: string;
  date?: string;
}

export interface TransactionVerificationResult {
  verified: boolean;
  verifiedVia: 'MANUAL_TREASURY_OFFICER' | 'OFFICIAL_API_QUERY' | 'UNVERIFIED';
  status: 'FOUND_MATCH' | 'NOT_FOUND' | 'API_NOT_CONFIGURED' | 'MANUAL_MODE_ACTIVE' | 'ERROR';
  details: string;
  honestNotice: string;
  timestamp: string;
  apiDetails?: {
    endpoint: string;
    rawResponse?: any;
    isSimulated: boolean;
  };
}

export interface WebhookEventPayload {
  provider: PaymentProviderType;
  event: string;
  transactionId: string;
  reference: string;
  amount: number;
  customerMsisdn: string;
  rawBody: any;
  signature?: string;
}
