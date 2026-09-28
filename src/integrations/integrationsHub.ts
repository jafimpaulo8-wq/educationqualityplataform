/**
 * Integrations Hub Layer
 * 
 * Unifies all 10 official connectors:
 * 1. M-Pesa (Vodacom Moçambique)
 * 2. e-Mola (Movitel Moçambique)
 * 3. Bancos Nacionais (BIM, BCI, Standard Bank, Moza, Absa)
 * 4. WhatsApp Cloud / Evolution Gateway
 * 5. SMS Gateway Moçambique (Sender ID)
 * 6. Email Transacional (DKIM/SPF)
 * 7. Google Workspace for Education
 * 8. Microsoft 365 / Azure Entra ID
 * 9. Sistemas Académicos Externos (SIGAR, SoftGenial, Moodle)
 * 10. SIVEC API (DINET / ANEP / MEC)
 */

export * from '../services/integrationsService';
export * from '../types/integrations';
