import { SivecStudioDocumentRecord, SivecStudioExtractedData } from './types';
import { calculateSha256, generateSvgQrCode, svgToDataUrl, getCanonicalVerifyBaseUrl } from '../../services/sivecConnectApi';
import { SIVEC_LEGAL_MANDATE } from './mockSivecData';

const STUDIO_STORAGE_KEY = 'sivec_studio_documents_v1';

export const SIVEC_VISUAL_PRESERVATION_DISCLAIMER = 
  'A preservação visual é aproximada quando tecnicamente possível. Nunca prometemos cópia byte-a-byte idêntica da arte gráfica original, pois a Versão SIVEC incorpora elementos notariais de soberania digital, carimbo de tempo TSA, QR Code de validação instantânea e chancelas de autenticidade.';

export const SAMPLE_STUDIO_TEMPLATES = [
  {
    id: 'sample-ipta-eng',
    title: 'Certificado de Conclusão • Engenharia e Cloud (IPTA)',
    fileName: 'Certificado_Conclusao_Engenharia_IPTA_2026.pdf',
    fileSizeKb: 342,
    extracted: {
      studentName: 'ARMANDO FRANCISCO NHANTUMBO',
      courseName: 'Engenharia de Infraestruturas de TI, Cloud & DevOps',
      certificateNumber: 'CERT-IPTA-2026-08819',
      issueDate: '15/01/2026',
      institutionName: 'Instituto Politécnico e Tecnológico de Maputo - IPTA',
      durationHours: 1400,
      studentDocument: 'BI nº 100293817290B',
      studentId: 'AL-2026-08819',
      finalGrade: '19 Valores (Summa Cum Laude)',
      academicLevel: 'Nível 5 - Especialização Tecnológica',
      institutionNuit: '400891234',
      bookNumber: 'L-04/TEC',
      sheetNumber: 'Fl. 88',
      entryNumber: 'Assento nº 1042',
      confidence: {
        studentName: 99,
        courseName: 98,
        certificateNumber: 97,
        issueDate: 100,
        institutionName: 99,
        durationHours: 96
      },
      rawExtractedTextSnippet: 'INSTITUTO POLITÉCNICO E TECNOLÓGICO DE MAPUTO (IPTA)\nCERTIFICA-SE QUE ARMANDO FRANCISCO NHANTUMBO, PORTADOR DO BI Nº 100293817290B, CONCLUIU COM ÊXITO O CURSO DE ENGENHARIA DE INFRAESTRUTURAS DE TI, CLOUD & DEVOPS, COM A CARGA HORÁRIA TOTAL DE 1400 HORAS LETIVAS.'
    }
  },
  {
    id: 'sample-softgenial-contab',
    title: 'Diploma Técnico • Contabilidade & Fiscalidade (SoftGenial)',
    fileName: 'Diploma_Qualificacao_SoftGenial_Contabilidade.pdf',
    fileSizeKb: 285,
    extracted: {
      studentName: 'ZULMIRA ALBERTO MUSSANE',
      courseName: 'Contabilidade Bancária, Fiscalidade Aplicada & ERP Primavera',
      certificateNumber: 'DIP-SG-2026-4401',
      issueDate: '02/02/2026',
      institutionName: 'Centro de Formação e Competências Profissionais SoftGenial',
      durationHours: 900,
      studentDocument: 'BI nº 110938472910G',
      studentId: 'SG-AL-2026-4401',
      finalGrade: '17 Valores (Aprovado com Mérito)',
      academicLevel: 'Nível 4 - Técnico Médio',
      institutionNuit: '400998811',
      bookNumber: 'L-02/SG',
      sheetNumber: 'Fl. 18',
      entryNumber: 'Assento nº 0842',
      confidence: {
        studentName: 98,
        courseName: 97,
        certificateNumber: 95,
        issueDate: 99,
        institutionName: 98,
        durationHours: 95
      },
      rawExtractedTextSnippet: 'CENTRO DE FORMAÇÃO E COMPETÊNCIAS PROFISSIONAIS SOFTGENIAL\nCONFERE O PRESENTE DIPLOMA A ZULMIRA ALBERTO MUSSANE PELA CONCLUSÃO DO CURSO TÉCNICO DE CONTABILIDADE BANCÁRIA, FISCALIDADE APLICADA & ERP PRIMAVERA, PERFAZENDO 900 HORAS.'
    }
  },
  {
    id: 'sample-instituto-industrial',
    title: 'Certificado de Habilitação • Automação e Redes Industriais',
    fileName: 'Certificado_Automacao_Industrial_Maputo_2026.pdf',
    fileSizeKb: 410,
    extracted: {
      studentName: 'MATEUS AGOSTINHO TAMELE',
      courseName: 'Técnico Médio em Automação Industrial e Redes de Controle',
      certificateNumber: 'CERT-IIM-2026-0312',
      issueDate: '10/03/2026',
      institutionName: 'Instituto Industrial de Maputo - IIM',
      durationHours: 1250,
      studentDocument: 'BI nº 100998234101F',
      studentId: 'IIM-2026-9912',
      finalGrade: '18 Valores (Distinção)',
      academicLevel: 'Nível 4 - Técnico Industrial',
      institutionNuit: '400551122',
      bookNumber: 'L-08/IND',
      sheetNumber: 'Fl. 45',
      entryNumber: 'Assento nº 0312',
      confidence: {
        studentName: 97,
        courseName: 99,
        certificateNumber: 96,
        issueDate: 98,
        institutionName: 99,
        durationHours: 98
      },
      rawExtractedTextSnippet: 'REPÚBLICA DE MOÇAMBIQUE • INSTITUTO INDUSTRIAL DE MAPUTO\nCERTIFICADO DE HABILITAÇÃO PROFISSIONAL CONCEDIDO A MATEUS AGOSTINHO TAMELE NO CURSO DE AUTOMAÇÃO INDUSTRIAL E REDES DE CONTROLE COM DURAÇÃO DE 1250 HORAS.'
    }
  }
];

