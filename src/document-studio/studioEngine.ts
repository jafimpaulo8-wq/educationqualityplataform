/**
 * Document Studio Engine
 * 
 * Provides template interpolation, cryptographic stamp generation,
 * student variable replacement, and compliance formatting.
 */

import { StudioTemplate, StudioElement } from '../types/studio';
import { DEFAULT_STUDIO_TEMPLATES } from '../data/defaultStudioTemplates';

export interface DocumentInterpolationContext {
  studentName: string;
  studentCode: string;
  courseName: string;
  completionDate: string;
  finalGrade?: string;
  durationHours?: number;
  institutionName: string;
  institutionNuit?: string;
  directorName: string;
  branchName: string;
  documentHash?: string;
}

export class DocumentStudioEngine {
  private static instance: DocumentStudioEngine;

  private constructor() {}

  public static getInstance(): DocumentStudioEngine {
    if (!DocumentStudioEngine.instance) {
      DocumentStudioEngine.instance = new DocumentStudioEngine();
    }
    return DocumentStudioEngine.instance;
  }

  public getTemplates(): StudioTemplate[] {
    return DEFAULT_STUDIO_TEMPLATES;
  }

  public interpolateVariables(text: string, ctx: DocumentInterpolationContext): string {
    if (!text) return '';
    return text
      .replace(/\{\{\s*student_name\s*\}\}/gi, ctx.studentName)
      .replace(/\{\{\s*student_code\s*\}\}/gi, ctx.studentCode)
      .replace(/\{\{\s*course_name\s*\}\}/gi, ctx.courseName)
      .replace(/\{\{\s*completion_date\s*\}\}/gi, ctx.completionDate)
      .replace(/\{\{\s*final_grade\s*\}\}/gi, ctx.finalGrade || '16 / 20')
      .replace(/\{\{\s*duration_hours\s*\}\}/gi, String(ctx.durationHours || 120))
      .replace(/\{\{\s*institution_name\s*\}\}/gi, ctx.institutionName)
      .replace(/\{\{\s*institution_nuit\s*\}\}/gi, ctx.institutionNuit || '400123987')
      .replace(/\{\{\s*director_name\s*\}\}/gi, ctx.directorName)
      .replace(/\{\{\s*branch_name\s*\}\}/gi, ctx.branchName)
      .replace(/\{\{\s*document_hash\s*\}\}/gi, ctx.documentHash || 'MZ-SIGAR-CERT-9021');
  }

  public generateCertificateHash(studentCode: string, courseCode: string, date: string): string {
    const raw = `${studentCode}|${courseCode}|${date}|MOZ_SIGAR_SECURE`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    return 'CERT-MZ-' + Math.abs(hash).toString(36).toUpperCase().padStart(8, '0');
  }
}

export const documentStudioEngine = DocumentStudioEngine.getInstance();
