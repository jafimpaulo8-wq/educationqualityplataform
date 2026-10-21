/**
 * Bootstrap & Sync Service for Centro Infantil Céu Azul
 * Project: siverc-94da3
 */

import { doc, setDoc, serverTimestamp, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { 
  CEU_AZUL_INSTITUTION_ID, 
  CEU_AZUL_INSTITUTION, 
  CEU_AZUL_DIRECTOR, 
  CEU_AZUL_CEO, 
  CEU_AZUL_STUDENTS,
  CEU_AZUL_ACCESS_CODES 
} from '../data/ceuAzulData';

let isBootstrapping = false;
let isBootstrapped = false;

export async function bootstrapCeuAzul(currentUid?: string): Promise<boolean> {
  if (isBootstrapping || isBootstrapped) return true;
  isBootstrapping = true;

  try {
    // 1. INSTITUTION: /institutions/ceu-azul-nacala
    try {
      await setDoc(doc(db, 'institutions', CEU_AZUL_INSTITUTION_ID), {
        id: CEU_AZUL_INSTITUTION_ID,
        nome: "Centro Infantil Céu Azul",
        name: "Centro Infantil Céu Azul",
        nomeCompleto: "Centro Infantil Céu Azul — Delegação de Nacala-Porto",
        tipo: "Centro de Educação Infantil",
        type: "centro_infantil",
        code: "CEU-AZUL-001",
        accessCode: "CEU-AZUL-001",
        nuit: "402029013",
        local: "Nacala-Porto, Nampula, Moçambique",
        city: "Nacala-Porto",
        province: "Nampula",
        address: "Nacala-Porto, Nampula, Moçambique",
        email: "jafimpaulo8@gmail.com",
        telefone1: "853 181 189",
        telefone2: "864 826 647",
        phone: "853 181 189",
        mpesa: "853 181 189",
        emola: "864 826 647",
        estado: "activo",
        status: "Ativa",
        connectedSystem: "SIGAR",
        sivecEnabled: true,
        institutionId: CEU_AZUL_INSTITUTION_ID,
        createdBy: "jafimpaulo8@gmail.com",
        representativeName: "Jafim Paulo Rupia",
        representativeRole: "Diretor",
        directorName: "Jafim Paulo Rupia",
        totalStudents: 22,
        totalTeachers: 4,
        totalCourses: 2,
        branches: CEU_AZUL_INSTITUTION.branches,
        financialSettings: CEU_AZUL_INSTITUTION.financialSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Bootstrap note - institutions:', e);
    }

    // 2. DIRETOR PROFILE: /users/{UID_REAL_DO_JAFIM}
    const directorUid = currentUid || 'usr-jafim-dir-001';
    try {
      await setDoc(doc(db, 'users', directorUid), {
        email: "jafimpaulo8@gmail.com",
        name: "Jafim Paulo Rupia",
        role: "DIRETOR",
        roles: ["DIRETOR"],
        institutionId: CEU_AZUL_INSTITUTION_ID,
        institutionIds: [CEU_AZUL_INSTITUTION_ID],
        status: "aprovado",
        codigoAcesso: "CEU-AZUL-DIR-001",
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Bootstrap note - director user:', e);
    }

    // 3. CEO PROFILE: /users/usr-alfredo-ceo-001
    try {
      await setDoc(doc(db, 'users', 'usr-CFTP-ceo-001'), {
        name: "CFTP",
        email: "moztechwavenacala8@gmail.com",
        role: "CEO",
        roles: ["CEO"],
        institutionId: CEU_AZUL_INSTITUTION_ID,
        institutionIds: [CEU_AZUL_INSTITUTION_ID],
        ownedInstitutions: [CEU_AZUL_INSTITUTION_ID],
        status: "aprovado",
        codigoAcesso: "CEU-AZUL-CEO-001",
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Bootstrap note - CEO user:', e);
    }

    // 4. ACCESS CODES: /access_codes/{CODE}
    for (const [codeKey, codeData] of Object.entries(CEU_AZUL_ACCESS_CODES)) {
      try {
        await setDoc(doc(db, 'access_codes', codeKey), {
          code: codeData.code,
          role: codeData.role,
          name: codeData.name,
          email: codeData.email,
          institutionId: codeData.institutionId,
          institutionName: codeData.institutionName,
          branchId: codeData.branchId,
          studentId: codeData.studentId || null,
          status: codeData.status,
          description: codeData.description,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        // silent catch on restricted writes
      }
    }

    // 5. STUDENTS (22 Alunos Nº 41 a 62): /students/{studentId}
    for (const std of CEU_AZUL_STUDENTS) {
      try {
        await setDoc(doc(db, 'students', std.id), {
          id: std.id,
          numLista: (std as any).numLista,
          numAluno: (std as any).numAluno,
          code: (std as any).numAluno,
          nome: std.fullName || (std as any).nome || '',
          fullName: std.fullName || (std as any).nome || '',
          dataNascimento: (std as any).dataNascimento,
          birthDate: (std as any).dataNascimento,
          lugarNascimento: (std as any).lugarNascimento,
          contactos: (std as any).contactos,
          phone: std.phone,
          morada: null,
          address: std.address,
          institutionId: CEU_AZUL_INSTITUTION_ID,
          branchId: 'branch-ceu-azul-main',
          role: "ALUNO",
          roles: ["ALUNO"],
          estado: "activo",
          status: "Ativo",
          codigoAcesso: (std as any).codigoAcesso,
          codigo: (std as any).codigoAcesso,
          courseName: "Educação Pré-Escolar / Infantil",
          classGroupName: "CEU AZUL-1",
          turma: "CEU AZUL-1",
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        // silent catch
      }
    }

    isBootstrapped = true;
    return true;
  } catch (err) {
    console.warn('Bootstrap Ceu Azul overall warning:', err);
    return false;
  } finally {
    isBootstrapping = false;
  }
}
