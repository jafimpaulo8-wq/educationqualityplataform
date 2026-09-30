/**
 * Modular Authentication & RBAC Service
 * 
 * Manages user sessions, RBAC permission verification, multi-tenant resolution,
 * and integration with Firebase Auth and local session states.
 */

import { UserRole, Permission, hasPermission } from '../types/rbac';
import { tenantManager } from './tenantContext';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  institutionId: string;
  branchId: string;
  avatarUrl?: string;
  lastLoginAt: string;
  sessionToken: string;
  isSuperAdmin: boolean;
  code?: string;
  status?: string;
  hasSigarProfile?: boolean;
}

export const SUPERADMIN_EMAIL = 'admin-core@moztechwave.co.mz';

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthenticatedUser | null = null;
  private authListeners: ((user: AuthenticatedUser | null) => void)[] = [];
  private unsubscribeFirestoreProfile: (() => void) | null = null;

  private constructor() {
    this.initFirebaseAuthListener();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initFirebaseAuthListener(): void {
    onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (this.unsubscribeFirestoreProfile) {
        this.unsubscribeFirestoreProfile();
        this.unsubscribeFirestoreProfile = null;
      }

      if (!fbUser) {
        this.currentUser = null;
        this.notify();
        return;
      }

      const uid = fbUser.uid;
      const email = fbUser.email || '';
      const isSuper = email === SUPERADMIN_EMAIL;

      // Realtime listener for the Firestore user document /users/{uid}
      const userDocRef = doc(db, 'users', uid);
      this.unsubscribeFirestoreProfile = onSnapshot(userDocRef, async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const rawRoles: UserRole[] = Array.isArray(data.roles) && data.roles.length > 0 
            ? data.roles 
            : (data.role ? [data.role as UserRole] : ['VISITANTE']);

          const userAuthorizedRoles: UserRole[] = isSuper 
            ? (rawRoles.includes('SUPER_ADMIN' as UserRole) ? rawRoles : ['SUPER_ADMIN' as UserRole, ...rawRoles])
            : rawRoles;

          const activeRole: UserRole = isSuper 
            ? ('SUPER_ADMIN' as UserRole) 
            : (userAuthorizedRoles[0] || ('VISITANTE' as UserRole));
          
          this.currentUser = {
            id: uid,
            name: data.displayName || data.name || fbUser.displayName || email.split('@')[0] || 'Utilizador',
            email: email,
            role: activeRole,
            roles: userAuthorizedRoles,
            institutionId: data.institutionId || '',
            branchId: data.branchId || 'todas',
            avatarUrl: fbUser.photoURL || undefined,
            lastLoginAt: data.lastLoginAt || new Date().toISOString(),
            sessionToken: 'fb_token_' + uid,
            isSuperAdmin: isSuper || activeRole === 'SUPER_ADMIN' || userAuthorizedRoles.includes('SUPER_ADMIN'),
            code: data.codigo || data.code,
            status: data.estado || data.status || 'ativo',
            hasSigarProfile: true
          };
          this.notify();
        } else {
          // Document does not exist yet in Firestore
          if (email === 'jafimpaulo8@gmail.com') {
            try {
              const directorProfile = {
                id: uid,
                uid: uid,
                name: 'Jafim Paulo Rupia',
                displayName: 'Jafim Paulo Rupia (Diretor)',
                email: 'jafimpaulo8@gmail.com',
                role: 'DIRETOR' as UserRole,
                roles: ['DIRETOR' as UserRole],
                institutionId: 'ceu-azul-nacala',
                institutionIds: ['ceu-azul-nacala'],
                status: 'aprovado',
                codigoAcesso: 'CEU-AZUL-DIR-001',
                branchId: 'branch-ceu-azul-main',
                createdAt: serverTimestamp(),
                lastLoginAt: new Date().toISOString()
              };
              await setDoc(userDocRef, directorProfile, { merge: true });
            } catch (e) {
              console.warn('Director profile bootstrap warning:', e);
            }
          } else if (email === 'andradaalfred02308@gmail.com') {
            try {
              const ceoProfile = {
                id: uid,
                uid: uid,
                name: 'Alfredo Andrade',
                displayName: 'Alfredo Andrade (CEO)',
                email: 'andradaalfred02308@gmail.com',
                role: 'CEO' as UserRole,
                roles: ['CEO' as UserRole],
                institutionId: 'ceu-azul-nacala',
                institutionIds: ['ceu-azul-nacala'],
                ownedInstitutions: ['ceu-azul-nacala'],
                status: 'aprovado',
                codigoAcesso: 'CEU-AZUL-CEO-001',
                branchId: 'branch-ceu-azul-main',
                createdAt: serverTimestamp(),
                lastLoginAt: new Date().toISOString()
              };
              await setDoc(userDocRef, ceoProfile, { merge: true });
            } catch (e) {
              console.warn('CEO profile bootstrap warning:', e);
            }
          } else if (isSuper) {
            try {
              const rootProfile = {
                id: uid,
                uid: uid,
                name: fbUser.displayName || 'Super Administrador',
                displayName: fbUser.displayName || 'Super Administrador',
                email: email,
                role: 'SUPER_ADMIN' as UserRole,
                roles: ['SUPER_ADMIN' as UserRole],
                institutionId: '',
                branchId: 'todas',
                estado: 'ativo',
                codigo: 'MTW-ROOT-001',
                createdAt: serverTimestamp(),
                lastLoginAt: new Date().toISOString()
              };
              await setDoc(userDocRef, rootProfile, { merge: true });
              await setDoc(doc(db, 'admins', uid), {
                email: email,
                role: 'SUPER_ADMIN',
                grantedAt: serverTimestamp()
              }, { merge: true });
            } catch (e) {
              console.warn('Super Admin Firestore bootstrap warning:', e);
            }
          } else {
            // User authenticated in Firebase Auth, but does not have a SIGAR profile in Firestore!
            this.currentUser = {
              id: uid,
              name: fbUser.displayName || email.split('@')[0] || 'Utilizador',
              email: email,
              role: 'VISITANTE',
              roles: ['VISITANTE'],
              institutionId: '',
              branchId: 'todas',
              avatarUrl: fbUser.photoURL || undefined,
              lastLoginAt: new Date().toISOString(),
              sessionToken: 'fb_token_' + uid,
              isSuperAdmin: false,
              status: 'pendente_ativacao',
              hasSigarProfile: false
            };
            this.notify();
          }
        }
      }, (error) => {
        console.warn('Firestore user profile snapshot listener:', error);
      });
    });
  }

  public getUser(): AuthenticatedUser | null {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  public can(permission: Permission): boolean {
    if (!this.currentUser) return false;
    return hasPermission(this.currentUser.role, permission);
  }

  public isSuperAdmin(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.isSuperAdmin === true || 
      this.currentUser.email === SUPERADMIN_EMAIL ||
      this.currentUser.role === 'SUPER_ADMIN' || 
      this.currentUser.role === 'superadmin';
  }

  /**
   * Switch between user's authorized roles.
   * STRICT ACCESS CONTROL: User can ONLY switch to roles present in their authorized roles list.
   */
  public switchRole(targetRole: UserRole): boolean {
    if (!this.currentUser) return false;

    const isAuthorizedSuper = this.isSuperAdmin();
    const authorizedList = this.currentUser.roles || [this.currentUser.role];
    const isTargetAuthorized = isAuthorizedSuper || authorizedList.includes(targetRole);

    if (!isTargetAuthorized) {
      console.warn(`Tentativa de violação de perfil bloqueada: Perfil "${targetRole}" não autorizado para este utilizador.`);
      return false;
    }

    this.currentUser = {
      ...this.currentUser,
      role: targetRole
    };
    this.notify();
    return true;
  }

  /**
   * Updates user role.
   * SECURITY ENFORCEMENT: Only verified Super Admin can change role or impersonate.
   * Regular users are strictly bound to their Firestore /users/{uid} document.
   */
  public async setUserRole(role: UserRole): Promise<void> {
    if (!this.currentUser) return;

    const isAuthorizedSuper = this.isSuperAdmin();
    if (!isAuthorizedSuper) {
      console.warn('Unauthorized attempt to modify user role. Action rejected by RBAC.');
      return;
    }

    const wantsSuper = role === 'superadmin' || role === 'SUPER_ADMIN' || (role as string) === 'Super Admin';
    const finalRole = role;
    const finalIsSuper = wantsSuper && this.currentUser.email === SUPERADMIN_EMAIL;

    this.currentUser = {
      ...this.currentUser,
      role: finalRole,
      isSuperAdmin: finalIsSuper
    };

    // Update Firestore if user is authenticated
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          role: finalRole,
          lastRoleChangeAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Could not sync role to Firestore:', e);
    }

    this.notify();
  }

  /**
   * Set user context (Institution & Branch) and sync with Firestore /users/{uid}
   */
  public async setContext(institutionId: string, branchId: string): Promise<void> {
    if (!this.currentUser) return;

    this.currentUser = {
      ...this.currentUser,
      institutionId,
      branchId
    };

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          institutionId,
          branchId,
          lastContextUpdateAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Could not sync context to Firestore:', e);
    }

    this.notify();
  }

  /**
   * Directly sets the active user (used during Access Code verification with Firestore)
   */
  public setExplicitSession(user: AuthenticatedUser): void {
    this.currentUser = { ...user };
    this.notify();
  }

  public logout(): void {
    this.currentUser = null;
    this.notify();
  }

  public subscribe(listener: (user: AuthenticatedUser | null) => void): () => void {
    this.authListeners.push(listener);
    // Immediately invoke listener with current user state
    listener(this.getUser());
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    const user = this.getUser();
    this.authListeners.forEach(l => l(user));
  }
}

export const authService = AuthService.getInstance();
