import { 
  IntegrationCategory, 
  AnyIntegrationConfig, 
  IntegrationLog,
  InstitutionIntegrationsMap 
} from '../types/integrations';
import { createDefaultIntegrations, mockIntegrationLogs } from '../data/defaultIntegrations';

export interface TestResult {
  success: boolean;
  message: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
  responsePayload: Record<string, any>;
}

export class IntegrationsService {
  private static STORAGE_KEY_PREFIX = 'mtw_integrations_';
  private static LOGS_STORAGE_KEY = 'mtw_integrations_logs';

  // Get integrations for a specific institution with fallback to defaults
  static getIntegrations(institutionId: string): InstitutionIntegrationsMap {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${institutionId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read integrations from localStorage', e);
    }
    const defaults = createDefaultIntegrations(institutionId);
    this.saveIntegrations(defaults);
    return defaults;
  }

  // Save integrations
  static saveIntegrations(data: InstitutionIntegrationsMap): void {
    try {
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${data.institutionId}`, JSON.stringify(data));
    } catch (e) {
      console.error('Could not save integrations to localStorage', e);
    }
  }

  // Update a single integration configuration
  static updateIntegration(
    institutionId: string, 
    category: IntegrationCategory, 
    updates: Partial<AnyIntegrationConfig>
  ): InstitutionIntegrationsMap {
    const current = this.getIntegrations(institutionId);
    const existing = current.configs[category];
    
    current.configs[category] = {
      ...existing,
      ...updates,
      lastTestedAt: updates.status === 'connected' ? new Date().toISOString() : existing.lastTestedAt
    } as any;

    this.saveIntegrations(current);
    return current;
  }

  // Get logs
  static getLogs(): IntegrationLog[] {
    try {
      const stored = localStorage.getItem(this.LOGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read logs from localStorage', e);
    }
    return mockIntegrationLogs;
  }

  // Add a log entry
  static addLog(log: Omit<IntegrationLog, 'id' | 'timestamp'>): void {
    const logs = this.getLogs();
    const newLog: IntegrationLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep last 50 logs
    const trimmed = logs.slice(0, 50);
    try {
      localStorage.setItem(this.LOGS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Could not write logs to localStorage', e);
    }
  }

  // Test ping & payload simulation for each of the 10 connectors
  static async testConnection(
    category: IntegrationCategory, 
    config: AnyIntegrationConfig
  ): Promise<TestResult> {
    const start = Date.now();
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const latencyMs = Math.round(Date.now() - start);

    let result: TestResult;

    switch (category) {
      case 'mpesa':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Conexão com Gateway Vodacom M-Pesa OpenAPI bem sucedida (Sandbox MZ).',
          responsePayload: {
            output_ResponseCode: 'INS-0',
            output_ResponseDesc: 'Request processed successfully',
            output_TransactionID: `MP_${Date.now().toString().slice(-8)}`,
            output_ConversationID: `CONV_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            environment: config.environment,
            shortCode: (config as any).shortCode || '171717',
            status: 'HEALTHY'
          }
        };
        break;

