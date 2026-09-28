import { Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

/**
 * Vite Plugin that mounts server-side API endpoints for Moztechwave AI.
 * Uses @google/genai strictly on the server with model 'gemini-3.8-flash'
 * and the required User-Agent telemetry header.
 */
export function moztechwaveAiPlugin(): Plugin {
  return {
    name: 'vite-plugin-moztechwave-ai',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        if (url === '/api/ai/chat' && req.method === 'POST') {
          try {
            const body = await readJsonBody(req);
            const { prompt, userRole, institutionalContext, conversationHistory } = body;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ 
                success: false, 
                error: 'Chave GEMINI_API_KEY não configurada no servidor',
                fallbackToLocal: true 
              }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                }
              }
            });

            const systemInstruction = `Você é o MOZTECHWAVE AI, Assistente Interno de Inteligência Artificial da Moztechwave Education Platform (SIGAR / SIVEC), sistema de gestão escolar e acadêmica em Moçambique.
Você interage com o utilizador cujo papel institucional atual é: "${userRole || 'Utilizador'}".

DIRETIVAS CRÍTICAS DE SEGURANÇA E RBAC (Role-Based Access Control):
1. A IA NUNCA DEVE IGNORAR PERMISSÕES.
2. Se o utilizador tiver perfil de ALUNO, ENCARREGADO ou perfil operacional sem autorização e pedir para:
   - "Põe notas", alterar notas, lançar avaliações ou falsificar médias;
   - Modificar dados financeiros ou alterar valores de faturas/propinas;
   - Consultar lista geral de alunos devedores/inadimplentes ou dados privados de outros alunos;
   - Excluir ou transferir turmas;
   VOCÊ DEVE NEGAR TERMINANTEMENTE a operação, informando:
   "Acesso Negado: O seu perfil (${userRole}) não possui permissão para esta operação acadêmica/financeira. Operação auditada e bloqueada pelo protocolo de segurança RBAC da Moztechwave AI."
3. Se o utilizador for SUPER ADMIN, DIRETOR, SECRETARIA ou PEDAGÓGICO e tiver permissões adequadas:
   - Atenda prontamente a pedidos como "Quantos alunos estão inadimplentes?", "Quais alunos terminam o curso este mês?", "Qual curso tem mais alunos?", "Mostra os pagamentos pendentes.", "Cria um comunicado.", "Cria uma declaração.", "Analisa este certificado.", "Resume esta pauta.".
   - Se os dados institucionais forem fornecidos no contexto, use-os com precisão matemática.
4. Tom de resposta: Profissional, institucional, caloroso e focado em Moçambique (MZN, Províncias de Moçambique, ANEP, DINET, termos como propinas, encarregado de educação, pauta homologada, etc.).`;

            const contents: any[] = [];
            
            // Adicionar contexto do sistema se presente
            if (institutionalContext) {
              contents.push({
                text: `[DADOS INSTITUCIONAIS ATUAIS DO SISTEMA]:\n${JSON.stringify(institutionalContext, null, 2)}`
              });
            }

            // Histórico recente
            if (Array.isArray(conversationHistory)) {
              for (const item of conversationHistory.slice(-6)) {
                contents.push({ text: `${item.role === 'user' ? 'Utilizador' : 'Assistente'}: ${item.text}` });
              }
            }

            contents.push({ text: `Pergunta/Comando do Utilizador (${userRole}): ${prompt}` });

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents,
              config: {
                systemInstruction,
                temperature: 0.3,
              }
            });

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              text: response.text || '',
              source: 'gemini-3.8-flash'
            }));
            return;
          } catch (error: any) {
            console.error('[MoztechwaveAI] Erro no /api/ai/chat:', error);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: false,
              error: error?.message || 'Erro ao processar requisição com a IA',
              fallbackToLocal: true
            }));
            return;
          }
        }

        if (url === '/api/ai/extract-doc' && req.method === 'POST') {
          try {
            const body = await readJsonBody(req);
            const { fileData, mimeType, fileName, userRole } = body;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ 
                success: false, 
                error: 'Chave GEMINI_API_KEY não configurada no servidor',
                fallbackToLocal: true 
              }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                }
              }
            });

            const parts: any[] = [];

            // Se for base64
            if (fileData && fileData.includes('base64,')) {
              const base64Data = fileData.split('base64,')[1];
              const detectedMime = mimeType || (fileData.split(';')[0].replace('data:', ''));
              parts.push({
                inlineData: {
                  mimeType: detectedMime.includes('pdf') ? 'application/pdf' : detectedMime,
                  data: base64Data
                }
              });
            } else if (fileData) {
              parts.push({ text: `Conteúdo extraído do documento (${fileName || 'documento'}):\n${fileData}` });
            }

            parts.push({
              text: `Analise cuidadosamente este documento (BI de Moçambique, Ficha de Inscrição, Histórico Escolar ou Certificado) para cadastramento escolar.
Extraia e deduza todos os dados possíveis.
Responda EXCLUSIVAMENTE em JSON válido com esta estrutura exata:
{
  "fullName": "Nome Completo do Aluno",
  "documentType": "BI" ou "Passaporte" ou "DIRE",
  "documentNumber": "Número do BI ou Documento",
  "birthDate": "AAAA-MM-DD",
  "gender": "Masculino" ou "Feminino",
  "phone": "Telefone de contato no formato +258...",
  "email": "Email do formando ou responsável",
  "province": "Província (ex: Maputo, Sofala, Nampula, Cabo Delgado, Tete, Manica, etc.)",
  "city": "Cidade ou Distrito",
  "neighborhood": "Bairro",
  "address": "Endereço residencial",
  "courseName": "Curso pretendido ou identificado no documento",
  "guardianName": "Nome do Encarregado de Educação se houver",
  "guardianPhone": "Telefone do Encarregado se houver",
  "emergencyContact": "Contato de emergência",
  "confidenceScore": 95,
  "notes": "Observações notariais ou detalhes do documento extraído"
}`
            });

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: { parts },
              config: {
                responseMimeType: 'application/json'
              }
            });

            let extractedData: any = null;
            try {
              extractedData = JSON.parse(response.text || '{}');
            } catch (pErr) {
              console.warn('Falha ao parsear JSON da IA:', pErr);
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              data: extractedData,
              rawText: response.text,
              source: 'gemini-3.8-flash'
            }));
            return;
          } catch (error: any) {
            console.error('[MoztechwaveAI] Erro no /api/ai/extract-doc:', error);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: false,
              error: error?.message || 'Erro ao extrair dados do documento com a IA',
              fallbackToLocal: true
            }));
            return;
          }
        }

        next();
      });
    }
  };
}

function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
      // Limite razoável de payload para uploads em base64 (25MB)
      if (data.length > 25 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}
