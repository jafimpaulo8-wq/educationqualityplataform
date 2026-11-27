import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { sanitizeFirestoreData } from '../utils/registrationConfigUtils';
import { 
  Institution, 
  Student, 
  Course, 
  ClassGroup, 
  StudentClassTransfer,
  CashRegisterSession, 
  ClassLesson, 
  GateAccessLog,
  ClassScheduleSlot,
  Teacher,
  LessonAttendanceAuditLog,
  UserProfile,
  CertificateData,
  PaymentRecord,
  RegistrationApplication,
  StudentInvitation
} from '../types';

// Collection Names
export const COLLECTIONS = {
  INSTITUTIONS: 'institutions',
  STUDENTS: 'students',
  COURSES: 'courses',
  CLASSES: 'classes',
  TEACHERS: 'teachers',
  TRANSFERS: 'transfers',
  SCHEDULES: 'schedules',
  CASH_SESSIONS: 'cashSessions',
  LESSONS: 'lessons',
  ACCESS_LOGS: 'accessLogs',
  ATTENDANCE_AUDITS: 'attendanceAudits',
  USERS: 'users',
  ADMINS: 'admins',
  CERTIFICATES: 'certificates',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  APPLICATIONS: 'applications',
  STUDENT_INVITATIONS: 'studentInvitations',
  USER_PREFERENCES: 'userPreferences'
} as const;

// User Profile Services
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('Profile fetch note:', error);
    return null;
  }
}

