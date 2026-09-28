import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, MapPin, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Student, ALL_STUDENT_STATUSES, StudentStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const { updateStudent, courses, classes } = useApp();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(student?.fullName || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [address, setAddress] = useState(student?.address || '');
  const [status, setStatus] = useState<StudentStatus>(student?.status || 'Ativo');
  const [courseId, setCourseId] = useState(student?.courseId || '');
  const [classGroupId, setClassGroupId] = useState(student?.classGroupId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update local state when student changes
  React.useEffect(() => {
    if (student) {
      setFullName(student.fullName);
      setEmail(student.email);
      setPhone(student.phone);
      setAddress(student.address || '');
      setStatus(student.status);
      setCourseId(student.courseId);
      setClassGroupId(student.classGroupId || '');
      setErrorMessage('');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('O nome completo do discente é obrigatório.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('O número de telefone é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const selectedCourse = courses.find(c => c.id === courseId);
      const selectedClass = classes.find(c => c.id === classGroupId);

      updateStudent(student.id, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        status,
        courseId: courseId || student.courseId,
        courseName: selectedCourse ? selectedCourse.name : student.courseName,
        classGroupId: classGroupId || student.classGroupId,
        classGroupName: selectedClass ? selectedClass.name : student.classGroupName
      });

      success('Dados Atualizados', `Ficha de ${fullName} atualizada com sucesso no SIGAR.`);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao gravar alterações.');
      error('Erro ao Atualizar', 'Ocorreu um erro ao salvar as modificações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#0d1527] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={student.photoUrl}
              alt={student.fullName}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
            />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Editar Dados do Aluno
              </h3>
              <p className="text-xs text-amber-400 font-mono font-bold">
                {student.code} • {student.documentNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Nome Completo *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Telefone / WhatsApp *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Correio Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Endereço / Residência</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Situação Académica</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full px-3 py-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
              >
                {ALL_STUDENT_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Curso Formativo</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Turma Atribuída</label>
            <select
              value={classGroupId}
              onChange={(e) => setClassGroupId(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="">Sem Turma Específica</option>
              {classes.map(cl => (
                <option key={cl.id} value={cl.id}>{cl.name} ({cl.shift})</option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A gravar...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
