import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Permission, 
  toCanonicalRole, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  ROLE_DEFINITIONS,
  RoleDefinition,
  CanonicalRole
} from '../types/rbac';

export function useRBAC() {
  const { activeRole } = useApp();
  const canonicalRole = toCanonicalRole(activeRole);
  const roleDefinition = ROLE_DEFINITIONS[canonicalRole];

  return {
    activeRole,
    canonicalRole,
    roleDefinition,
    hasPermission: (p: Permission) => hasPermission(activeRole, p),
    hasAnyPermission: (ps: Permission[]) => hasAnyPermission(activeRole, ps),
    hasAllPermissions: (ps: Permission[]) => hasAllPermissions(activeRole, ps),
    isSuperAdmin: canonicalRole === 'SUPER_ADMIN',
    isAdmin: canonicalRole === 'SUPER_ADMIN' || canonicalRole === 'ADMIN_INSTITUICAO' || canonicalRole === 'DIRETOR',
    isSecretaria: canonicalRole === 'SECRETARIA',
    isFinanceiro: canonicalRole === 'FINANCEIRO',
    isDocente: canonicalRole === 'PROFESSOR' || canonicalRole === 'FORMADOR',
    isPorteiro: canonicalRole === 'PORTEIRO',
    isAluno: canonicalRole === 'ALUNO',
    isResponsavel: canonicalRole === 'RESPONSAVEL',
    isEmpresa: canonicalRole === 'EMPRESA'
  };
}

interface PermissionGateProps {
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  children
}) => {
  const { hasPermission: checkPerm, hasAnyPermission: checkAny, hasAllPermissions: checkAll } = useRBAC();

  if (permission && !checkPerm(permission)) {
    return <>{fallback}</>;
  }

  if (anyPermissions && anyPermissions.length > 0 && !checkAny(anyPermissions)) {
    return <>{fallback}</>;
  }

  if (allPermissions && allPermissions.length > 0 && !checkAll(allPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
