/**
 * Multi-Institution and Multi-Branch (Filial) Context Manager
 * 
 * Guarantees strict data isolation between institutions and campuses.
 * Every query, creation, update, and audit log must carry institutionId and branchId.
 */

import { Branch } from '../types';

export interface TenantContextState {
  currentInstitutionId: string;
  currentInstitutionName: string;
  currentBranchId: string;
  currentBranchName: string;
  isMainBranch: boolean;
  availableBranches: Branch[];
}

const STORAGE_KEY_TENANT = 'sigar_tenant_context';

export const DEFAULT_TENANT_CONTEXT: TenantContextState = {
  currentInstitutionId: '',
  currentInstitutionName: '',
  currentBranchId: 'todas',
  currentBranchName: '',
  isMainBranch: true,
  availableBranches: []
};

export class TenantManager {
  private static instance: TenantManager;
  private state: TenantContextState;
  private listeners: ((state: TenantContextState) => void)[] = [];

  private constructor() {
    this.state = this.loadFromStorage();
  }

  public static getInstance(): TenantManager {
    if (!TenantManager.instance) {
      TenantManager.instance = new TenantManager();
    }
    return TenantManager.instance;
  }

  private loadFromStorage(): TenantContextState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TENANT);
      if (stored) {
        return { ...DEFAULT_TENANT_CONTEXT, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return { ...DEFAULT_TENANT_CONTEXT };
  }

  private persist(): void {
    try {
      if (!this.state.currentInstitutionId) {
        localStorage.removeItem(STORAGE_KEY_TENANT);
      } else {
        localStorage.setItem(STORAGE_KEY_TENANT, JSON.stringify(this.state));
      }
    } catch {
      // storage quota or private mode
    }
    this.notifyListeners();
  }

  public getState(): TenantContextState {
    return { ...this.state };
  }

  public getTenantFilter(): { institutionId: string; branchId?: string } {
    return {
      institutionId: this.state.currentInstitutionId,
      branchId: this.state.currentBranchId
    };
  }

  public switchBranch(branchId: string): boolean {
    const target = this.state.availableBranches.find(b => b.id === branchId);
    if (!target) return false;

    this.state = {
      ...this.state,
      currentBranchId: target.id,
      currentBranchName: target.name,
      isMainBranch: target.isMainBranch
    };
    this.persist();
    return true;
  }

  public switchInstitution(institutionId: string, institutionName: string, branches: Branch[]): void {
    const mainBranch = branches.find(b => b.isMainBranch) || branches[0];
    this.state = {
      currentInstitutionId: institutionId,
      currentInstitutionName: institutionName,
      currentBranchId: mainBranch ? mainBranch.id : 'todas',
      currentBranchName: mainBranch ? mainBranch.name : 'Todas as Filiais',
      isMainBranch: mainBranch ? mainBranch.isMainBranch : true,
      availableBranches: branches
    };
    this.persist();
  }

  public clear(): void {
    this.state = { ...DEFAULT_TENANT_CONTEXT };
    this.persist();
  }

  public subscribe(listener: (state: TenantContextState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l(this.getState()));
  }
}

export const tenantManager = TenantManager.getInstance();
