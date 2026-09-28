import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Zap, 
  Terminal, 
  Key, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  Server, 
  Layers, 
  Code2, 
  ShieldCheck,
  Plus,
  AlertTriangle,
  Lock,
  ExternalLink,
  QrCode,
  FileCheck2,
  Hash,
  Send,
  Database,
  ShieldAlert,
  Download,
  ArrowRight
} from 'lucide-react';
import { 
  SivecRegistryEntry, 
  SivecConnectWebhook, 
  SivecApiKey, 
  SivecExternalSystemType,
  SivecConnectScope,
  SivecApiRegisterPayload
} from '../types';
import { INITIAL_CONNECT_WEBHOOKS, SIVEC_LEGAL_MANDATE } from '../mockSivecData';
import { 
  getConnectApiKeys, 
  createConnectApiKey, 
  revokeConnectApiKey,
  registerCertificateApi,
  verifyCertificateApi,
  checkCertificateStatusApi,
  generateCertificateQrApi,
  getCertificatePublicUrlApi,
  validateCertificateHashApi,
  requestOAuth2Token,
  getCanonicalVerifyBaseUrl,
  revokeCertificateApi,
  correctCertificateApi
} from '../../../services/sivecConnectApi';

interface SivecConnectTabProps {
  registry?: SivecRegistryEntry[];
  onAddEntry?: (newEntry: SivecRegistryEntry) => void;
  onNavigateVerify?: (code: string) => void;
}

type ApiEndpointKey = 'register' | 'verify' | 'status' | 'qr' | 'public_url' | 'validate_hash' | 'revoke' | 'correct';
type CodeLang = 'curl' | 'php' | 'nodejs' | 'python' | 'csharp';

