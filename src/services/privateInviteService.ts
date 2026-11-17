import { doc, getDoc, setDoc, query, collection, where, getDocs, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { PrivateInvite } from '../types';
import { generateSecureInvitationToken } from './publicInstitutionService';

export const PRIVATE_INVITES_COLLECTION = 'privateInvites';

// Cache em memória para estabilidade imediata entre telas
const localInviteCache: Record<string, PrivateInvite> = {};

/**
 * Converte de forma segura qualquer formato de data (Timestamp Firestore, string ISO, nanos ou Date) para Date nativa JS.
 */
export function toJsDate(val: any): Date {
  if (!val) return new Date();
  if (typeof val.toDate === 'function') return val.toDate();
  if (typeof val.toMillis === 'function') return new Date(val.toMillis());
  if (val.seconds !== undefined) return new Date(val.seconds * 1000);
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Formata um timestamp para exibição amigável em pt-MZ.
 */
export function formatInviteTimestamp(val: any): string {
  if (!val) return '';
  const d = toJsDate(val);
  return d.toLocaleString('pt-MZ');
}

/**
 * Obtém o convite privado ativo para a instituição ou cria um novo com >= 128 bits de entropia.
 * Permanece ESTÁVEL entre ecrãs e navegações, nunca gerando um novo token a cada render.
 */
export async function getOrCreateActivePrivateInvite(
  institutionId: string,
  slug: string,
  actorUid?: string
): Promise<PrivateInvite> {
  if (!institutionId) {
    throw new Error('institutionId é obrigatório para obter convite privado.');
  }

  // 1. Verificar cache local em memória
  if (localInviteCache[institutionId]) {
    const cached = localInviteCache[institutionId];
    if (!cached.revoked && cached.status === 'active' && toJsDate(cached.expiresAt) > new Date()) {
      return cached;
    }
  }

  // 2. Verificar no localStorage para persistência de aba/sessão
  const storageKey = `sigar_private_invite_${institutionId}`;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed: PrivateInvite = JSON.parse(stored);
        if (!parsed.revoked && parsed.status === 'active' && toJsDate(parsed.expiresAt) > new Date()) {
          localInviteCache[institutionId] = parsed;
          return parsed;
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }
  }

  // 3. Consultar no Firestore se existe convite ativo para esta instituição
  try {
    const q = query(
      collection(db, PRIVATE_INVITES_COLLECTION),
      where('institutionId', '==', institutionId),
      where('status', '==', 'active'),
      where('revoked', '==', false)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      // Filtrar não expirados
      for (const d of snap.docs) {
        const data = d.data() as PrivateInvite;
        if (toJsDate(data.expiresAt) > new Date()) {
          localInviteCache[institutionId] = data;
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify({
              ...data,
              expiresAt: toJsDate(data.expiresAt).toISOString(),
              createdAt: toJsDate(data.createdAt).toISOString()
            }));
          }
          return data;
        }
      }
    }
  } catch (error) {
    console.warn(`[PrivateInvite] Consulta Firestore não-bloqueante para ${institutionId}:`, error);
  }

  // 4. Se não existe convite ativo, gerar novo com entropia >= 128 bits (192 bits)
  const token = generateSecureInvitationToken();
  const now = new Date();
  const expiresAtDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias
  const expiresAt = Timestamp.fromDate(expiresAtDate);
  const createdAt = Timestamp.fromDate(now);

  const newInvite: PrivateInvite = {
    id: token,
    token,
    institutionId,
    slug: slug || institutionId,
    purpose: 'inscricao_privada',
    expiresAt,
    status: 'active',
    revoked: false,
    createdAt,
    createdBy: actorUid || 'secretaria'
  };

  // Salvar no Firestore com Timestamp e serverTimestamp()
  try {
    await setDoc(doc(db, PRIVATE_INVITES_COLLECTION, token), {
      ...newInvite,
      expiresAt,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.warn(`[PrivateInvite] Aviso ao salvar privateInvites/${token}:`, error);
  }

  localInviteCache[institutionId] = newInvite;
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify({
      ...newInvite,
      expiresAt: expiresAtDate.toISOString(),
      createdAt: now.toISOString()
    }));
  }

  return newInvite;
}

