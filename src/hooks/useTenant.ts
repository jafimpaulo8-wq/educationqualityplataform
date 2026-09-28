import { useState, useEffect } from 'react';
import { tenantManager, TenantContextState } from '../auth/tenantContext';

export function useTenant(): TenantContextState & {
  switchBranch: (branchId: string) => boolean;
} {
  const [state, setState] = useState<TenantContextState>(tenantManager.getState());

  useEffect(() => {
    const unsubscribe = tenantManager.subscribe(setState);
    return () => unsubscribe();
  }, []);

  return {
    ...state,
    switchBranch: (branchId: string) => tenantManager.switchBranch(branchId)
  };
}
