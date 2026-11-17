/**
 * SIGAR PRO — PublicCoursesPortal
 * Catálogo e portal público de cursos e oferta formativa com isolamento por instituição.
 * Sem números fixos (removido qualquer 258870091596 ou 864826647).
 * O botão "Saber mais" usa o WhatsApp validado internacional da instituição do portal aberto.
 * Se a instituição não tiver número configurado, o botão fica estritamente oculto.
 */

import React from 'react';
import { PublicPortalLanding } from '../../components/public/PublicPortalLanding';

interface PublicCoursesPortalProps {
  onOpenAuthModal?: () => void;
  onOpenPublicVerify?: () => void;
  onOpenOnlineRegistration?: (courseName?: string) => void;
  onOpenRegisterInstitution?: () => void;
  onOpenHelp?: () => void;
}

export const PublicCoursesPortal: React.FC<PublicCoursesPortalProps> = ({
  onOpenAuthModal = () => {},
  onOpenPublicVerify = () => {},
  onOpenOnlineRegistration,
  onOpenRegisterInstitution = () => {},
  onOpenHelp = () => {},
}) => {
  return (
    <PublicPortalLanding
      onOpenAuthModal={onOpenAuthModal}
      onOpenPublicVerify={onOpenPublicVerify}
      onOpenOnlineRegistration={onOpenOnlineRegistration}
      onOpenRegisterInstitution={onOpenRegisterInstitution}
      onOpenHelp={onOpenHelp}
    />
  );
};

export default PublicCoursesPortal;