export const SivecConnectTab: React.FC<SivecConnectTabProps> = ({
  registry = [],
  onAddEntry,
  onNavigateVerify
}) => {
  // Gestão de Webhooks
  const [webhooks, setWebhooks] = useState<SivecConnectWebhook[]>(INITIAL_CONNECT_WEBHOOKS);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [pingSuccessId, setPingSuccessId] = useState<string | null>(null);

  // Gestão de API Keys
  const [apiKeys, setApiKeys] = useState<SivecApiKey[]>(getConnectApiKeys);
  const [isCreatingKeyModalOpen, setIsCreatingKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySystem, setNewKeySystem] = useState<SivecExternalSystemType>('SIGAR');
  const [newKeyEnv, setNewKeyEnv] = useState<'production' | 'sandbox'>('production');
  const [newKeyScopes, setNewKeyScopes] = useState<SivecConnectScope[]>([
    'certificates:register',
    'certificates:verify',
    'certificates:status'
  ]);
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(300);
  const [justGeneratedKey, setJustGeneratedKey] = useState<SivecApiKey | null>(null);

  // Playground Interativo da API (Os 6 Endpoints Mandatórios)
  const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpointKey>('register');
  const [isExecutingApi, setIsExecutingApi] = useState(false);
  const [apiResponseJson, setApiResponseJson] = useState<string | null>(null);
  const [apiResponseMeta, setApiResponseMeta] = useState<{ status: number; durationMs: number } | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [activeCodeLang, setActiveCodeLang] = useState<CodeLang>('curl');

  // Formulário do Endpoint 1: Registrar Certificado
  const [regForm, setRegForm] = useState<SivecApiRegisterPayload>({
    studentName: 'CARLOS MANUEL SITOE',
    studentDocument: 'BI nº 110294817293A',
    studentId: 'SIGAR-2026-9921',
    studentEmail: 'carlos.sitoe@estudante.co.mz',
    courseName: 'Engenharia de Software, Cloud & DevOps',
    durationHours: 1200,
    finalGrade: '18 Valores (Aprovado com Distinção)',
    certificateTitle: 'Certificado de Qualificação Tecnológica',
    credentialType: 'certificado',
    academicLevel: 'Nível 5 - Especialização Tecnológica',
    institutionName: 'Instituto Politécnico e Tecnológico de Maputo - IPTA',
    institutionNuit: '400891234',
    institutionCampus: 'Campus Central - Av. Eduardo Mondlane',
    externalReference: 'SIGAR-INTEGRATION-REF-88912',
    bookNumber: 'L-04/TEC',
    sheetNumber: 'Fl. 89',
    entryNumber: 'Assento nº 1043'
  });

  // Formulário do Endpoint 2: Verificar Certificado
  const [verifyTargetId, setVerifyTargetId] = useState('SIVEC-MZ-2026-8819');

  // Formulário do Endpoint 3: Consultar Status
  const [statusTargetId, setStatusTargetId] = useState('SIVEC-MZ-2026-8819');

  // Formulário do Endpoint 4: Gerar QR
  const [qrTargetId, setQrTargetId] = useState('SIVEC-MZ-2026-8819');
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string | null>(null);

  // Formulário do Endpoint 5: Obter URL Pública
  const [publicUrlTargetId, setPublicUrlTargetId] = useState('SIVEC-MZ-2026-8819');

  // Formulário do Endpoint 6: Validar Hash
  const [hashToValidate, setHashToValidate] = useState('a8f5c490e12d3b7890a5f6e872c91a04b32198cd65fe123456789abcdef01234');

  // Formulário do Endpoint 7: Revogar Certificado (Requisito 89.2)
  const [revokeTargetId, setRevokeTargetId] = useState('SIVEC-MZ-2026-8819');
  const [revokeReason, setRevokeReason] = useState('Anulação notarial por cancelamento administrativo de matrícula.');
  const [revokeAuthorizedBy, setRevokeAuthorizedBy] = useState('Dr. Armando Macuácua - Secretaria Notarial');
  const [revokeDispatch, setRevokeDispatch] = useState('DESP-2026/089-NOT');

  // Formulário do Endpoint 8: Retificar / Corrigir Certificado (Requisito 89.2 & 85.4)
  const [correctTargetId, setCorrectTargetId] = useState('SIVEC-MZ-2026-8819');
  const [correctJustification, setCorrectJustification] = useState('Retificação ortográfica do nome do titular conforme certidão de nascimento.');
  const [correctAuthorizedBy, setCorrectAuthorizedBy] = useState('Eng. Paulo Jafim - Direção Executiva');
  const [correctStudentName, setCorrectStudentName] = useState('CARLOS MANUEL SITOE JÚNIOR');
  const [correctCourseName, setCorrectCourseName] = useState('');
  const [correctGrade, setCorrectGrade] = useState('');

  // OAuth 2.0 Test State
  const [oauthClientId, setOauthClientId] = useState('sigar_enterprise_client_id');
  const [oauthClientSecret, setOauthClientSecret] = useState('sec_live_998124a_sivec');
  const [oauthTokenResponse, setOauthTokenResponse] = useState<string | null>(null);
  const [isRequestingToken, setIsRequestingToken] = useState(false);

  // Notificação de cópia genérica
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sincronizar Chaves de API
  useEffect(() => {
    setApiKeys(getConnectApiKeys());
  }, []);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Webhook Ping Test
  const handleTestPing = (id: string) => {
    setTestingWebhookId(id);
    setPingSuccessId(null);
    setTimeout(() => {
      setTestingWebhookId(null);
      setPingSuccessId(id);
      setTimeout(() => setPingSuccessId(null), 3000);
    }, 600);
  };

  // Criar Nova API Key
  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const created = createConnectApiKey(
      newKeyName.trim(),
      newKeySystem,
      newKeyEnv,
      newKeyScopes,
      newKeyRateLimit
    );

    setApiKeys(getConnectApiKeys());
    setJustGeneratedKey(created);
    setNewKeyName('');
    setIsCreatingKeyModalOpen(false);
  };

  // Revogar Chave
  const handleRevokeKey = (id: string) => {
    if (window.confirm('Tem certeza de que deseja revogar esta chave de API? O sistema externo perderá o acesso imediato.')) {
      revokeConnectApiKey(id);
      setApiKeys(getConnectApiKeys());
    }
  };

  // Executar Chamada Real ao Endpoint Selecionado
  const handleExecuteActiveEndpoint = async () => {
    setIsExecutingApi(true);
    setApiResponseJson(null);
    setApiResponseMeta(null);
    setGeneratedQrDataUrl(null);
    const startTime = performance.now();

    try {
      if (activeEndpoint === 'register') {
        const res = await registerCertificateApi(regForm);
        const duration = Math.round(performance.now() - startTime);
        setApiResponseMeta({ status: res.code, durationMs: duration });
        setApiResponseJson(JSON.stringify(res, null, 2));

        // Se o componente pai fornecer callback onAddEntry, podemos atualizar a lista de certificados
        if (res.status === 'success' && res.data && onAddEntry) {
          // O registro já foi salvo no localStorage via sivecConnectApi
        }
      } else if (activeEndpoint === 'verify') {
        const res = await verifyCertificateApi(verifyTargetId);
        const duration = Math.round(performance.now() - startTime);
        setApiResponseMeta({ status: res.code, durationMs: duration });
        setApiResponseJson(JSON.stringify(res, null, 2));
      } else if (activeEndpoint === 'status') {
        const res = await checkCertificateStatusApi(statusTargetId);
        const duration = Math.round(performance.now() - startTime);
        setApiResponseMeta({ status: res.code, durationMs: duration });
        setApiResponseJson(JSON.stringify(res, null, 2));
      } else if (activeEndpoint === 'qr') {
        const res = await generateCertificateQrApi(qrTargetId);
        const duration = Math.round(performance.now() - startTime);
        setApiResponseMeta({ status: res.code, durationMs: duration });
        setApiResponseJson(JSON.stringify(res, null, 2));
        if (res.qrDataUrl) {
          setGeneratedQrDataUrl(res.qrDataUrl);
        }
      } else if (activeEndpoint === 'public_url') {
        const res = await getCertificatePublicUrlApi(publicUrlTargetId);
        const duration = Math.round(performance.now() - startTime);
        setApiResponseMeta({ status: res.code, durationMs: duration });
        setApiResponseJson(JSON.stringify(res, null, 2));
      } else if (activeEndpoint === 'validate_hash') {
        const res = await validateCertificateHashApi(hashToValidate);
        const duration = Math.round(performance.now() - startTime);
        setApiResponseMeta({ status: res.code, durationMs: duration });
        setApiResponseJson(JSON.stringify(res, null, 2));
      } else if (activeEndpoint === 'revoke') {
        const res = await revokeCertificateApi({
          certificateId: revokeTargetId,
          revocationReason: revokeReason,
          authorizedBy: revokeAuthorizedBy,
          legalDispatchNumber: revokeDispatch
        });
        const duration = Math.round(performance.now() - startTime);
        setApiResponseMeta({ status: res.code, durationMs: duration });
        setApiResponseJson(JSON.stringify(res, null, 2));
      } else if (activeEndpoint === 'correct') {
        const res = await correctCertificateApi({
          certificateId: correctTargetId,
          justification: correctJustification,
          authorizedBy: correctAuthorizedBy,
          corrections: {
            studentName: correctStudentName || undefined,
            courseName: correctCourseName || undefined,
            finalGrade: correctGrade || undefined
          }
        });
        const duration = Math.round(performance.now() - startTime);
        setApiResponseMeta({ status: res.code, durationMs: duration });
        setApiResponseJson(JSON.stringify(res, null, 2));
      }
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setApiResponseMeta({ status: 500, durationMs: duration });
      setApiResponseJson(JSON.stringify({
        status: 'error',
        code: 500,
        message: err?.message || 'Erro inesperado na chamada da API.'
      }, null, 2));
    } finally {
      setIsExecutingApi(false);
    }
  };

  // Testar Concessão OAuth 2.0
  const handleRequestOAuthToken = async () => {
    setIsRequestingToken(true);
    setOauthTokenResponse(null);
    try {
      const token = await requestOAuth2Token(oauthClientId, oauthClientSecret);
      setOauthTokenResponse(JSON.stringify(token, null, 2));
    } catch (err: any) {
      setOauthTokenResponse(JSON.stringify({
        error: 'invalid_client',
        error_description: err?.message || 'Falha na autenticação das credenciais OAuth 2.0.'
      }, null, 2));
    } finally {
      setIsRequestingToken(false);
    }
  };

  // Predefinições rápidas para preencher formulário de registro
  const applyPreset = (type: 'SIGAR' | 'SistemasHugo' | 'SoftGenial' | 'InHouse') => {
    if (type === 'SIGAR') {
      setRegForm({
        studentName: 'ARMANDO FRANCISCO NHANTUMBO',
        studentDocument: 'BI nº 100293817290B',
        studentId: 'SIGAR-ENG-2026-8812',
        studentEmail: 'armando.nhantumbo@aluno.sigar.mz',
        courseName: 'Engenharia de Infraestruturas de TI & Cibersegurança',
        durationHours: 1400,
        finalGrade: '19 Valores (Summa Cum Laude)',
        certificateTitle: 'Certificado de Conclusão de Curso Tecnológico',
        credentialType: 'certificado',
        academicLevel: 'Nível 5 - Especialização Tecnológica',
        institutionName: 'Instituto Politécnico e Tecnológico de Maputo - IPTA',
        institutionNuit: '400891234',
        institutionCampus: 'Campus Principal - Av. Eduardo Mondlane',
        externalReference: 'SIGAR-CONCLUSAO-REF-9941',
        bookNumber: 'L-05/SIGAR',
        sheetNumber: 'Fl. 42',
        entryNumber: 'Assento nº 2011'
      });
    } else if (type === 'SistemasHugo') {
      setRegForm({
        studentName: 'BEATRIZ CELESTINO MANGUE',
        studentDocument: 'BI nº 100492817294F',
        studentId: 'HUGO-ACAD-2026-104',
        studentEmail: 'beatriz.mangue@aluno.hugosistemas.mz',
        courseName: 'Gestão Aduaneira, Logística & Comércio Internacional',
        durationHours: 1100,
        finalGrade: '18 Valores (Aprovado com Distinção)',
        certificateTitle: 'Certificado de Qualificação Aduaneira',
        credentialType: 'certificado',
        academicLevel: 'Nível 5 - Especialização Profissional',
        institutionName: 'Instituto Técnico Superior de Logística e Aduanas',
        institutionNuit: '400554433',
        institutionCampus: 'Campus Portuário - Beira',
        externalReference: 'SISTEMAS-HUGO-REF-7721',
        bookNumber: 'L-03/HUGO',
        sheetNumber: 'Fl. 27',
        entryNumber: 'Assento nº 0491'
      });
    } else if (type === 'SoftGenial') {
      setRegForm({
        studentName: 'ZULMIRA ALBERTO MUSSANE',
        studentDocument: 'BI nº 110938472910G',
        studentId: 'SG-AL-2026-4401',
        studentEmail: 'zulmira.mussane@softgenial.edu.mz',
        courseName: 'Contabilidade Bancária, Fiscalidade & Primavera ERP',
        durationHours: 900,
        finalGrade: '17 Valores (Aprovado com Mérito)',
        certificateTitle: 'Certificado Técnico Profissional',
        credentialType: 'certificado',
        academicLevel: 'Nível 4 - Técnico Médio',
        institutionName: 'Centro de Formação e Competências Profissionais SoftGenial',
        institutionNuit: '400998811',
        institutionCampus: 'Polo de Formação Matola',
        externalReference: 'SG-ACAD-REG-2026-778',
        bookNumber: 'L-02/SG',
        sheetNumber: 'Fl. 18',
        entryNumber: 'Assento nº 0842'
      });
    } else {
      setRegForm({
        studentName: 'DÉLCIO ARNALDO CHIVITE',
        studentDocument: 'BI nº 100883719284D',
        studentId: 'ERP-MAT-2026-5502',
        studentEmail: 'delcio.chivite@empresa.co.mz',
        courseName: 'Administração de Redes, Cloud Computing & Microsserviços',
        durationHours: 850,
        finalGrade: '16 Valores (Bom com Distinção)',
        certificateTitle: 'Certificado de Competências Digitais',
        credentialType: 'certificado',
        academicLevel: 'Nível 5 - Qualificação Executiva',
        institutionName: 'Instituto Superior de Gestão e Tecnologia',
        institutionNuit: '400112233',
        institutionCampus: 'Campus Politécnico',
        externalReference: 'ERP-ACAD-SYS-88219',
        bookNumber: 'L-01/SYS',
        sheetNumber: 'Fl. 99',
        entryNumber: 'Assento nº 1204'
      });
    }
  };

  // Gerador dinâmico de snippets de código para o endpoint ativo
  const getCodeSnippet = (endpoint: ApiEndpointKey, lang: CodeLang): string => {
    const baseUrl = 'https://api.sivec.moztechwave.co.mz/v1';
    const authHeader = 'Authorization: Bearer sk_live_sigar_9821af3e_moztechwave_2026';

    if (endpoint === 'register') {
      const body = JSON.stringify(regForm, null, 2);
      if (lang === 'curl') {
        return `curl -X POST "${baseUrl}/certificates" \\
  -H "Content-Type: application/json" \\
  -H "${authHeader}" \\
  -d '${JSON.stringify(regForm)}'`;
      }
      if (lang === 'php') {
        return `<?php
// Integração SIGAR / SoftGenial -> SIVEC CONNECT
$url = "${baseUrl}/certificates";
$payload = ${JSON.stringify(regForm, null, 4)};

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    '${authHeader}'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);
echo "SIVEC Code Emitido: " . $result['data']['sivecCode'];
?>`;
      }
      if (lang === 'nodejs') {
        return `import fetch from 'node-fetch';

const response = await fetch('${baseUrl}/certificates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    '${authHeader}'
  },
  body: JSON.stringify(${JSON.stringify(regForm, null, 2)})
});

const data = await response.json();
console.log('Certificado Registado:', data.data.sivecCode);
console.log('URL Pública:', data.data.publicVerifyUrl);`;
      }
      if (lang === 'python') {
        return `import requests

url = "${baseUrl}/certificates"
headers = {
    "Content-Type": "application/json",
    "${authHeader}"
}
payload = ${JSON.stringify(regForm, null, 4)}

response = requests.post(url, json=payload, headers=headers)
print("Status:", response.status_code)
print("SIVEC Data:", response.json())`;
      }
      if (lang === 'csharp') {
        return `using System.Net.Http;
using System.Text;
using System.Text.Json;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer sk_live_sigar_9821af3e_moztechwave_2026");

var json = @"${JSON.stringify(regForm).replace(/"/g, '""')}";
var content = new StringContent(json, Encoding.UTF8, "application/json");

var response = await client.PostAsync("${baseUrl}/certificates", content);
var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`;
      }
    }

    if (endpoint === 'verify') {
      if (lang === 'curl') {
        return `curl -X GET "${baseUrl}/certificates/${verifyTargetId}" \\
  -H "${authHeader}"`;
      }
      if (lang === 'php') {
        return `<?php
$url = "${baseUrl}/certificates/${verifyTargetId}";
$headers = ['${authHeader}'];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);
curl_close($ch);

$cert = json_decode($response, true);
if ($cert['isAuthentic']) {
    echo "Autêntico: " . $cert['data']['studentName'];
}
?>`;
      }
      if (lang === 'nodejs') {
        return `const res = await fetch('${baseUrl}/certificates/${verifyTargetId}', {
  headers: { '${authHeader}' }
});
const { isAuthentic, data } = await res.json();
console.log('Autêntico:', isAuthentic, data.studentName, data.status);`;
      }
      if (lang === 'python') {
        return `import requests
res = requests.get("${baseUrl}/certificates/${verifyTargetId}", headers={"${authHeader}"})
print(res.json())`;
      }
      if (lang === 'csharp') {
        return `var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer sk_live_sigar_9821af3e_moztechwave_2026");
var res = await client.GetAsync("${baseUrl}/certificates/${verifyTargetId}");
var json = await res.Content.ReadAsStringAsync();`;
      }
    }

    if (endpoint === 'status') {
      if (lang === 'curl') {
        return `curl -X GET "${baseUrl}/certificates/${statusTargetId}/status" \\
  -H "${authHeader}"`;
      }
      return `fetch('${baseUrl}/certificates/${statusTargetId}/status', {
  headers: { '${authHeader}' }
}).then(r => r.json()).then(console.log);`;
    }

    if (endpoint === 'qr') {
      if (lang === 'curl') {
        return `curl -X GET "${baseUrl}/certificates/${qrTargetId}/qr" \\
  -H "${authHeader}"`;
      }
      return `fetch('${baseUrl}/certificates/${qrTargetId}/qr', {
  headers: { '${authHeader}' }
}).then(r => r.json()).then(data => {
  console.log('QR Payload:', data.qrPayload);
  console.log('SVG Data URL:', data.qrDataUrl);
});`;
    }

    if (endpoint === 'public_url') {
      if (lang === 'curl') {
        return `curl -X GET "${baseUrl}/certificates/${publicUrlTargetId}/public-url" \\
  -H "${authHeader}"`;
      }
      return `fetch('${baseUrl}/certificates/${publicUrlTargetId}/public-url', {
  headers: { '${authHeader}' }
}).then(r => r.json()).then(data => {
  console.log('Canonical URL:', data.canonicalUrl);
  console.log('Iframe Embed Snippet:', data.iframeEmbedSnippet);
});`;
    }

    if (endpoint === 'validate_hash') {
      if (lang === 'curl') {
        return `curl -X POST "${baseUrl}/certificates/validate-hash" \\
  -H "Content-Type: application/json" \\
  -H "${authHeader}" \\
  -d '{"sha256Hash":"${hashToValidate}"}'`;
      }
      return `fetch('${baseUrl}/certificates/validate-hash', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    '${authHeader}'
  },
  body: JSON.stringify({ sha256Hash: '${hashToValidate}' })
}).then(r => r.json()).then(console.log);`;
    }

    if (endpoint === 'revoke') {
      const payload = {
        certificateId: revokeTargetId,
        revocationReason: revokeReason,
        authorizedBy: revokeAuthorizedBy,
        legalDispatchNumber: revokeDispatch
      };
      if (lang === 'curl') {
        return `curl -X POST "${baseUrl}/certificates/${revokeTargetId}/revoke" \\
  -H "Content-Type: application/json" \\
  -H "${authHeader}" \\
  -d '${JSON.stringify(payload)}'`;
      }
      return `fetch('${baseUrl}/certificates/${revokeTargetId}/revoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    '${authHeader}'
  },
  body: JSON.stringify(${JSON.stringify(payload, null, 2)})
}).then(r => r.json()).then(console.log);`;
    }

    if (endpoint === 'correct') {
      const payload = {
        certificateId: correctTargetId,
        justification: correctJustification,
        authorizedBy: correctAuthorizedBy,
        corrections: {
          studentName: correctStudentName,
          courseName: correctCourseName || undefined,
          finalGrade: correctGrade || undefined
        }
      };
      if (lang === 'curl') {
        return `curl -X POST "${baseUrl}/certificates/${correctTargetId}/correct" \\
  -H "Content-Type: application/json" \\
  -H "${authHeader}" \\
  -d '${JSON.stringify(payload)}'`;
      }
      return `fetch('${baseUrl}/certificates/${correctTargetId}/correct', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    '${authHeader}'
  },
  body: JSON.stringify(${JSON.stringify(payload, null, 2)})
}).then(r => r.json()).then(console.log);`;
    }

    return '';
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. CABEÇALHO SIVEC CONNECT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 font-mono text-[10px] font-black uppercase tracking-wider border border-sky-500/30">
              SIVEC CONNECT • REQUISITO 45
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              API RESTful v1.2 LIVE
            </span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5 mt-2">
            <Globe className="w-7 h-7 text-sky-400" />
            API para Sistemas Externos (SIGAR, SoftGenial, ERPs)
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Gateway padronizado para emissão, validação, verificação de status, geração de QR Codes e auditoria de hash sem concessão de acesso ao banco interno.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingKeyModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Gerar Nova API Key</span>
          </button>
        </div>
      </div>

      {/* 2. ⚠️ DOUTRINA DE SEGURANÇA MANDATÓRIA: ZERO-TRUST E ISOLAMENTO DE BANCO DE DADOS */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-sky-500/30 relative overflow-hidden shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Arquitetura de Isolamento Soberano (Zero-Trust)
              </h3>
              <span className="text-[11px] font-mono text-sky-300 font-bold">
                DIRETRIZ ESTRITA: SISTEMAS EXTERNOS NÃO TÊM ACESSO AO BANCO INTERNO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Database className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Banco de Dados SIVEC:</span>
            <span className="text-emerald-400 font-bold">ISOLADO ATRÁS DO GATEWAY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-rose-400">
              <span>✕ O que é ESTRITAMENTE PROIBIDO:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Fornecer credenciais de conexão direta a bancos de dados (PostgreSQL, MySQL, Firestore, MongoDB) para SIGAR, SoftGenial ou ERPs. Softwares de terceiros nunca executam queries diretas em tabelas notariais.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-emerald-400">
              <span>✓ Como o SIVEC CONNECT opera:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Toda interação ocorre exclusivamente via <strong>API RESTful padronizada com HTTPS/TLS</strong>, com autenticação por <strong>API Key</strong> ou <strong>OAuth 2.0</strong>, carimbo de tempo TSA RFC-3161 e cálculo imutável de Hash SHA-256.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CONSOLA INTERATIVA DOS 6 ENDPOINTS MANDATÓRIOS DA API */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider block">
              CONSOLE DE EXECUÇÃO &amp; TESTE DE CONTRATOS
            </span>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              Playground dos 6 Endpoints Oficiais da API
            </h3>
          </div>

          {/* Seletor dos 6 Endpoints Mandatórios */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => { setActiveEndpoint('register'); setApiResponseJson(null); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeEndpoint === 'register' 
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>1. Registrar</span>
            </button>

            <button
              onClick={() => { setActiveEndpoint('verify'); setApiResponseJson(null); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeEndpoint === 'verify' 
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. Verificar</span>
            </button>

            <button
              onClick={() => { setActiveEndpoint('status'); setApiResponseJson(null); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeEndpoint === 'status' 
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>3. Consultar Status</span>
            </button>

            <button
              onClick={() => { setActiveEndpoint('qr'); setApiResponseJson(null); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeEndpoint === 'qr' 
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>4. Gerar QR</span>
            </button>

            <button
              onClick={() => { setActiveEndpoint('public_url'); setApiResponseJson(null); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeEndpoint === 'public_url' 
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>5. Obter URL Pública</span>
            </button>

            <button
              onClick={() => { setActiveEndpoint('validate_hash'); setApiResponseJson(null); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeEndpoint === 'validate_hash' 
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>6. Validar Hash</span>
            </button>

            <button
              onClick={() => { setActiveEndpoint('revoke'); setApiResponseJson(null); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeEndpoint === 'revoke' 
                  ? 'bg-rose-500 text-white font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>7. Revogar</span>
            </button>

            <button
              onClick={() => { setActiveEndpoint('correct'); setApiResponseJson(null); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeEndpoint === 'correct' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>8. Retificar</span>
            </button>
          </div>
        </div>

        {/* PARTE SUPERIOR: ROTA E BOTÃO DE DISPARO */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
              activeEndpoint === 'register' || activeEndpoint === 'validate_hash' || activeEndpoint === 'revoke' || activeEndpoint === 'correct' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {activeEndpoint === 'register' || activeEndpoint === 'validate_hash' || activeEndpoint === 'revoke' || activeEndpoint === 'correct' ? 'POST' : 'GET'}
            </span>
            <span className="truncate">
              {activeEndpoint === 'register' && '/api/v1/sivec/certificates'}
              {activeEndpoint === 'verify' && `/api/v1/sivec/certificates/${verifyTargetId || ':id'}`}
              {activeEndpoint === 'status' && `/api/v1/sivec/certificates/${statusTargetId || ':id'}/status`}
              {activeEndpoint === 'qr' && `/api/v1/sivec/certificates/${qrTargetId || ':id'}/qr`}
              {activeEndpoint === 'public_url' && `/api/v1/sivec/certificates/${publicUrlTargetId || ':id'}/public-url`}
              {activeEndpoint === 'validate_hash' && '/api/v1/sivec/certificates/validate-hash'}
              {activeEndpoint === 'revoke' && `/api/v1/sivec/certificates/${revokeTargetId || ':id'}/revoke`}
              {activeEndpoint === 'correct' && `/api/v1/sivec/certificates/${correctTargetId || ':id'}/correct`}
            </span>
          </div>

          <button
            onClick={handleExecuteActiveEndpoint}
            disabled={isExecutingApi}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-sans font-black text-xs cursor-pointer flex items-center gap-2 transition shrink-0 shadow-lg shadow-sky-500/20"
          >
            {isExecutingApi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Executar Chamada Real na API</span>
          </button>
        </div>

        {/* PARTE DO MEIO: FORMULÁRIO ESPECÍFICO DO ENDPOINT ATIVO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA ESQUERDA (CONFIGURAÇÃO DO PAYLOAD) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* ENDPOINT 1: REGISTRAR CERTIFICADO */}
            {activeEndpoint === 'register' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Preenchimento Rápido com Presets de Sistemas:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset('SIGAR')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-[10px] font-bold transition cursor-pointer"
                    >
                      SIGAR
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('SoftGenial')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold transition cursor-pointer"
                    >
                      SoftGenial
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('InHouse')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-bold transition cursor-pointer"
                    >
                      ERP Próprio
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">NOME DO ALUNO *</label>
                      <input
                        type="text"
                        value={regForm.studentName}
                        onChange={e => setRegForm({ ...regForm, studentName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">BI / PASSAPORTE *</label>
                      <input
                        type="text"
                        value={regForm.studentDocument}
                        onChange={e => setRegForm({ ...regForm, studentDocument: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">CURSO CONCLUÍDO *</label>
                    <input
                      type="text"
                      value={regForm.courseName}
                      onChange={e => setRegForm({ ...regForm, courseName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">CARGA HORÁRIA (H) *</label>
                      <input
                        type="number"
                        value={regForm.durationHours}
                        onChange={e => setRegForm({ ...regForm, durationHours: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">NOTA FINAL</label>
                      <input
                        type="text"
                        value={regForm.finalGrade}
                        onChange={e => setRegForm({ ...regForm, finalGrade: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">REF. DO SISTEMA EXTERNO</label>
                      <input
                        type="text"
                        value={regForm.externalReference}
                        onChange={e => setRegForm({ ...regForm, externalReference: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">LIVRO NOTARIAL</label>
                      <input
                        type="text"
                        value={regForm.bookNumber}
                        onChange={e => setRegForm({ ...regForm, bookNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">FOLHA</label>
                      <input
                        type="text"
                        value={regForm.sheetNumber}
                        onChange={e => setRegForm({ ...regForm, sheetNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">ASSENTO / TERMO</label>
                      <input
                        type="text"
                        value={regForm.entryNumber}
                        onChange={e => setRegForm({ ...regForm, entryNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ENDPOINT 2: VERIFICAR CERTIFICADO */}
            {activeEndpoint === 'verify' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">
                    Código SIVEC, UID Universal ou Número de Registro:
                  </label>
                  <input
                    type="text"
                    value={verifyTargetId}
                    onChange={e => setVerifyTargetId(e.target.value)}
                    placeholder="Ex: SIVEC-MZ-2026-8819 ou MZ-SIVEC-CERT-2026-008819-A1"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                  />

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 font-mono block mb-1.5">Sugestões de teste rápido:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['SIVEC-MZ-2026-8819', 'SIVEC-MZ-2026-7492', 'SIVEC-MZ-2026-3391', 'SIVEC-MZ-2026-1104'].map(code => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setVerifyTargetId(code)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-800 transition cursor-pointer"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  O endpoint <strong>GET /certificates/:id</strong> realiza a auditoria cartorária completa e retorna o status criptográfico, dados acadêmicos com máscara de proteção do BI do aluno e a declaração de conformidade da ANEP.
                </p>
              </div>
            )}

            {/* ENDPOINT 3: CONSULTAR STATUS */}
            {activeEndpoint === 'status' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">
                    Consultar Status de Credencial para Empregadores &amp; ERPs:
                  </label>
                  <input
                    type="text"
                    value={statusTargetId}
                    onChange={e => setStatusTargetId(e.target.value)}
                    placeholder="Ex: SIVEC-MZ-2026-8819"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['SIVEC-MZ-2026-8819', 'SIVEC-MZ-2026-3391', 'SIVEC-MZ-2026-1104'].map(code => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setStatusTargetId(code)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-800 transition cursor-pointer"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Endpoint ultra-rápido (latência &lt; 20ms) projetado para triagem automática em RHs, sistemas de folha de pagamento e validações de ingresso em concursos públicos.
                </p>
              </div>
            )}

            {/* ENDPOINT 4: GERAR QR */}
            {activeEndpoint === 'qr' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">
                    Código do Certificado para Geração do QR Code Notarial:
                  </label>
                  <input
                    type="text"
                    value={qrTargetId}
                    onChange={e => setQrTargetId(e.target.value)}
                    placeholder="Ex: SIVEC-MZ-2026-8819"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                {generatedQrDataUrl && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center gap-4">
                    <img
                      src={generatedQrDataUrl}
                      alt="QR Code SIVEC"
                      className="w-24 h-24 rounded-xl border border-slate-700 bg-white p-1 shrink-0"
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono block">
                        QR Code Notarial Gerado
                      </span>
                      <p className="text-xs text-white font-mono truncate">{qrTargetId}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={generatedQrDataUrl}
                          download={`sivec_qr_${qrTargetId}.svg`}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold transition flex items-center gap-1.5"
                        >
                          <Download className="w-3 h-3 text-emerald-400" />
                          <span>Baixar SVG</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyText(generatedQrDataUrl, 'qr_data_url')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center gap-1.5"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedField === 'qr_data_url' ? 'Copiado' : 'Copiar Data URL'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ENDPOINT 5: OBTER URL PÚBLICA */}
            {activeEndpoint === 'public_url' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">
                    Código do Certificado para URL Pública &amp; Incorporação:
                  </label>
                  <input
                    type="text"
                    value={publicUrlTargetId}
                    onChange={e => setPublicUrlTargetId(e.target.value)}
                    placeholder="Ex: SIVEC-MZ-2026-8819"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] text-slate-400 font-mono block">Link Canônico de Verificação:</span>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-mono text-sky-400 truncate text-[11px]">
                      {`${getCanonicalVerifyBaseUrl()}/${encodeURIComponent(publicUrlTargetId || 'SIVEC-MZ-2026-8819')}`}
                    </span>
                    <a
                      href={`/verify/${encodeURIComponent(publicUrlTargetId || 'SIVEC-MZ-2026-8819')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                      title="Abrir em nova aba"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ENDPOINT 6: VALIDAR HASH */}
            {activeEndpoint === 'validate_hash' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">
                    Hash Criptográfico SHA-256 (64 Caracteres Hexadecimais):
                  </label>
                  <input
                    type="text"
                    value={hashToValidate}
                    onChange={e => setHashToValidate(e.target.value)}
                    placeholder="Ex: a8f5c490e12d3b7890a5f6e872c91a04b32198cd65fe123456789abcdef01234"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setHashToValidate('a8f5c490e12d3b7890a5f6e872c91a04b32198cd65fe123456789abcdef01234')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/30 transition cursor-pointer"
                    >
                      Inserir Hash Autêntico
                    </button>
                    <button
                      type="button"
                      onClick={() => setHashToValidate('000000000000000000000000000000000000000000000000000000000000dead')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold hover:bg-rose-500/30 transition cursor-pointer"
                    >
                      Inserir Hash Falsificado
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Permite que cartórios, auditores e plataformas externas verifiquem se um PDF ou documento impresso sofreu qualquer modificação de 1 bit em relação ao registro lavrado no SIVEC.
                </p>
              </div>
            )}

            {/* ENDPOINT 7: REVOGAR CERTIFICADO (REQUISITO 89.2) */}
            {activeEndpoint === 'revoke' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Revogação Oficial no Repositório Notarial SIVEC</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    O certificado será marcado como REVOGADO. A ação é registrada de forma indelével na trilha de auditoria e notificada via Webhook para todos os sistemas conectados.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">CÓDIGO SIVEC OU UID DO CERTIFICADO *</label>
                    <input
                      type="text"
                      value={revokeTargetId}
                      onChange={e => setRevokeTargetId(e.target.value)}
                      placeholder="Ex: SIVEC-MZ-2026-8819"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">JUSTIFICATIVA JURÍDICA / MOTIVO *</label>
                    <textarea
                      rows={2}
                      value={revokeReason}
                      onChange={e => setRevokeReason(e.target.value)}
                      placeholder="Motivo formal da anulação ou revogação..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">AUTORIZADO POR *</label>
                      <input
                        type="text"
                        value={revokeAuthorizedBy}
                        onChange={e => setRevokeAuthorizedBy(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">DESPACHO ADMINISTRATIVO</label>
                      <input
                        type="text"
                        value={revokeDispatch}
                        onChange={e => setRevokeDispatch(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ENDPOINT 8: RETIFICAR / CORRIGIR CERTIFICADO (REQUISITO 89.2 & 85.4) */}
            {activeEndpoint === 'correct' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <FileCheck2 className="w-4 h-4 shrink-0" />
                    <span>Averbamento de Retificação (Preservação de Versão Anterior)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Conforme o Requisito 85.4 e 89.2, retificações cadastrais nunca apagam o registro anterior: um novo Hash SHA-256 é calculado e a versão prévia fica protegida na trilha notarial.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">CÓDIGO SIVEC OU UID *</label>
                    <input
                      type="text"
                      value={correctTargetId}
                      onChange={e => setCorrectTargetId(e.target.value)}
                      placeholder="Ex: SIVEC-MZ-2026-8819"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">JUSTIFICATIVA NOTARIAL DA RETIFICAÇÃO *</label>
                    <textarea
                      rows={2}
                      value={correctJustification}
                      onChange={e => setCorrectJustification(e.target.value)}
                      placeholder="Justificativa formal do averbamento..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">CORRIGIR NOME DO ALUNO</label>
                      <input
                        type="text"
                        value={correctStudentName}
                        onChange={e => setCorrectStudentName(e.target.value)}
                        placeholder="Nome retificado"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1">AUTORIZADO POR *</label>
                      <input
                        type="text"
                        value={correctAuthorizedBy}
                        onChange={e => setCorrectAuthorizedBy(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SELETOR DE CÓDIGO DO SDK (cURL, PHP, Node.js, Python, C#) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-sky-400" />
                  Snippet de Integração para Sistemas Externos:
                </span>
                <div className="flex items-center gap-1">
                  {(['curl', 'php', 'nodejs', 'python', 'csharp'] as CodeLang[]).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveCodeLang(lang)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        activeCodeLang === lang ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="p-3 rounded-xl bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 border border-slate-800/80">
                  {getCodeSnippet(activeEndpoint, activeCodeLang)}
                </pre>
                <button
                  type="button"
                  onClick={() => handleCopyText(getCodeSnippet(activeEndpoint, activeCodeLang), 'snippet')}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'snippet' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA (RESPOSTA JSON DA API EM TEMPO REAL) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Resposta JSON em Tempo Real:
              </span>

              {apiResponseMeta && (
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                    apiResponseMeta.status >= 200 && apiResponseMeta.status < 300 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    HTTP {apiResponseMeta.status}
                  </span>
                  <span className="text-slate-400">Latência: {apiResponseMeta.durationMs}ms</span>
                </div>
              )}
            </div>

            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 min-h-[380px] max-h-[520px] overflow-hidden flex flex-col">
              {apiResponseJson ? (
                <>
                  <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>content-type: application/json; charset=utf-8</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiResponseJson);
                        setCopiedResponse(true);
                        setTimeout(() => setCopiedResponse(false), 2000);
                      }}
                      className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedResponse ? 'Copiado' : 'Copiar JSON'}</span>
                    </button>
                  </div>

                  <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-y-auto flex-1 select-all leading-relaxed">
                    {apiResponseJson}
                  </pre>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-500">
                  <Server className="w-12 h-12 stroke-[1.2]" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400">Aguardando Execução do Endpoint</p>
                    <p className="text-[11px] text-slate-500 max-w-sm">
                      Clique no botão &ldquo;Executar Chamada Real na API&rdquo; acima para disparar o contrato ativo e visualizar a resposta estruturada com carimbo notarial.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 4. PREPARAÇÃO OAUTH 2.0 & TOKENS DE ACESSO (OAUTH READY) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                ENTERPRISE SPEC
              </span>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Preparação OAuth 2.0 / Client Credentials Grant Flow
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Padrão RFC-6749 para autenticação federada segura sem armazenamento de credenciais de longa duração.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            Endpoint: <code className="text-amber-400 font-bold">POST /api/v1/sivec/oauth/token</code>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">CLIENT ID</label>
                <input
                  type="text"
                  value={oauthClientId}
                  onChange={e => setOauthClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">CLIENT SECRET</label>
                <input
                  type="password"
                  value={oauthClientSecret}
                  onChange={e => setOauthClientSecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleRequestOAuthToken}
              disabled={isRequestingToken}
              className="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition flex items-center justify-center gap-2"
            >
              {isRequestingToken ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              <span>Solicitar Bearer Token OAuth 2.0</span>
            </button>
          </div>

          <div className="md:col-span-6">
            <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300 h-28 overflow-y-auto">
              {oauthTokenResponse || '// Clique acima para gerar um token JWT OAuth 2.0 autenticado com 3600s de TTL.'}
            </pre>
          </div>
        </div>
      </div>

      {/* 5. GESTÃO DE API KEYS PARA SISTEMAS EXTERNOS (SIGAR, SOFTGENIAL, ERPs) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-sky-400" />
              Chaves de Acesso de Integração (API Keys Ativas)
            </h3>
            <p className="text-xs text-slate-400">
              Controle granular de escopos (registro, verificação, status, QR, hash) e limites de requisições por minuto.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingKeyModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Adicionar Chave</span>
          </button>
        </div>

        {justGeneratedKey && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Nova Chave Gerada com Sucesso para: {justGeneratedKey.name}
              </span>
              <button
                onClick={() => setJustGeneratedKey(null)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Dispensar
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              Copie o segredo agora. Por motivos de segurança, a chave secreta completa não será exibida novamente:
            </p>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-xs text-emerald-300">
              <span className="truncate">{justGeneratedKey.rawKey}</span>
              <button
                onClick={() => handleCopyText(justGeneratedKey.rawKey || '', 'new_key')}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-sans font-bold text-xs shrink-0 cursor-pointer"
              >
                {copiedField === 'new_key' ? 'Copiado!' : 'Copiar Chave'}
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-800">
          {apiKeys.map((key) => (
            <div key={key.id} className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-white text-sm">{key.name}</strong>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    key.status === 'ativa' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {key.status.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 font-mono text-[10px] border border-slate-800">
                    {key.systemType}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-mono text-[10px]">
                    {key.environment}
                  </span>
                </div>
                <span className="font-mono text-slate-400 text-xs block">{key.tokenPrefix}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                {key.scopes.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 font-mono text-[10px] border border-slate-800">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-3 text-right">
                <div className="text-[11px] text-slate-400 font-mono">
                  <span>Limite: {key.rateLimitPerMinute} req/min</span>
                  <span className="block text-slate-500">Último uso: {key.lastUsedAt}</span>
                </div>

                {key.status === 'ativa' && (
                  <button
                    onClick={() => handleRevokeKey(key.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold transition cursor-pointer border border-rose-500/20"
                  >
                    Revogar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. WEBHOOKS DE NOTIFICAÇÃO EM TEMPO REAL */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Webhooks Ativos (Notificações Push para SIGAR &amp; SoftGenial)
            </h3>
            <p className="text-xs text-slate-400">
              Notificação automatizada quando uma credencial é emitida, revogada ou verificada por terceiros.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {webhooks.map((hook) => (
            <div key={hook.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{hook.systemName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {hook.status.toUpperCase()}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 truncate bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                {hook.endpointUrl}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Eventos: {hook.eventsSubscribed.length}</span>
                <span>Latência: ~{hook.lastPingMs}ms</span>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => handleTestPing(hook.id)}
                  disabled={testingWebhookId === hook.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                >
                  <Zap className={`w-3.5 h-3.5 ${testingWebhookId === hook.id ? 'animate-bounce text-amber-400' : 'text-sky-400'}`} />
                  <span>{testingWebhookId === hook.id ? 'Disparando...' : 'Testar Ping'}</span>
                </button>

                {pingSuccessId === hook.id && (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CRIAR NOVA API KEY */}
      {isCreatingKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-sky-400" />
                Gerar Chave de Integração API SIVEC CONNECT
              </h3>
              <button
                onClick={() => setIsCreatingKeyModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nome da Integração / Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SIGAR Produção - Campus Maputo"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Sistema Integrado</label>
                  <select
                    value={newKeySystem}
                    onChange={e => setNewKeySystem(e.target.value as SivecExternalSystemType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="SIGAR">SIGAR</option>
                    <option value="SoftGenial">SoftGenial</option>
                    <option value="ERP_Primavera">Primavera BSS</option>
                    <option value="ERP_SAP">SAP ERP</option>
                    <option value="ERP_PHC">PHC Software</option>
                    <option value="Academico_Proprio">Sistema Académico Próprio</option>
                    <option value="Outro">Outro Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Ambiente</label>
                  <select
                    value={newKeyEnv}
                    onChange={e => setNewKeyEnv(e.target.value as 'production' | 'sandbox')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="production">Produção (Live)</option>
                    <option value="sandbox">Sandbox (Testes)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Permissões e Escopos Granulares</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'certificates:register', label: 'Registrar Certificado' },
                    { id: 'certificates:verify', label: 'Verificar Certificado' },
                    { id: 'certificates:status', label: 'Consultar Status' },
                    { id: 'certificates:qr', label: 'Gerar QR Code' },
                    { id: 'certificates:url', label: 'Obter URL Pública' },
                    { id: 'certificates:validate_hash', label: 'Validar Hash' },
                  ].map(item => {
                    const isChecked = newKeyScopes.includes(item.id as SivecConnectScope);
                    return (
                      <label key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setNewKeyScopes(newKeyScopes.filter(s => s !== item.id));
                            } else {
                              setNewKeyScopes([...newKeyScopes, item.id as SivecConnectScope]);
                            }
                          }}
                          className="rounded text-sky-500 focus:ring-0"
                        />
                        <span className="text-[11px] font-mono">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Limite de Requisições (Rate Limit / min)</label>
                <input
                  type="number"
                  value={newKeyRateLimit}
                  onChange={e => setNewKeyRateLimit(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Gerar Chave de Integração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