/**
 * Revoga o convite privado atual e gera um novo token criptográfico (>= 128 bits).
 * Utilizado quando a secretaria clica em "Regerar Link".
 * Na revogação, grava também revokedBy (uid) e usa serverTimestamp() para revokedAt.
 */
export async function revokeAndRegeneratePrivateInvite(
  institutionId: string,
  slug: string,
  previousToken?: string,
  actorUid?: string
): Promise<PrivateInvite> {
  const revokedBy = actorUid || 'secretaria';

  // 1. Revogar o token anterior se fornecido
  if (previousToken) {
    try {
      await setDoc(doc(db, PRIVATE_INVITES_COLLECTION, previousToken), {
        status: 'revoked',
        revoked: true,
        revokedAt: serverTimestamp(),
        revokedBy
      }, { merge: true });
    } catch (e) {
      console.warn(`[PrivateInvite] Aviso ao revogar ${previousToken}:`, e);
    }
  }

  // 2. Revogar outros tokens ativos para garantir unicidade
  try {
    const q = query(
      collection(db, PRIVATE_INVITES_COLLECTION),
      where('institutionId', '==', institutionId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      if (d.id !== previousToken) {
        setDoc(doc(db, PRIVATE_INVITES_COLLECTION, d.id), {
          status: 'revoked',
          revoked: true,
          revokedAt: serverTimestamp(),
          revokedBy
        }, { merge: true }).catch(() => {});
      }
    }
  } catch (e) {
    // ignore
  }

  // 3. Gerar novo token seguro com Timestamps
  const newToken = generateSecureInvitationToken();
  const now = new Date();
  const expiresAtDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiresAt = Timestamp.fromDate(expiresAtDate);
  const createdAt = Timestamp.fromDate(now);

  const freshInvite: PrivateInvite = {
    id: newToken,
    token: newToken,
    institutionId,
    slug: slug || institutionId,
    purpose: 'inscricao_privada',
    expiresAt,
    status: 'active',
    revoked: false,
    createdAt,
    createdBy: actorUid || 'secretaria'
  };

  try {
    await setDoc(doc(db, PRIVATE_INVITES_COLLECTION, newToken), {
      ...freshInvite,
      expiresAt,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn(`[PrivateInvite] Erro ao salvar novo privateInvites/${newToken}:`, e);
  }

  localInviteCache[institutionId] = freshInvite;
  const storageKey = `sigar_private_invite_${institutionId}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify({
      ...freshInvite,
      expiresAt: expiresAtDate.toISOString(),
      createdAt: now.toISOString()
    }));
  }

  return freshInvite;
}

/**
 * Valida um token de convite privado na abertura da página pelo candidato.
 */
export async function validatePrivateInvite(token: string): Promise<{
  valid: boolean;
  reason?: string;
  invite?: PrivateInvite;
}> {
  if (!token || !token.trim()) {
    return { valid: false, reason: 'Token privado não fornecido.' };
  }

  const cleanToken = token.trim();

  // 1. Tentar consultar no Firestore
  try {
    const docRef = doc(db, PRIVATE_INVITES_COLLECTION, cleanToken);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const invite = snap.data() as PrivateInvite;

      if (invite.revoked || invite.status === 'revoked') {
        return {
          valid: false,
          reason: 'Este link de inscrição privada foi revogado pela secretaria da instituição.',
          invite
        };
      }

      if (toJsDate(invite.expiresAt) < new Date() || invite.status === 'expired') {
        return {
          valid: false,
          reason: 'Este link de inscrição privada expirou. Solicite um novo link à instituição.',
          invite
        };
      }

      return { valid: true, invite };
    }
  } catch (e) {
    console.warn(`[PrivateInvite] Consulta Firestore falhou para ${cleanToken}:`, e);
  }

  // 2. Fallback de verificação em cache local se offline
  for (const instId of Object.keys(localInviteCache)) {
    const cached = localInviteCache[instId];
    if (cached.token === cleanToken) {
      if (cached.revoked || cached.status === 'revoked') {
        return { valid: false, reason: 'Este link de inscrição privada foi revogado.', invite: cached };
      }
      if (toJsDate(cached.expiresAt) < new Date()) {
        return { valid: false, reason: 'Este link de inscrição privada expirou.', invite: cached };
      }
      return { valid: true, invite: cached };
    }
  }

  return {
    valid: false,
    reason: 'Link privado inválido ou não encontrado no sistema.'
  };
}
