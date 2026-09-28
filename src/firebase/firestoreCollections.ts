/**
 * Multi-Tenant Firestore Collection Schemas
 * 
 * Enforces institutionId and branchId segregation across all collections:
 * - students
 * - courses
 * - classes (turmas)
 * - payments & cashbox (caixa)
 * - certificates
 * - attendance
 * - contracts
 * - audit_logs
 */

export const FIRESTORE_COLLECTIONS = {
  INSTITUTIONS: 'institutions',
  BRANCHES: 'branches',
  USERS: 'users',
  STUDENTS: 'students',
  COURSES: 'courses',
  CLASSES: 'classes',
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  CERTIFICATES: 'certificates',
  SIGNATURES: 'signatures',
  STUDIO_TEMPLATES: 'studio_templates',
  CALENDAR_EVENTS: 'calendar_events',
  COMMUNICATION_MESSAGES: 'communication_messages',
  AUDIT_LOGS: 'audit_logs',
  SIVEC_CREDENTIALS: 'sivec_credentials',
  INTEGRATION_SETTINGS: 'integration_settings'
} as const;

export function getTenantCollectionPath(institutionId: string, collection: string): string {
  return `institutions/${institutionId}/${collection}`;
}

export function getBranchCollectionPath(institutionId: string, branchId: string, collection: string): string {
  return `institutions/${institutionId}/branches/${branchId}/${collection}`;
}
