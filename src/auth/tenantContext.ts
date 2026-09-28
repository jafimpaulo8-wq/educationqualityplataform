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
  currentInstitutionId: 'inst_cftpm_01',
  currentInstitutionName: 'Centro de Formação Técnica Profissional de Moçambique (CFTPM)',
  currentBranchId: 'branch_sede_maputo',
  currentBranchName: 'Sede Central (Maputo)',
  isMainBranch: true,
  availableBranches: [
    {
      id: 'branch_sede_maputo',
      institutionId: 'inst_cftpm_01',
      name: 'Sede Central (Maputo)',
      code: 'MAP-01',
      phone: '+258 84 123 4567',
      email: 'sede@cftpm.co.mz',
      address: 'Av. Eduardo Mondlane, nº 1450, Maputo',
      city: 'Maputo',
      province: 'Maputo Cidade',
      directorName: 'Dr. Alberto Mondlane',
      isMainBranch: true,
      createdAt: '2024-01-10T08:00:00Z'
    },
    {
      id: 'branch_matola_01',
      institutionId: 'inst_cftpm_01',
      name: 'Delegação Matola',
      code: 'MAT-02',
      phone: '+258 84 987 6543',
      email: 'matola@cftpm.co.mz',
      address: 'Av. da União Africana, Matola 700',
      city: 'Matola',
      province: 'Maputo Província',
      directorName: 'Eng. Luísa Cossa',
      isMainBranch: false,
      createdAt: '2024-03-15T09:30:00Z'
    },
    {
      id: 'branch_beira_01',
      institutionId: 'inst_cftpm_01',
      name: 'Campus Beira (Sofala)',
      code: 'BEI-03',
      phone: '+258 82 555 1212',
      email: 'beira@cftpm.co.mz',
      address: 'Rua do Macúti, Bairro do Chaimite',
      city: 'Beira',
      province: 'Sofala',
      directorName: 'Prof. Mateus Tembe',
      isMainBranch: false,
      createdAt: '2024-06-01T10:00:00Z'
    }
  ]
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
    return DEFAULT_TENANT_CONTEXT;
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_TENANT, JSON.stringify(this.state));
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
      currentBranchId: mainBranch ? mainBranch.id : 'default_branch',
      currentBranchName: mainBranch ? mainBranch.name : 'Filial Principal',
      isMainBranch: mainBranch ? mainBranch.isMainBranch : true,
      availableBranches: branches
    };
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
