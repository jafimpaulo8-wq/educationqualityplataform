import {
  PaymentProviderType,
  IntegrationMode,
  PaymentCapability,
  ProviderConfig,
  PaymentInitiationRequest,
  PaymentInitiationResult,
  TransactionVerificationRequest,
  TransactionVerificationResult
} from './types';

export interface IPaymentProvider {
  readonly id: PaymentProviderType;
  readonly name: string;
  readonly shortName: string;
  
  getConfig(): ProviderConfig;
  updateConfig(updates: Partial<ProviderConfig>): void;
  getMode(): IntegrationMode;
  setMode(mode: IntegrationMode): void;
  
  getCapabilities(): PaymentCapability[];
  isApiConfigured(): boolean;
  getHonestStatus(): {
    title: string;
    subtitle: string;
    badgeText: string;
    badgeStyle: string;
    isRealApi: boolean;
    operationalNote: string;
  };

  initiatePayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
  verifyTransaction(req: TransactionVerificationRequest): Promise<TransactionVerificationResult>;
  testApiConnection(): Promise<{
    connected: boolean;
    latencyMs: number;
    message: string;
    httpStatus?: number;
    endpointTested?: string;
    errorDetails?: string;
  }>;
}

export abstract class BasePaymentProvider implements IPaymentProvider {
  abstract readonly id: PaymentProviderType;
  abstract readonly name: string;
  abstract readonly shortName: string;

  protected config: ProviderConfig;

  constructor(initialConfig: ProviderConfig) {
    this.config = initialConfig;
  }

  public getConfig(): ProviderConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<ProviderConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
  }

  public getMode(): IntegrationMode {
    return this.config.activeMode;
  }

  public setMode(mode: IntegrationMode): void {
    this.config.activeMode = mode;
    this.config.lastUpdated = new Date().toISOString();
  }

  public abstract getCapabilities(): PaymentCapability[];

  public isApiConfigured(): boolean {
    const api = this.config.apiSettings;
    return Boolean(
      api.baseUrl &&
      api.apiKey &&
      api.shortCodeOrMerchant &&
      this.config.apiEnvironment !== 'NOT_CONFIGURED'
    );
  }

  /**
   * Fornece um diagnóstico sincero e sem ambiguidades sobre o estado da integração.
   * Regra central: NUNCA fingir integração automática quando não existir.
   */
  public getHonestStatus(): {
    title: string;
    subtitle: string;
    badgeText: string;
    badgeStyle: string;
    isRealApi: boolean;
    operationalNote: string;
  } {
    if (!this.config.isEnabled) {
      return {
        title: 'Canal Desativado',
        subtitle: 'Este meio de pagamento está temporariamente suspenso pela administração.',
        badgeText: 'DESATIVADO',
        badgeStyle: 'bg-slate-800 text-slate-400 border-slate-700',
        isRealApi: false,
        operationalNote: 'Não disponível para seleção pelos formandos.'
      };
    }

    if (this.config.activeMode === 'MANUAL') {
      return {
        title: 'Modo Manual Ativo (Padrão Operacional)',
        subtitle: 'Processamento por envio manual de telemóvel e confirmação de código pela tesouraria.',
        badgeText: 'MANUAL / CÓDIGO',
        badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        isRealApi: false,
        operationalNote: 'Nenhum débito automático é disparado. O formando transfere via menu e informa o código de transação.'
      };
    }

    if (this.config.activeMode === 'OFFICIAL_API') {
      if (!this.isApiConfigured()) {
        return {
          title: 'API Oficial Incompleta',
          subtitle: 'Modo API selecionado, mas faltam credenciais homologadas junto à operadora/banco.',
          badgeText: 'CONFIGURAÇÃO PENDENTE',
          badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          isRealApi: false,
          operationalNote: 'O sistema reverterá com segurança para verificação manual até que as credenciais oficiais sejam inseridas.'
        };
      }

      if (this.config.apiEnvironment === 'SANDBOX') {
        return {
          title: 'Ambiente de Testes / Sandbox Oficial',
          subtitle: 'Conectado aos endpoints de homologação técnica. Não movimenta dinheiro real.',
          badgeText: 'SANDBOX OFICIAL',
          badgeStyle: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          isRealApi: true,
          operationalNote: 'Simulador de chamadas OpenAPI para validação de fluxos e webhooks.'
        };
      }

      return {
        title: 'API Oficial de Produção Conectada',
        subtitle: 'Integrado diretamente com a infraestrutura da operadora / rede bancária.',
        badgeText: 'PRODUÇÃO ATIVA',
        badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        isRealApi: true,
        operationalNote: 'Transações auditadas com chamadas diretas C2B, consulta em tempo real e webhooks assinados.'
      };
    }

    return {
      title: 'Estado Indefinido',
      subtitle: 'Verifique a configuração do provedor.',
      badgeText: 'DESCONHECIDO',
      badgeStyle: 'bg-slate-700 text-slate-300 border-slate-600',
      isRealApi: false,
      operationalNote: 'Consulte o administrador técnico do SIVERC.'
    };
  }

  public abstract initiatePayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
  public abstract verifyTransaction(req: TransactionVerificationRequest): Promise<TransactionVerificationResult>;
  public abstract testApiConnection(): Promise<{
    connected: boolean;
    latencyMs: number;
    message: string;
    httpStatus?: number;
    endpointTested?: string;
    errorDetails?: string;
  }>;
}