export const INITIAL_STUDIO_DOCUMENTS: SivecStudioDocumentRecord[] = [
  {
    id: 'studio-doc-sample-1',
    uploadedAt: '15/01/2026 10:25',
    fileName: 'Certificado_Conclusao_Engenharia_IPTA_2026.pdf',
    fileSizeKb: 342,
    mimeType: 'application/pdf',
    
    // 1. ORIGINAL PRESERVADO INTACTO (NUNCA SOBRESCRITO)
    original: {
      rawText: 'INSTITUTO POLITÉCNICO E TECNOLÓGICO DE MAPUTO (IPTA)\nCERTIFICA-SE QUE ARMANDO FRANCISCO NHANTUMBO CONCLUIU O CURSO DE ENGENHARIA DE INFRAESTRUTURAS DE TI, CLOUD & DEVOPS.',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      capturedAt: '15/01/2026 10:25:12 UTC',
      preservedNotice: 'ORIGINAL PRESERVADO INTACTO (NUNCA SOBRESCRITO)'
    },

    // 2, 3 e 4. DADOS ANALISADOS E IDENTIFICADOS
    extracted: {
      studentName: 'ARMANDO FRANCISCO NHANTUMBO',
      courseName: 'Engenharia de Infraestruturas de TI, Cloud & DevOps',
      certificateNumber: 'CERT-IPTA-2026-08819',
      issueDate: '15/01/2026',
      institutionName: 'Instituto Politécnico e Tecnológico de Maputo - IPTA',
      durationHours: 1400,
      studentDocument: 'BI nº 100293817290B',
      studentId: 'AL-2026-08819',
      finalGrade: '19 Valores (Summa Cum Laude)',
      academicLevel: 'Nível 5 - Especialização Tecnológica',
      institutionNuit: '400891234',
      bookNumber: 'L-04/TEC',
      sheetNumber: 'Fl. 88',
      entryNumber: 'Assento nº 1042',
      confidence: {
        studentName: 99,
        courseName: 98,
        certificateNumber: 97,
        issueDate: 100,
        institutionName: 99,
        durationHours: 96
      },
      rawExtractedTextSnippet: 'INSTITUTO POLITÉCNICO E TECNOLÓGICO DE MAPUTO (IPTA) • LIVRO L-04/TEC FOLHA 88 ASSENTO 1042'
    },

    // 5. REVISÃO HUMANA REALIZADA
    humanReview: {
      reviewed: true,
      reviewedBy: 'Dra. Helena Sitoe',
      reviewedRole: 'Oficial de Registo Notarial Académico',
      reviewedAt: '15/01/2026 10:28:40',
      isApproved: true,
      notes: 'Dados conferidos com a pauta institucional e documento de identidade física. Aprovado para chancela SIVEC.',
      fieldsModified: []
    },

    // 6. REGISTRADO NO SIVEC
    registration: {
      sivecCode: 'SIVEC-MZ-2026-8819',
      uniqueCertificateId: 'MZ-SIVEC-CERT-2026-008819-A1',
      registeredAt: '15/01/2026 10:30',
      status: 'ATIVO',
      registryEntryId: 'sivec-001',
      sha256Hash: 'a8f5c490e12d3b7890a5f6e872c91a04b32198cd65fe123456789abcdef01234'
    },

    // 7, 8 e 9. VERSÃO SIVEC GERADA
    sivecVersion: {
      generatedAt: '15/01/2026 10:30:15',
      qrDataUrl: '', // Preenchido dinamicamente se necessário
      publicVerifyUrl: 'https://sivec.moztechwave.co.mz/verify/SIVEC-MZ-2026-8819',
      securityStampId: 'SEAL-MZ-SIVEC-2026-NOTARY-8819',
      visualPreservationNotice: SIVEC_VISUAL_PRESERVATION_DISCLAIMER,
      layoutStyle: 'tech_academic'
    },

    stage: 'registered_and_generated'
  }
];

/**
 * Obtém a lista de documentos do SIVEC STUDIO do localStorage
 */
export function getStudioDocuments(): SivecStudioDocumentRecord[] {
  if (typeof window === 'undefined') return INITIAL_STUDIO_DOCUMENTS;
  try {
    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(INITIAL_STUDIO_DOCUMENTS));
      return INITIAL_STUDIO_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Erro ao ler documentos do SIVEC STUDIO:', e);
  }
  return INITIAL_STUDIO_DOCUMENTS;
}

/**
 * Salva a lista de documentos no localStorage
 */
export function saveStudioDocuments(docs: SivecStudioDocumentRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new CustomEvent('sivec_studio_updated', { detail: docs }));
  } catch (e) {
    console.error('Erro ao salvar documentos do SIVEC STUDIO:', e);
  }
}

/**
 * Salva ou atualiza um documento específico no repositório do SIVEC STUDIO
 */
export function saveStudioDocument(doc: SivecStudioDocumentRecord): void {
  const docs = getStudioDocuments();
  const existingIdx = docs.findIndex(d => d.id === doc.id);
  let updated: SivecStudioDocumentRecord[];
  if (existingIdx >= 0) {
    updated = [...docs];
    updated[existingIdx] = doc;
  } else {
    updated = [doc, ...docs];
  }
  saveStudioDocuments(updated);
}

/**
 * Deleta um documento do Studio
 */
export function deleteStudioDocument(id: string): void {
  const docs = getStudioDocuments();
  const updated = docs.filter(d => d.id !== id);
  saveStudioDocuments(updated);
}
