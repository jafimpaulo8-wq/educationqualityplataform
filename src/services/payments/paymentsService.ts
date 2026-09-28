/**
 * Modular Payments Service (M-Pesa, e-Mola, Bancos Moçambique)
 */

export interface PaymentInitiateRequest {
  studentId: string;
  studentName: string;
  amount: number;
  phone: string;
  method: 'mpesa' | 'emola' | 'bank_transfer' | 'cash';
  feeDescription: string;
  institutionId: string;
  branchId?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  referenceNumber: string;
  message: string;
}

export class PaymentsService {
  private static instance: PaymentsService;

  private constructor() {}

  public static getInstance(): PaymentsService {
    if (!PaymentsService.instance) {
      PaymentsService.instance = new PaymentsService();
    }
    return PaymentsService.instance;
  }

  public async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const txId = 'TX-' + req.method.toUpperCase() + '-' + Date.now();
    return {
      success: true,
      transactionId: txId,
      status: 'PENDING',
      referenceNumber: 'REF-' + Math.floor(100000 + Math.random() * 900000),
      message: `Solicitação de pagamento via ${req.method.toUpperCase()} para ${req.phone} enviada com sucesso.`
    };
  }
}

export const paymentsService = PaymentsService.getInstance();
