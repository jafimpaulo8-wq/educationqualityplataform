/**
 * SIGAR PRO — PublicEnrollmentPage
 * Página pública autónoma de candidatura e inscrição online isolada por instituição (slug).
 * Integração direta com Firestore:
 * - institutions/{id}/applications
 * - applicationTracking/{token}
 * Campo 'slug' incluído, status 'submetida', createdAt como serverTimestamp().
 * Na criação NÃO inclui matricula, studentId nem approved.
 * O acompanhamento público é rigorosamente isento de PII (BI, telefone, morada, email, fotografia).
 * Sem números fixos ou reservas. Botão "Saber mais" usa o WhatsApp validado internacional da instituição (oculto se sem número).
 */

import React from 'react';
import { PublicRegistrationView } from './PublicRegistrationView';

export const PublicEnrollmentPage: React.FC = () => {
  return <PublicRegistrationView />;
};

export default PublicEnrollmentPage;
