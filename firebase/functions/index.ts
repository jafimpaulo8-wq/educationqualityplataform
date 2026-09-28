/**
 * Firebase Cloud Functions (SIGAR / MozTechWave Architecture)
 * 
 * Scheduled triggers, payment webhooks, certificate hashing, and SIVEC synchronization.
 */

export interface CloudFunctionTrigger {
  name: string;
  type: 'https.onRequest' | 'firestore.onDocumentCreated' | 'pubsub.schedule';
  description: string;
}

export const CLOUD_FUNCTIONS_REGISTRY: CloudFunctionTrigger[] = [
  {
    name: 'onStudentEnrolled',
    type: 'firestore.onDocumentCreated',
    description: 'Dispara geração automática de código SIGAR, credencial digital e notificação WhatsApp de boas-vindas.'
  },
  {
    name: 'onMpesaCallbackWebhook',
    type: 'https.onRequest',
    description: 'Recebe callbacks da API Vodacom M-Pesa Moçambique, valida assinatura HMAC e liquida propinas instantaneamente.'
  },
  {
    name: 'onEmolaCallbackWebhook',
    type: 'https.onRequest',
    description: 'Processa confirmações de pagamento via e-Mola (Movitel) em tempo real.'
  },
  {
    name: 'onCertificateIssued',
    type: 'firestore.onDocumentCreated',
    description: 'Gera selo criptográfico SHA-256 e agenda submissão ao barramento governamental SIVEC / ANEP.'
  },
  {
    name: 'dailyAttendanceAndDropoutAudit',
    type: 'pubsub.schedule',
    description: 'Rotina noturna que calcula assiduidade e sinaliza alunos em risco de evasão para intervenção pedagógica.'
  }
];
