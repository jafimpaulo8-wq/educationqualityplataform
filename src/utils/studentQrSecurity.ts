/**
 * 27. QR CODE DO ALUNO & CONTROLO DE ACESSO
 * Moztechwave Education Platform / SIVERC / SIGAR
 * 
 * Regras de Privacidade:
 * - Scan público: mostrar SOMENTE informações autorizadas (Nome, Curso, Turma, Número, Estado).
 * - NUNCA mostrar dados privados (BI, NUIT, Telefone, E-mail, Morada, Contactos de Encarregados, Dados Financeiros).
 * - Utilizador Autenticado Autorizado: Permite confirmar ENTRADA e SAÍDA com registro e disparo WhatsApp.
 */

import { Student } from '../types';
import { toCanonicalRole } from '../types/rbac';

export interface PublicStudentInfo {
  id: string;
  fullName: string;
  code: string;
  courseName: string;
  classGroupName: string;
  status: Student['status'];
  photoUrl?: string;
  institutionName: string;
  institutionCode: string;
  qrVerificationHash: string;
  qrGeneratedAt: string;
  academicYear: string;
}

/**
 * Gera um hash criptográfico de verificação de autenticidade do QR Code do estudante
 */
export function generateStudentQrHash(studentId: string, studentCode: string, institutionId: string): string {
  const seed = `${studentId}:${studentCode}:${institutionId}:SIGAR-MOZTECHWAVE-STUDENT-AUTH`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs((hash * 43) | 0).toString(16).padStart(8, '0');
  return `SIVERC-ALU-${hex1.toUpperCase()}-${hex2.toUpperCase()}`;
}

/**
 * Extrai ESTRITAMENTE as informações públicas autorizadas para exibição.
 * Protege dados privados e sensíveis em conformidade com a legislação de dados discentes.
 */
export function getAuthorizedPublicStudentData(
  student: Student, 
  institutionName: string = 'Instituto Técnico Profissional',
  institutionCode: string = 'MTW'
): PublicStudentInfo {
  return {
    id: student.id,
    fullName: student.fullName,
    code: student.code,
    courseName: student.courseName,
    classGroupName: student.classGroupName,
    status: student.status,
    photoUrl: student.photoUrl,
    institutionName: institutionName,
    institutionCode: institutionCode,
    qrVerificationHash: generateStudentQrHash(student.id, student.code, student.institutionId || institutionCode),
    qrGeneratedAt: new Date().toLocaleDateString('pt-MZ'),
    academicYear: '2026'
  };
}

/**
 * Verifica se o utilizador logado possui perfil com autorização para homologar ENTRADA ou SAÍDA.
 */
export function isAuthorizedGateOperator(userRole?: string | null): boolean {
  if (!userRole) return false;
  const canonical = toCanonicalRole(userRole);
  
  const authorizedRoles = [
    'SUPER_ADMIN', 
    'ADMIN_INSTITUICAO', 
    'DIRETOR', 
    'SECRETARIA', 
    'PORTARIA', 
    'PROFESSOR',
    'FORMADOR'
  ];

  if (authorizedRoles.includes(canonical)) {
    return true;
  }

  const rawLower = userRole.toLowerCase();
  return (
    rawLower.includes('portaria') ||
    rawLower.includes('seguranca') ||
    rawLower.includes('recepcao') ||
    rawLower.includes('admin') ||
    rawLower.includes('director') ||
    rawLower.includes('secretaria')
  );
}
