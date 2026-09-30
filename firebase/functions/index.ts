/**
 * Firebase Cloud Functions (SIGAR / MozTechWave Architecture)
 * 
 * Scheduled triggers, payment webhooks, certificate hashing, and SIVEC synchronization.
 */

export interface CloudFunctionDefinition {
  name: string;
  type: 'https.onRequest' | 'firestore.onWrite' | 'pubsub.schedule';
  description: string;
}

export const functionsManifest: CloudFunctionDefinition[] = [
  {
    name: 'generateStudentCredentialHash',
    type: 'firestore.onWrite',
    description: 'Calcula SHA-256 e QR Code de verificação ao emitir certificado ou carteira de estudante.'
  },
  {
    name: 'mpesaWebhookHandler',
    type: 'https.onRequest',
    description: 'Processa pagamentos de propinas via M-Pesa / E-Mola e atualiza faturas no Firestore.'
  },
  {
    name: 'syncWithSIVECGovernmentBus',
    type: 'pubsub.schedule',
    description: 'Sincroniza notas, turmas e certificações com o barramento governamental SIVEC / ANEP.'
  },
  {
    name: 'dailyAttendanceAndDropoutAudit',
    type: 'pubsub.schedule',
    description: 'Rotina noturna que calcula assiduidade e sinaliza alunos em risco de evasão para intervenção pedagógica.'
  }
];