      case 'emola':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Handshake com API e-Mola Movitel Moçambique validado com sucesso.',
          responsePayload: {
            code: '00',
            message: 'Success',
            merchantId: (config as any).merchantId || 'EMOLA-MERCH-88210',
            serviceId: (config as any).serviceId || 'PROPINA_ONLINE_V2',
            sessionToken: `emola_tk_${Math.random().toString(36).substring(2, 12)}`,
            status: 'ACTIVE'
          }
        };
        break;

      case 'bancos':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Conector Open Banking & SFTP Host-to-Host ativo. Parser MT940 validado.',
          responsePayload: {
            banksSupported: (config as any).supportedBanks || ['millennium_bim', 'standard_bank'],
            connectionMethod: (config as any).connectionMethod,
            mt940_parser: 'READY',
            camt053_iso20022: 'COMPLIANT',
            pingStatus: 'ACK',
            lastBatchId: `BATCH-MZ-BIM-${Date.now()}`
          }
        };
        break;

      case 'whatsapp':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Instância WhatsApp conectada e pronta para disparos automáticos.',
          responsePayload: {
            instance: (config as any).instanceName || 'moztechwave-instance',
            state: 'open',
            battery: 100,
            plugged: true,
            webhookRegistered: true,
            templatesCount: 8
          }
        };
        break;

      case 'email':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Servidor de E-mail verificado. Registros SPF e DKIM validados.',
          responsePayload: {
            provider: (config as any).provider || 'resend',
            fromEmail: (config as any).fromEmail || 'secretaria@cftpm.ac.mz',
            smtpHandshake: '250 OK - Ready to send',
            dkimStatus: 'pass',
            spfStatus: 'pass'
          }
        };
        break;

      case 'sms':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Conexão com Gateway SMS Moçambique estabelecida com saldo disponível.',
          responsePayload: {
            senderId: (config as any).senderId || 'CFTPM',
            availableCredits: (config as any).availableCredits || 1250,
            unitPrice: `${(config as any).pricePerSmsMzn || 1.20} MZN`,
            routesStatus: {
              vodacom_mz: 'ONLINE',
              movitel_mz: 'ONLINE',
              tmcel_mz: 'ONLINE'
            }
          }
        };
        break;

      case 'google':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Google Workspace for Education: Escopos OAuth e APIs validadas.',
          responsePayload: {
            clientId: (config as any).clientId?.substring(0, 16) + '...',
            classroomApi: 'ENABLED',
            meetApi: 'ENABLED',
            driveBackup: 'ENABLED',
            domainRestricted: (config as any).hostedDomain || 'cftpm.ac.mz'
          }
        };
        break;

      case 'microsoft':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Microsoft 365 / Azure Entra ID: Conector de Teams e OneDrive pronto.',
          responsePayload: {
            tenantId: (config as any).tenantId || '4f992a10-3882-4110-8b01',
            graphApiStatus: 'CONNECTED',
            teamsMeetingsGeneration: 'ALLOWED',
            oneDriveSync: 'READY'
          }
        };
        break;

      case 'sistemas_externos':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Interoperabilidade com SIGAR/SoftGenial/Moodle REST API testada com sucesso.',
          responsePayload: {
            systemType: (config as any).systemType || 'sigar',
            apiEndpoint: (config as any).apiEndpoint,
            handshake: 'SUCCESS',
            protocol: 'REST / LTI 1.3 Compatible',
            schemaSyncVersion: '2.4.0-MZ'
          }
        };
        break;

      case 'sivec_api':
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'SIVEC API DINET/ANEP: Canal seguro e chave pública criptográfica homologados.',
          responsePayload: {
            nationalCenterCode: (config as any).nationalCenterCode || 'MZ-DINET-CFTPM-0089',
            governmentRegistryStatus: 'ONLINE',
            certificateThumbprint: (config as any).digitalCertificateThumbprint,
            endpoint: (config as any).apiEndpoint,
            instantVerificationSpeed: '120ms'
          }
        };
        break;

      default:
        result = {
          success: true,
          statusCode: 200,
          latencyMs,
          timestamp: new Date().toISOString(),
          message: 'Teste de integração concluído.',
          responsePayload: { status: 'OK' }
        };
    }

    // Record in log
    this.addLog({
      category,
      action: `Teste de Conectividade (${config.name})`,
      status: result.success ? 'success' : 'error',
      statusCode: result.statusCode,
      payloadSummary: result.message,
      latencyMs: result.latencyMs,
      ipAddress: '127.0.0.1'
    });

    return result;
  }

  // Developer documentation and code snippet helper
  static getTechnicalDocs(category: IntegrationCategory, config: AnyIntegrationConfig) {
    const institutionId = config.id.replace(`${category}-`, '');
    const webhookUrl = config.webhookUrl || `https://portal.moztechwave.co.mz/api/v1/webhooks/${category}/${institutionId}`;

    switch (category) {
      case 'mpesa':
        return {
          title: 'Documentação Técnica: M-Pesa Vodacom Moçambique C2B & B2C',
          webhookUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <ACCESS_TOKEN>',
            'X-Signature': '<HMAC_SHA256_HASH>'
          },
          curlExample: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Signature: sha256_mock_sig" \\
  -d '{
    "output_ResponseCode": "INS-0",
    "output_ResponseDesc": "Request processed successfully",
    "output_TransactionID": "MP260921001",
    "output_ConversationID": "CONV_991823",
    "output_ThirdPartyReference": "PRO-2026-ALU-001",
    "amount": "3500.00",
    "customerMsisdn": "258841234567"
  }'`,
          schema: {
            output_ResponseCode: 'string (e.g. INS-0)',
            output_TransactionID: 'string',
            output_ThirdPartyReference: 'string (Número de referência / matrícula)',
            amount: 'string ou number em MZN',
            customerMsisdn: 'string com DDI 258'
          }
        };

      case 'emola':
        return {
          title: 'Documentação Técnica: e-Mola Movitel Moçambique IPN',
          webhookUrl,
          headers: {
            'Content-Type': 'application/json',
            'X-Movitel-Key': (config as any).apiKey || 'emola_key_xxx'
          },
          curlExample: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "transId": "EM2026090012",
    "merchantId": "${(config as any).merchantId || 'EMOLA-MERCH-88210'}",
    "serviceId": "${(config as any).serviceId || 'PROPINA_ONLINE'}",
    "amount": 2500,
    "fee": 0,
    "currency": "MZN",
    "reference": "MAT-2026-089",
    "status": "SUCCESS",
    "msisdn": "258861234567"
  }'`,
          schema: {
            transId: 'string',
            merchantId: 'string',
            reference: 'string (código do aluno)',
            amount: 'number',
            status: 'SUCCESS | FAILED'
          }
        };

      case 'bancos':
        return {
          title: 'Documentação Técnica: Conector Bancário (MT940 / ISO 20022 CAMT.053)',
          webhookUrl,
          headers: {
            'Content-Type': 'application/json',
            'X-Bank-Code': 'BIM | STANDARD_BANK | BCI | MOZA | ABSA'
          },
          curlExample: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bankCode": "BIM",
    "statementId": "STMT-2026-09-21",
    "accountNIB": "000100000012345678901",
    "currency": "MZN",
    "transactions": [
      {
        "txId": "TX-99812",
        "date": "2026-09-21",
        "valueDate": "2026-09-21",
        "amount": 5000.00,
        "description": "TRF Tomás Vilanculos ALU-001",
        "reference": "ALU-001"
      }
    ]
  }'`,
          schema: {
            bankCode: 'string',
            statementId: 'string',
            accountNIB: 'string com 21 dígitos',
            transactions: 'array de movimentos para reconciliação automática'
          }
        };

      case 'whatsapp':
        return {
          title: 'Documentação Técnica: WhatsApp Webhook & Disparos',
          webhookUrl,
          headers: {
            'Content-Type': 'application/json',
            'apikey': (config as any).apiKey || 'wa_token_xxx'
          },
          curlExample: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "messages.upsert",
    "instance": "${(config as any).instanceName || 'moztechwave'}",
    "data": {
      "key": { "remoteJid": "258841234567@s.whatsapp.net", "fromMe": false },
      "message": { "conversation": "Olá, gostaria de saber o status da minha matrícula." }
    }
  }'`,
          schema: {
            event: 'string (ex: messages.upsert, qrcode.updated, connection.update)',
            instance: 'string',
            data: 'objeto de mensagem ou evento de conexão'
          }
        };

      case 'email':
        return {
          title: 'Documentação Técnica: Servidor de E-mail & Notificações',
          webhookUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + ((config as any).apiKey || 're_mz_live_xxx')
          },
          curlExample: `curl -X POST "https://api.moztechwave.co.mz/v1/email/send" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${(config as any).apiKey || 're_mz_live_xxx'}" \\
  -d '{
    "from": "${(config as any).fromEmail || 'secretaria@cftpm.ac.mz'}",
    "to": "aluno@gmail.com",
    "subject": "Confirmação de Matrícula - CFTPM",
    "html": "<h1>Bem-vindo!</h1><p>Sua matrícula foi confirmada.</p>"
  }'`,
          schema: {
            from: 'string (e-mail verificado)',
            to: 'string ou array',
            subject: 'string',
            html: 'string com conteúdo'
          }
        };

      case 'sms':
        return {
          title: 'Documentação Técnica: SMS Gateway Moçambique',
          webhookUrl,
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': (config as any).apiKey || 'sms_token_xxx'
          },
          curlExample: `curl -X POST "https://api.moztechwave.co.mz/v1/sms/send" \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ${(config as any).apiKey || 'sms_token_xxx'}" \\
  -d '{
    "sender": "${(config as any).senderId || 'CFTPM'}",
    "recipient": "258841234567",
    "message": "CFTPM: Lembrate que a propina vence dia 05/10. Ref: PRO-2026-ALU-001. Valor: 3.500 MT."
  }'`,
          schema: {
            sender: 'string com até 11 caracteres alfa-numéricos',
            recipient: 'string com prefixo 258',
            message: 'string (máx 160 caracteres por SMS)'
          }
        };

      case 'google':
        return {
          title: 'Documentação Técnica: Google Workspace for Education API',
          webhookUrl,
          headers: {
            'Authorization': 'Bearer <GOOGLE_OAUTH_TOKEN>',
            'Content-Type': 'application/json'
          },
          curlExample: `curl -X POST "https://classroom.googleapis.com/v1/courses" \\
  -H "Authorization: Bearer ya29.a0AfH6SM..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Turma Informática Geral - Manhã",
    "section": "2026/02",
    "descriptionHeading": "CFTPM",
    "ownerId": "me"
  }'`,
          schema: {
            name: 'string (nome da turma)',
            section: 'string',
            ownerId: 'string (e-mail do professor)'
          }
        };

      case 'microsoft':
        return {
          title: 'Documentação Técnica: Microsoft Graph API & Teams',
          webhookUrl,
          headers: {
            'Authorization': 'Bearer <AZURE_AD_TOKEN>',
            'Content-Type': 'application/json'
          },
          curlExample: `curl -X POST "https://graph.microsoft.com/v1.0/me/onlineMeetings" \\
  -H "Authorization: Bearer eyJ0eXAiOiJKV1Qi..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "startDateTime": "2026-09-22T08:00:00Z",
    "endDateTime": "2026-09-22T10:00:00Z",
    "subject": "Aula Online: Redes de Computadores - CFTPM"
  }'`,
          schema: {
            startDateTime: 'ISO string',
            endDateTime: 'ISO string',
            subject: 'string'
          }
        };

      case 'sistemas_externos':
        return {
          title: 'Documentação Técnica: Interoperabilidade SIGAR & LTI 1.3',
          webhookUrl,
          headers: {
            'Content-Type': 'application/json',
            'X-Interop-Token': (config as any).apiKey || 'sigar_bridge_xxx'
          },
          curlExample: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Interop-Token: ${(config as any).apiKey || 'sigar_bridge_xxx'}" \\
  -d '{
    "syncType": "STUDENT_GRADES",
    "institutionCode": "MZ-CFTPM-01",
    "academicYear": 2026,
    "courseCode": "INFO-GERAL",
    "records": [
      { "studentCode": "ALU-001", "grade": 17.5, "status": "APROVADO" }
    ]
  }'`,
          schema: {
            syncType: 'STUDENT_GRADES | ENROLLMENTS | ATTENDANCE',
            records: 'array de dados académicos'
          }
        };

      case 'sivec_api':
        return {
          title: 'Documentação Técnica: SIVEC API DINET/ANEP Moçambique',
          webhookUrl,
          headers: {
            'Content-Type': 'application/json',
            'X-SIVEC-API-KEY': (config as any).apiKey || 'sivec_gov_auth_xxx',
            'X-Certificate-Thumbprint': (config as any).digitalCertificateThumbprint || 'SHA256:...'
          },
          curlExample: `curl -X POST "${(config as any).apiEndpoint || 'https://sivec.dinet.gov.mz/api/v2/certificates/homologate'}" \\
  -H "Content-Type: application/json" \\
  -H "X-SIVEC-API-KEY: ${(config as any).apiKey || 'sivec_gov_auth_xxx'}" \\
  -d '{
    "nationalCenterCode": "${(config as any).nationalCenterCode || 'MZ-DINET-CFTPM-0089'}",
    "certificateNumber": "CERT-2026-CFTPM-00124",
    "studentName": "Tomás Alberto Vilanculos",
    "studentBI": "110100234567M",
    "courseTitle": "Técnico Médio em Eletricidade Industrial",
    "qualificationLevel": "Nível Médio Vocacional (QNQ 4)",
    "finalGrade": 18,
    "completionDate": "2026-09-15",
    "digitalSignatureHash": "SHA256_RSA_MOCK_SIGNATURE_PAYLOAD"
  }'`,
          schema: {
            nationalCenterCode: 'string (Código oficial DINET/ANEP)',
            certificateNumber: 'string (Prefixo e numeração institucional)',
            studentName: 'string',
            studentBI: 'string (Número de BI ou DIRE)',
            digitalSignatureHash: 'string (Assinatura criptográfica homologada)'
          }
        };

      default:
        return {
          title: 'Documentação de API',
          webhookUrl,
          headers: {},
          curlExample: '',
          schema: {}
        };
    }
  }
}
