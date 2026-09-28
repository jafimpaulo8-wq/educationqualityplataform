import React, { useState } from 'react';
import { 
  UserPlus, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  GraduationCap, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Edit3,
  Calendar,
  Compass
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Course } from '../../../types';
import { AiBrowserCard } from './AiBrowserCard';

interface AiStudentRegistrationCardProps {
  draft: {
    fullName: string;
    documentType: 'BI' | 'Passaporte' | 'DIRE';
    documentNumber: string;
    birthDate: string;
    gender: 'Masculino' | 'Feminino';
    phone: string;
    email: string;
    province: string;
    city: string;
    address: string;
    courseName: string;
    guardianName?: string;
    guardianPhone?: string;
    emergencyContact: string;
    confidenceScore: number;
  };
  onStudentRegistered?: (student: any) => void;
}

export const AiStudentRegistrationCard: React.FC<AiStudentRegistrationCardProps> = ({
  draft,
  onStudentRegistered
}) => {
  const { addStudent, courses, activeInstitution, activeBranchId } = useApp();
  
  const [formData, setFormData] = useState({
    ...draft
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledStudent, setEnrolledStudent] = useState<any>(null);

  const matchedCourse: Course | undefined = courses.find(
    c => c.name.toLowerCase() === formData.courseName.toLowerCase()
  ) || courses[0];

  const handleEnroll = () => {
    try {
      const newStudentData = {
        institutionId: activeInstitution.id,
        branchId: activeBranchId || undefined,
        fullName: formData.fullName,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        birthDate: formData.birthDate,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        province: formData.province || 'Maputo',
        city: formData.city || 'Maputo',
        address: formData.address || 'Bairro Central',
        emergencyContact: formData.emergencyContact || formData.phone,
        guardianName: formData.guardianName || 'Encarregado Declarado',
        guardianPhone: formData.guardianPhone || formData.phone,
        courseId: matchedCourse?.id || 'crs-default',
        courseName: matchedCourse?.name || formData.courseName,
        classGroupId: 'turma-2026-a',
        classGroupName: 'Turma A (Manhã)',
        regime: matchedCourse?.regime || 'Regular Diurno',
        status: 'Ativo' as const,
        enrollmentDate: new Date().toISOString().split('T')[0],
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        paymentStatus: 'Pendente' as const,
        balanceOwing: 3500, // Primeira propina/matrícula padrão
        attendancePercentage: 100,
        averageGrade: 14,
        assessments: []
      };

      const created = addStudent(newStudentData);
      setEnrolledStudent(created);
      setIsEnrolled(true);
      if (onStudentRegistered) {
        onStudentRegistered(created);
      }
    } catch (err) {
      console.error('Erro ao cadastrar aluno via IA:', err);
    }
  };

  if (isEnrolled && enrolledStudent) {
    return (
      <div className="mt-3 space-y-3">
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-emerald-200">
                Matrícula Homologada com Sucesso no SIGAR!
              </h4>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                {enrolledStudent.code}
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              O formando <strong>{enrolledStudent.fullName}</strong> foi registrado na instituição <strong>{activeInstitution.name}</strong> com processo ativo.
            </p>
          </div>
        </div>

        {/* Browser Automático de Condução */}
        <AiBrowserCard
          title={`Ficha Oficial de ${enrolledStudent.fullName}`}
          description="Acesse o perfil acadêmico completo, carnê de propinas, carteirinha digital com QR Code e pautas."
          url={`sigar://alunos/perfil/${enrolledStudent.code}`}
          route="alunos_gestao"
          actionLabel="Conduzir para Perfil do Aluno"
          badgeText="Processo Ativo"
          studentData={enrolledStudent}
        />
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Card Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Ficha de Pré-Cadastro Extraída via IA
            </h4>
            <p className="text-[11px] text-slate-500">
              Dados reconhecidos a partir do documento anexado para {activeInstitution.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {draft.confidenceScore}% de Precisão
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300/80 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Concluir Edição' : 'Revisar / Ajustar'}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4 text-xs">
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Nome Completo</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Número do Documento ({formData.documentType})</label>
              <input
                type="text"
                value={formData.documentNumber}
                onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Curso Pretendido</label>
              <select
                value={formData.courseName}
                onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Encarregado de Educação</label>
              <input
                type="text"
                value={formData.guardianName || ''}
                onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Identificação</span>
              <p className="font-bold text-slate-900 text-sm">{formData.fullName}</p>
              <p className="text-slate-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                {formData.documentType}: <span className="font-mono font-semibold">{formData.documentNumber}</span>
              </p>
              <p className="text-slate-500 flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                Nascimento: {formData.birthDate} ({formData.gender})
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Curso & Matrícula</span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                {formData.courseName}
              </p>
              <p className="text-slate-600">Instituição: {activeInstitution.name}</p>
              <p className="text-slate-500 text-[11px]">Regime: Presencial • Carga: 240h</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Contactos & Morada</span>
              <p className="text-slate-700 flex items-center gap-1 font-semibold">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {formData.phone}
              </p>
              <p className="text-slate-500 truncate flex items-center gap-1 text-[11px]">
                <Mail className="w-3.5 h-3.5" />
                {formData.email}
              </p>
              <p className="text-slate-500 truncate flex items-center gap-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5" />
                {formData.city}, {formData.province}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Permissão verificada: <strong>ai.create_student_from_doc</strong></span>
          </div>

          <button
            type="button"
            onClick={handleEnroll}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirmar e Cadastrar Aluno no Sistema
          </button>
        </div>
      </div>
    </div>
  );
};
