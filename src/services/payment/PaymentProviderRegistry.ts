import { IPaymentProvider } from './PaymentProvider';
import {
  MpesaPaymentProvider,
  EmolaPaymentProvider,
  BankPaymentProvider,
  CardPaymentProvider,
  OutrosPaymentProvider
} from './providers';
import {
  PaymentProviderType,
  ProviderConfig,
  PaymentInitiationRequest,
  PaymentInitiationResult,
  TransactionVerificationRequest,
  TransactionVerificationResult
} from './types';

const STORAGE_KEY = 'siverc_payment_providers_configs_v1';

export class PaymentProviderRegistry {
  private static instance: PaymentProviderRegistry;
  private providers: Map<PaymentProviderType, IPaymentProvider> = new Map();

  private constructor() {
    this.initializeProviders();
  }

  public static getInstance(): PaymentProviderRegistry {
    if (!PaymentProviderRegistry.instance) {
      PaymentProviderRegistry.instance = new PaymentProviderRegistry();
    }
    return PaymentProviderRegistry.instance;
  }

  private loadSavedConfigs(): Record<string, Partial<ProviderConfig>> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Falha ao carregar configurações de provedores de pagamento:', e);
    }
    return {};
  }

  private saveConfigs(): void {
    try {
      const configs: Record<string, ProviderConfig> = {};
      this.providers.forEach((provider, key) => {
        configs[key] = provider.getConfig();
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    } catch (e) {
      console.error('Falha ao gravar configurações de provedores de pagamento:', e);
    }
  }

  private initializeProviders(): void {
    const saved = this.loadSavedConfigs();

    const mpesa = new MpesaPaymentProvider(saved['MPESA']);
    const emola = new EmolaPaymentProvider(saved['EMOLA']);
    const bank = new BankPaymentProvider(saved['BANK']);
    const card = new CardPaymentProvider(saved['CARD']);
    const outros = new OutrosPaymentProvider(saved['OUTROS']);

    this.providers.set('MPESA', mpesa);
    this.providers.set('EMOLA', emola);
    this.providers.set('BANK', bank);
    this.providers.set('CARD', card);
    this.providers.set('OUTROS', outros);
  }

  public getProvider(type: PaymentProviderType): IPaymentProvider | undefined {
    return this.providers.get(type);
  }

  public getAllProviders(): IPaymentProvider[] {
    return Array.from(this.providers.values());
  }

  public getEnabledProviders(): IPaymentProvider[] {
    return this.getAllProviders().filter(p => p.getConfig().isEnabled);
  }

  public updateProviderConfig(type: PaymentProviderType, updates: Partial<ProviderConfig>): void {
    const provider = this.providers.get(type);
    if (provider) {
      provider.updateConfig(updates);
      this.saveConfigs();
    }
  }

  public async initiatePayment(
    type: PaymentProviderType,
    req: PaymentInitiationRequest
  ): Promise<PaymentInitiationResult> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provedor de pagamento ${type} não encontrado.`);
    }
    return provider.initiatePayment(req);
  }

  public async verifyTransaction(
    type: PaymentProviderType,
    req: TransactionVerificationRequest
  ): Promise<TransactionVerificationResult> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provedor de pagamento ${type} não encontrado.`);
    }
    return provider.verifyTransaction(req);
  }

  public async testProviderApi(type: PaymentProviderType) {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provedor de pagamento ${type} não encontrado.`);
    }
    return provider.testApiConnection();
  }

  public resetToFactoryDefaults(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.providers.clear();
    this.initializeProviders();
  }
}

export const paymentRegistry = PaymentProviderRegistry.getInstance();