export async function saveUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${profile.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, profile.id), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserPreferences(userId: string, preferences: Record<string, any>): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${userId}`;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, userId), { preferences }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function checkIsSuperAdmin(uid: string): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) return false;
    return currentUser.email === 'moztechwavenacala8@gmail.com' && currentUser.emailVerified === true;
  } catch {
    return false;
  }
}

// Institutions - Real Firestore only, returns [] if empty (deduplicated by id)
export async function getInstitutions(): Promise<Institution[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.INSTITUTIONS));
    if (snapshot.empty) {
      return [];
    }
    const seen = new Set<string>();
    return snapshot.docs
      .map(d => ({ ...d.data(), id: d.id } as Institution))
      .filter(i => {
        if (!i?.id || seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      });
  } catch (error) {
    console.warn('Could not list institutions from Firestore:', error);
    return [];
  }
}

export async function getInstitutionById(institutionId: string): Promise<Institution | null> {
  if (!institutionId) return null;
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.INSTITUTIONS, institutionId));
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Institution;
    }
    return null;
  } catch (error) {
    console.warn(`Could not fetch institution ${institutionId} from Firestore:`, error);
    return null;
  }
}

export async function getUserInstitutions(
  userId: string,
  institutionId?: string,
  institutionIds?: string[]
): Promise<Institution[]> {
  try {
    if (!userId) return [];
    const all = await getInstitutions();
    const seen = new Set<string>();
    const deduped = all.filter(i => {
      if (!i?.id || seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });

    const isSuper = await checkIsSuperAdmin(userId);
    if (isSuper) return deduped;

    const allowedIds = new Set<string>();
    if (institutionId) allowedIds.add(institutionId);
    if (Array.isArray(institutionIds)) {
      institutionIds.forEach(id => {
        if (id) allowedIds.add(id);
      });
    }

    if (allowedIds.size === 0) {
      const profile = await getUserProfile(userId);
      if (profile?.institutionId) allowedIds.add(profile.institutionId);
      if (Array.isArray(profile?.institutionIds)) {
        profile.institutionIds.forEach(id => {
          if (id) allowedIds.add(id);
        });
      }
      if (Array.isArray(profile?.ownedInstitutions)) {
        profile.ownedInstitutions.forEach(id => {
          if (id) allowedIds.add(id);
        });
      }
    }

    if (allowedIds.size === 0) return [];
    return deduped.filter(i => allowedIds.has(i.id));
  } catch (error) {
    console.warn('Error fetching user institutions:', error);
    return [];
  }
}

export async function saveInstitutionToFirestore(institution: Institution): Promise<void> {
  const path = `${COLLECTIONS.INSTITUTIONS}/${institution.id}`;
  try {
    const cleanInstitution = sanitizeFirestoreData(institution);
    await setDoc(doc(db, COLLECTIONS.INSTITUTIONS, institution.id), cleanInstitution, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveInstitutionPublicConfigToFirestore(
  institutionId: string,
  patch: {
    onlineRegistrationConfig?: Institution['onlineRegistrationConfig'];
    phone?: string;
    whatsapp?: string;
    email?: string;
    publicPortalPublished?: boolean;
  }
): Promise<void> {
  const path = `${COLLECTIONS.INSTITUTIONS}/${institutionId}`;
  try {
    const safePatch: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };
    if (patch.onlineRegistrationConfig !== undefined) {
      safePatch.onlineRegistrationConfig = patch.onlineRegistrationConfig;
    }
    if (patch.phone !== undefined) safePatch.phone = patch.phone;
    if (patch.whatsapp !== undefined) safePatch.whatsapp = patch.whatsapp;
    if (patch.email !== undefined) safePatch.email = patch.email;
    if (patch.publicPortalPublished !== undefined) {
      safePatch.publicPortalPublished = patch.publicPortalPublished;
    }
    const cleanPatch = sanitizeFirestoreData(safePatch);
    await updateDoc(doc(db, COLLECTIONS.INSTITUTIONS, institutionId), cleanPatch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Students (Filtered strictly by institutionId and branchId) - Real Firestore only
export async function getStudentsByInstitution(institutionId: string, branchId?: string): Promise<Student[]> {
  try {
    const colRef = collection(db, COLLECTIONS.STUDENTS);
    let q = query(colRef, where('institutionId', '==', institutionId));
    if (branchId && branchId !== 'todas') {
      q = query(colRef, where('institutionId', '==', institutionId), where('branchId', '==', branchId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Student));
  } catch (error) {
    console.warn('Firestore getStudentsByInstitution note:', error);
    return [];
  }
}

export async function getStudentByUidOrEmail(uid: string, email?: string): Promise<Student | null> {
  try {
    const colRef = collection(db, COLLECTIONS.STUDENTS);
    // Search by userId first
    const qUid = query(colRef, where('userId', '==', uid));
    const snapUid = await getDocs(qUid);
    if (!snapUid.empty) {
      const doc = snapUid.docs[0];
      return { ...doc.data(), id: doc.id } as Student;
    }
    if (email) {
      const qEmail = query(colRef, where('email', '==', email));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const doc = snapEmail.docs[0];
        return { ...doc.data(), id: doc.id } as Student;
      }
    }
    return null;
  } catch (error) {
    console.warn('getStudentByUidOrEmail error:', error);
    return null;
  }
}

export async function saveStudentToFirestore(student: Student): Promise<void> {
  const path = `${COLLECTIONS.STUDENTS}/${student.id}`;
  try {
    const cleanStudent = sanitizeFirestoreData(student);
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), cleanStudent, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Courses
export async function getCoursesByInstitution(institutionId: string): Promise<Course[]> {
  try {
    const q = query(collection(db, COLLECTIONS.COURSES), where('institutionId', '==', institutionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Course));
  } catch (error) {
    console.warn('Firestore getCoursesByInstitution note:', error);
    return [];
  }
}

export async function saveCourseToFirestore(course: Course): Promise<void> {
  const path = `${COLLECTIONS.COURSES}/${course.id}`;
  try {
    const cleanCourse = sanitizeFirestoreData(course);
    await setDoc(doc(db, COLLECTIONS.COURSES, course.id), cleanCourse, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function incrementCourseFilledVacancyInFirestore(
  courseId: string,
  _nextFilledVacancies?: number
): Promise<void> {
  const path = `${COLLECTIONS.COURSES}/${courseId}`;
  const courseRef = doc(db, COLLECTIONS.COURSES, courseId);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(courseRef);
      if (!snap.exists()) {
        throw new Error(`Curso "${courseId}" não encontrado no Firestore.`);
      }
      const data = snap.data() || {};
      const currentFilled =
        typeof data.filledVacancies === 'number' && Number.isFinite(data.filledVacancies)
          ? data.filledVacancies
          : 0;
      const totalVacancies =
        typeof data.totalVacancies === 'number' && Number.isFinite(data.totalVacancies)
          ? data.totalVacancies
          : undefined;
      if (totalVacancies !== undefined && totalVacancies > 0 && currentFilled >= totalVacancies) {
        throw new Error('As vagas deste curso encontram-se esgotadas.');
      }
      if (totalVacancies === 0) {
        throw new Error('Este curso não possui vagas disponíveis (totalVacancies = 0).');
      }
      tx.update(courseRef, {
        filledVacancies: currentFilled + 1,
        updatedAt: new Date().toISOString()
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCourseFromFirestore(courseId: string): Promise<void> {
  const path = `${COLLECTIONS.COURSES}/${courseId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.COURSES, courseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Classes
export async function getClassesByInstitution(institutionId: string, branchId?: string): Promise<ClassGroup[]> {
  try {
    const colRef = collection(db, COLLECTIONS.CLASSES);
    let q = query(colRef, where('institutionId', '==', institutionId));
    if (branchId && branchId !== 'todas') {
      q = query(colRef, where('institutionId', '==', institutionId), where('branchId', '==', branchId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ClassGroup));
  } catch (error) {
    console.warn('Firestore getClassesByInstitution note:', error);
    return [];
  }
}

export async function saveClassToFirestore(classGroup: ClassGroup): Promise<void> {
  const path = `${COLLECTIONS.CLASSES}/${classGroup.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.CLASSES, classGroup.id), classGroup, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClassFromFirestore(classId: string): Promise<void> {
  const path = `${COLLECTIONS.CLASSES}/${classId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.CLASSES, classId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Student Class Transfers
export async function getTransfersByInstitution(institutionId: string): Promise<StudentClassTransfer[]> {
  try {
    const q = query(collection(db, COLLECTIONS.TRANSFERS), where('institutionId', '==', institutionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as StudentClassTransfer));
  } catch (error) {
    console.warn('Firestore getTransfersByInstitution note:', error);
    return [];
  }
}

export async function saveTransferToFirestore(transfer: StudentClassTransfer): Promise<void> {
  const path = `${COLLECTIONS.TRANSFERS}/${transfer.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TRANSFERS, transfer.id), transfer, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Cash Sessions
export async function getCashSessionsByInstitution(institutionId: string): Promise<CashRegisterSession[]> {
  try {
    const q = query(collection(db, COLLECTIONS.CASH_SESSIONS), where('institutionId', '==', institutionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CashRegisterSession));
  } catch (error) {
    console.warn('Firestore getCashSessionsByInstitution note:', error);
    return [];
  }
}

export async function saveCashSessionToFirestore(session: CashRegisterSession): Promise<void> {
  const path = `${COLLECTIONS.CASH_SESSIONS}/${session.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.CASH_SESSIONS, session.id), session, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Lessons & Diary
export async function getLessonsByInstitution(institutionId: string): Promise<ClassLesson[]> {
  try {
    const q = query(collection(db, COLLECTIONS.LESSONS), where('institutionId', '==', institutionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ClassLesson));
  } catch (error) {
    console.warn('Firestore getLessonsByInstitution note:', error);
    return [];
  }
}

export async function saveLessonToFirestore(lesson: ClassLesson): Promise<void> {
  const path = `${COLLECTIONS.LESSONS}/${lesson.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.LESSONS, lesson.id), lesson, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteLessonFromFirestore(lessonId: string): Promise<void> {
  const path = `${COLLECTIONS.LESSONS}/${lessonId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.LESSONS, lessonId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Access Logs (Portaria)
export async function getAccessLogsByInstitution(institutionId: string): Promise<GateAccessLog[]> {
  try {
    const q = query(collection(db, COLLECTIONS.ACCESS_LOGS), where('institutionId', '==', institutionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as GateAccessLog));
  } catch (error) {
    console.warn('Firestore getAccessLogsByInstitution note:', error);
    return [];
  }
}

export async function saveAccessLogToFirestore(log: GateAccessLog): Promise<void> {
  const path = `${COLLECTIONS.ACCESS_LOGS}/${log.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ACCESS_LOGS, log.id), log, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Schedules & Calendar Slots
export async function getSchedulesByInstitution(institutionId: string): Promise<ClassScheduleSlot[]> {
  try {
    const q = query(collection(db, COLLECTIONS.SCHEDULES), where('institutionId', '==', institutionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ClassScheduleSlot));
  } catch (error) {
    console.warn('Firestore getSchedulesByInstitution note:', error);
    return [];
  }
}

export async function saveScheduleSlotToFirestore(slot: ClassScheduleSlot): Promise<void> {
  const path = `${COLLECTIONS.SCHEDULES}/${slot.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.SCHEDULES, slot.id), slot, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteScheduleSlotFromFirestore(slotId: string): Promise<void> {
  const path = `${COLLECTIONS.SCHEDULES}/${slotId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.SCHEDULES, slotId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Teachers & Formadores
export async function getTeachersByInstitution(institutionId: string): Promise<Teacher[]> {
  try {
    const q = query(collection(db, COLLECTIONS.TEACHERS), where('institutionId', '==', institutionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Teacher));
  } catch (error) {
    console.warn('Firestore getTeachersByInstitution note:', error);
    return [];
  }
}

export async function saveTeacherToFirestore(teacher: Teacher): Promise<void> {
  const path = `${COLLECTIONS.TEACHERS}/${teacher.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TEACHERS, teacher.id), teacher, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTeacherFromFirestore(teacherId: string): Promise<void> {
  const path = `${COLLECTIONS.TEACHERS}/${teacherId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TEACHERS, teacherId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Attendance Audit Logs
export async function saveAttendanceAuditToFirestore(auditLog: LessonAttendanceAuditLog): Promise<void> {
  const path = `${COLLECTIONS.ATTENDANCE_AUDITS}/${auditLog.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ATTENDANCE_AUDITS, auditLog.id), auditLog, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAttendanceAuditsByInstitution(lessonId?: string): Promise<LessonAttendanceAuditLog[]> {
  try {
    const colRef = collection(db, COLLECTIONS.ATTENDANCE_AUDITS);
    let q = query(colRef);
    if (lessonId) {
      q = query(colRef, where('lessonId', '==', lessonId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as LessonAttendanceAuditLog));
  } catch (error) {
    console.warn('Firestore getAttendanceAuditsByInstitution note:', error);
    return [];
  }
}

// Certificates (SIVEC)
export async function getCertificatesByInstitution(institutionId: string): Promise<CertificateData[]> {
  try {
    const q = query(collection(db, COLLECTIONS.CERTIFICATES), where('institutionId', '==', institutionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CertificateData));
  } catch (error) {
    console.warn('Firestore getCertificatesByInstitution note:', error);
    return [];
  }
}

export async function getCertificateByCode(verificationCode: string): Promise<CertificateData | null> {
  try {
    const q = query(collection(db, COLLECTIONS.CERTIFICATES), where('verificationCode', '==', verificationCode));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { ...doc.data(), id: doc.id } as CertificateData;
    }
    return null;
  } catch (error) {
    console.warn('Firestore getCertificateByCode note:', error);
    return null;
  }
}

// Payments
export async function getPaymentsByInstitution(institutionId: string): Promise<PaymentRecord[]> {
  try {
    const q = query(collection(db, COLLECTIONS.PAYMENTS), where('institutionId', '==', institutionId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PaymentRecord));
  } catch (error) {
    console.warn('Firestore getPaymentsByInstitution note:', error);
    return [];
  }
}

// Applications & Inscrições Online
export async function getApplicationsByInstitution(institutionId: string, branchId?: string): Promise<RegistrationApplication[]> {
  try {
    const colRef = collection(db, COLLECTIONS.APPLICATIONS);
    let q = query(colRef, where('institutionId', '==', institutionId));
    if (branchId && branchId !== 'todas') {
      q = query(colRef, where('institutionId', '==', institutionId), where('branchId', '==', branchId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as RegistrationApplication));
  } catch (error) {
    console.warn('Firestore getApplicationsByInstitution note:', error);
    return [];
  }
}

export async function getApplicationById(applicationId: string): Promise<RegistrationApplication | null> {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.APPLICATIONS, applicationId));
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as RegistrationApplication;
    }
    return null;
  } catch (error) {
    console.warn('Firestore getApplicationById note:', error);
    return null;
  }
}

export async function saveApplicationToFirestore(app: RegistrationApplication): Promise<void> {
  const path = `${COLLECTIONS.APPLICATIONS}/${app.id}`;
  try {
    const cleanApp = sanitizeFirestoreData(app);
    await setDoc(doc(db, COLLECTIONS.APPLICATIONS, app.id), cleanApp, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncApplicationStatusToSubcollections(app: RegistrationApplication): Promise<void> {
  if (!app) return;
  const instId = app.institutionId;

  if (instId && app.id) {
    const subPath = `institutions/${instId}/applications/${app.id}`;
    try {
      await setDoc(
        doc(db, 'institutions', instId, 'applications', app.id),
        sanitizeFirestoreData({
          institutionId: instId,
          status: app.status,
          analysisNotes: app.analysisNotes || null,
          rejectionReason: app.rejectionReason || null,
          analyzedBy: app.analyzedBy || null,
          analyzedAt: app.analyzedAt || null,
          convertedStudentId: app.convertedStudentId || null,
          convertedStudentCode: app.convertedStudentCode || null,
          convertedClassId: app.convertedClassId || null,
          convertedClassName: app.convertedClassName || null,
          updatedAt: serverTimestamp()
        }),
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, subPath);
    }
  }

  const trackingKeys = Array.from(
    new Set([app.code, (app as any).trackingToken].filter((k): k is string => typeof k === 'string' && k.trim().length > 0))
  );
  for (const key of trackingKeys) {
    const trackingPath = `applicationTracking/${key}`;
    try {
      // Sem PII: apenas estado público e metadados não pessoais do acompanhamento
      await setDoc(
        doc(db, 'applicationTracking', key),
        sanitizeFirestoreData({
          institutionId: instId,
          status: app.status,
          courseId: app.courseId,
          courseName: app.courseName,
          paymentStatus: app.paymentStatus,
          ...(app.convertedStudentCode ? { convertedStudentCode: app.convertedStudentCode } : {}),
          updatedAt: serverTimestamp()
        }),
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, trackingPath);
    }
  }
}

export async function deleteApplicationFromFirestore(applicationId: string): Promise<void> {
  const path = `${COLLECTIONS.APPLICATIONS}/${applicationId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.APPLICATIONS, applicationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Student Invitations & Single-Use Tokens
export async function saveStudentInvitation(invitation: StudentInvitation): Promise<void> {
  const path = `${COLLECTIONS.STUDENT_INVITATIONS}/${invitation.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENT_INVITATIONS, invitation.id), invitation, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getStudentInvitationByToken(token: string): Promise<StudentInvitation | null> {
  try {
    const q = query(collection(db, COLLECTIONS.STUDENT_INVITATIONS), where('token', '==', token));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docData = snapshot.docs[0];
      return { ...docData.data(), id: docData.id } as StudentInvitation;
    }
    return null;
  } catch (error) {
    console.warn('Firestore getStudentInvitationByToken note:', error);
    return null;
  }
}

export async function getStudentInvitationsByStudent(studentId: string): Promise<StudentInvitation[]> {
  try {
    const q = query(collection(db, COLLECTIONS.STUDENT_INVITATIONS), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as StudentInvitation));
  } catch (error) {
    console.warn('Firestore getStudentInvitationsByStudent note:', error);
    return [];
  }
}

export async function markStudentInvitationUsed(invitationId: string, uid: string): Promise<void> {
  const path = `${COLLECTIONS.STUDENT_INVITATIONS}/${invitationId}`;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENT_INVITATIONS, invitationId), {
      used: true,
      usedAt: new Date().toISOString(),
      usedByUid: uid
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function revokeStudentInvitation(invitationId: string): Promise<void> {
  const path = `${COLLECTIONS.STUDENT_INVITATIONS}/${invitationId}`;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENT_INVITATIONS, invitationId), {
      revoked: true,
      revokedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==========================================================
// PREFERÊNCIAS VISUAIS DE TEMA DO UTILIZADOR (Requisito 8)
// ==========================================================
export interface StoredUserPreference {
  theme: 'claro' | 'escuro-suave' | 'escuro' | 'personalizado';
  background?: string;
  accent?: string;
  updatedAt: string;
}

export async function getUserPreferences(uid: string): Promise<StoredUserPreference | null> {
  if (!uid) return null;
  const path = `${COLLECTIONS.USER_PREFERENCES}/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.USER_PREFERENCES, uid));
    if (docSnap.exists()) {
      return docSnap.data() as StoredUserPreference;
    }
    return null;
  } catch (error) {
    console.warn(`[Tema] Erro não-bloqueante ao obter userPreferences de ${uid}:`, error);
    return null;
  }
}

export async function saveUserPreferences(uid: string, pref: StoredUserPreference): Promise<void> {
  if (!uid) return;
  const path = `${COLLECTIONS.USER_PREFERENCES}/${uid}`;

  // Validação estrita: campos proibidos são descartados (Requisito 8: sem outros campos)
  const payload: StoredUserPreference = {
    theme: pref.theme,
    updatedAt: pref.updatedAt || new Date().toISOString()
  };

  if (pref.theme === 'personalizado') {
    if (pref.background && /^#[0-9A-Fa-f]{6}$/.test(pref.background)) {
      payload.background = pref.background.toUpperCase();
    }
    if (pref.accent && /^#[0-9A-Fa-f]{6}$/.test(pref.accent)) {
      payload.accent = pref.accent.toUpperCase();
    }
  } else {
    // Para temas fixos, apenas guarda se explicitamente fornecido com formato válido
    if (pref.background && /^#[0-9A-Fa-f]{6}$/.test(pref.background)) {
      payload.background = pref.background.toUpperCase();
    }
    if (pref.accent && /^#[0-9A-Fa-f]{6}$/.test(pref.accent)) {
      payload.accent = pref.accent.toUpperCase();
    }
  }

  try {
    await setDoc(doc(db, COLLECTIONS.USER_PREFERENCES, uid), payload);
  } catch (error) {
    console.warn(`[Tema] Erro não-bloqueante ao salvar userPreferences em ${path}:`, error);
  }
}

