import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Institution } from '../../types';
import { resolveInstitutionIdentity } from '../../utils/institutionIdentity';

interface InstitutionLogoBadgeProps {
  institution?: Partial<Institution> | null;
  preferEmblem?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  alt?: string;
}

const SIZE_CLASSES: Record<NonNullable<InstitutionLogoBadgeProps['size']>, string> = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-lg',
};

const ROUNDED_CLASSES: Record<NonNullable<InstitutionLogoBadgeProps['rounded']>, string> = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const InstitutionLogoBadge: React.FC<InstitutionLogoBadgeProps> = ({
  institution,
  preferEmblem = false,
  size = 'sm',
  rounded = 'xl',
  className = '',
  alt,
}) => {
  const identity = resolveInstitutionIdentity(institution);
  const src = preferEmblem
    ? identity.emblemUrl || identity.logoUrl
    : identity.logoUrl || identity.emblemUrl;
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src, identity.id]);

  const sizeClass = SIZE_CLASSES[size];
  const roundedClass = ROUNDED_CLASSES[rounded];

  if (src && !imgError) {
    return (
      <div
        className={`${sizeClass} ${roundedClass} bg-white/95 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-0.5 ${className}`}
      >
        <img
          src={src}
          alt={alt || identity.officialName}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (!identity.hasInstitution) {
    return (
      <div
        className={`${sizeClass} ${roundedClass} bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 ${className}`}
        title="Sem instituição ativa"
      >
        <Building2 className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} ${roundedClass} flex items-center justify-center shrink-0 font-black tracking-tight text-white shadow-sm border border-white/20 select-none ${className}`}
      style={{
        backgroundColor: identity.colors.primary,
      }}
      title={identity.officialName}
    >
      {identity.initials}
    </div>
  );
};
