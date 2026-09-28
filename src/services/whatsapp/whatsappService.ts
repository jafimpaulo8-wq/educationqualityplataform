/**
 * Modular WhatsApp Notification & Chatbot Service
 */

export interface WhatsAppMessagePayload {
  toPhone: string;
  templateName?: string;
  parameters?: Record<string, string>;
  messageText?: string;
  institutionId: string;
}

export class WhatsAppService {
  private static instance: WhatsAppService;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  public async sendMessage(payload: WhatsAppMessagePayload): Promise<{ success: boolean; messageId: string }> {
    return {
      success: true,
      messageId: 'wamid.HBgLMjU4' + Math.random().toString(36).substring(2, 10)
    };
  }
}

export const whatsappService = WhatsAppService.getInstance();
