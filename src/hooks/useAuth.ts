import { useState, useEffect } from 'react';
import { authService, AuthenticatedUser } from '../auth/authService';
import { Permission, UserRole } from '../types/rbac';

export function useAuth() {
  const [user, setUser] = useState<AuthenticatedUser | null>(authService.getUser());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setUser);
    return () => unsubscribe();
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    isSuperAdmin: authService.isSuperAdmin(),
    can: (permission: Permission) => authService.can(permission),
    setUserRole: (role: UserRole) => authService.setUserRole(role),
    logout: () => authService.logout()
  };
}
