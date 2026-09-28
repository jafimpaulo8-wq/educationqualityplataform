import React, { useMemo, useState } from 'react';
import { 
  Users, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  UserX, 
  GraduationCap, 
  FileText,
  Phone,
  Mail,
  MoreVertical,
  CreditCard,
  MessageCircle,
  Award,
  ShieldCheck,
  Eye,
  Edit,
  History,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Student, ALL_STUDENT_STATUSES, getStudentStatusBadgeStyle } from '../../types';
import { PermissionGate } from '../../components/PermissionGate';
import { ProfessionalDataTable, ColumnDef, QuickAction } from '../../components/common/ProfessionalDataTable';
import { RecordDetailsModal, DetailField } from '../../components/common/RecordDetailsModal';
import { RecordHistoryModal, HistoryEvent } from '../../components/common/RecordHistoryModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { StudentEditModal } from './StudentEditModal';

export const StudentsListView: React.FC = () => {
  const { students, courses, navigate, activeInstitution, openWhatsAppMessage, deleteStudent } = useApp();
  const { success, error: toastError } = useToast();

  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const countActive = students.filter(s => s.status === 'Ativo').length;
  const countPending = students.filter(s => s.status === 'Aguardando Pagamento').length;
  const countTerminated = students.filter(s => s.status === 'Baixado').length;

  // Filter options for the ProfessionalDataTable
  const tableFilters = useMemo(() => [
    {
      id: 'status',
      label: 'Estado Académico',
      options: ALL_STUDENT_STATUSES.map(st => ({ label: st, value: st }))
    },
    {
      id: 'courseId',
      label: 'Cursos Formativos',
      options: courses.map(c => ({ label: c.name, value: c.id }))
    }
  ], [courses]);

  // Column definitions
  const columns: ColumnDef<Student>[] = useMemo(() => [
    {
      key: 'fullName',
      header: 'Aluno / Processo',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <img
            src={s.photoUrl}
            alt={s.fullName}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div>
            <span className="font-bold text-white group-hover:text-blue-400 transition-colors block">
              {s.fullName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {s.documentType}: {s.documentNumber}
            </span>
            <span className="text-[9px] text-amber-400 font-mono font-bold block">
              {s.code}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'courseName',
      header: 'Curso & Turma',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-200 block truncate max-w-xs">
            {s.courseName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {s.classGroupName} • {s.regime}
          </span>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contactos',
      render: (s) => (
        <div className="space-y-0.5 text-[11px]">
          <span className="text-slate-300 font-mono block">{s.phone}</span>
          <span className="text-slate-400 truncate block max-w-[170px]">{s.email}</span>
        </div>
      )
    },
    {
      key: 'attendancePercentage',
      header: 'Frequência',
      sortable: true,
      align: 'center',
      render: (s) => (
        <div className="inline-flex items-center gap-1">
          <span className={`font-bold ${s.attendancePercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {s.attendancePercentage}%
          </span>
        </div>
      )
    },
    {
      key: 'averageGrade',
      header: 'Média Final',
      sortable: true,
      align: 'center',
      render: (s) => (
        <span className="font-bold text-amber-400 font-mono">
          {s.averageGrade > 0 ? `${s.averageGrade.toFixed(1)} v.` : '—'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: (s) => {
        const badge = getStudentStatusBadgeStyle(s.status);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
            {s.status === 'Baixado' && <UserX className="w-3 h-3 shrink-0" />}
            <span>{s.status}</span>
          </span>
        );
      }
    }
  ], []);

  // Quick Actions
  const quickActions: QuickAction<Student>[] = useMemo(() => [
    {
      id: 'visualizar',
      label: 'Visualizar Ficha Rápida',
      icon: <Eye className="w-3.5 h-3.5 text-sky-400" />,
      onClick: (s) => setViewingStudent(s)
    },
    {
      id: 'perfil',
      label: 'Abrir Dossiê Completo',
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />,
      onClick: (s) => navigate('alunos_perfil', { id: s.id })
    },
    {
      id: 'editar',
      label: 'Editar Dados do Aluno',
      icon: <Edit className="w-3.5 h-3.5 text-amber-400" />,
      onClick: (s) => setEditingStudent(s)
    },
    {
      id: 'historico',
      label: 'Histórico & Auditoria',
      icon: <History className="w-3.5 h-3.5 text-purple-400" />,
      onClick: (s) => setHistoryStudent(s)
    },
    {
      id: 'whatsapp',
      label: 'Contactar via WhatsApp',
      icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />,
      onClick: (s) => openWhatsAppMessage(s.phone, `Olá ${s.fullName}, contactamos da secretaria do ${activeInstitution.name}.`)
    },
    {
      id: 'pagamento',
      label: 'Registar Pagamento de Propinas',
      icon: <CreditCard className="w-3.5 h-3.5 text-amber-400" />,
      onClick: (s) => navigate('pagamentos', { studentId: s.id })
    },
    {
      id: 'certificado',
      label: 'Emitir Certificado SIVEC',
      icon: <Award className="w-3.5 h-3.5 text-sky-400" />,
      onClick: (s) => navigate('sivec_studio', { studentId: s.id })
    },
    {
      id: 'eliminar',
      label: 'Eliminar Aluno do Sistema',
      icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
      onClick: (s) => setDeletingStudent(s)
    }
  ], [navigate, openWhatsAppMessage, activeInstitution]);

  // Mobile Card Renderer
  const renderMobileCard = (s: Student) => {
    const badge = getStudentStatusBadgeStyle(s.status);

    return (
      <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md active:bg-[#111c35]/80 transition-colors">
        {/* Top: Avatar, Name, Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={s.photoUrl}
              alt={s.fullName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">{s.fullName}</h4>
              <span className="text-[10px] text-amber-400 font-mono font-bold block">{s.code}</span>
              <span className="text-[10px] text-slate-400">{s.documentType}: {s.documentNumber}</span>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
            <span>{s.status}</span>
          </span>
        </div>

        {/* Course & Class Info */}
        <div className="bg-[#090d16] p-2.5 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Curso & Turma</span>
            <span className="text-slate-200 font-medium truncate block">{s.courseName}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Média / Freq.</span>
            <span className="text-amber-400 font-mono font-bold">
              {s.averageGrade > 0 ? `${s.averageGrade.toFixed(1)}v` : '—'} • {s.attendancePercentage}%
            </span>
          </div>
        </div>

        {/* Quick Actions Bar for Mobile */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setViewingStudent(s)}
            className="p-2 rounded-xl bg-[#111c35] text-sky-400 border border-slate-700/80 hover:bg-sky-600 hover:text-white transition-colors"
            title="Visualizar Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => setEditingStudent(s)}
            className="p-2 rounded-xl bg-[#111c35] text-amber-400 border border-slate-700/80 hover:bg-amber-600 hover:text-white transition-colors"
            title="Editar Aluno"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => setHistoryStudent(s)}
            className="p-2 rounded-xl bg-[#111c35] text-purple-400 border border-slate-700/80 hover:bg-purple-600 hover:text-white transition-colors"
            title="Ver Histórico"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('alunos_perfil', { id: s.id })}
            className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Dossiê</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => openWhatsAppMessage(s.phone, `Olá ${s.fullName}, contactamos da secretaria do ${activeInstitution.name}.`)}
            aria-label="Contactar via WhatsApp"
            className="p-2 rounded-xl bg-[#111c35] text-emerald-400 border border-slate-700/80 hover:bg-emerald-600 hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const viewingFields: DetailField[] = viewingStudent ? [
    { label: 'Nome Completo', value: viewingStudent.fullName },
    { label: 'Código SIGAR', value: <span className="font-mono text-amber-400 font-bold">{viewingStudent.code}</span> },
    { label: 'Documento', value: `${viewingStudent.documentType}: ${viewingStudent.documentNumber}` },
    { label: 'Contacto Telefónico', value: viewingStudent.phone },
    { label: 'Correio Electrónico', value: viewingStudent.email || 'Não informado' },
    { label: 'Endereço', value: viewingStudent.address || 'Não informado', fullWidth: true },
    { label: 'Curso Formativo', value: viewingStudent.courseName },
    { label: 'Turma Atribuída', value: `${viewingStudent.classGroupName} (${viewingStudent.regime})` },
    { label: 'Frequência de Aulas', value: `${viewingStudent.attendancePercentage}%` },
    { label: 'Média de Notas', value: viewingStudent.averageGrade > 0 ? `${viewingStudent.averageGrade.toFixed(1)} valores` : 'Sem avaliações' },
    { label: 'Data de Matrícula', value: viewingStudent.enrollmentDate },
    { label: 'Estado do Processo', value: viewingStudent.status }
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-600/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
              {activeInstitution.code}
            </span>
            <span className="text-xs text-slate-400">Secretaria Académica</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Gestão &amp; Cadastro de Alunos
          </h1>
          <p className="text-xs text-slate-400">
            Fichas completas, notas, contratos, pautas, frequência, histórico e emissão de cartões.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PermissionGate permission="alunos.create">
            <button
              onClick={() => navigate('alunos_cadastrar')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-900/30 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Matricular Aluno</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Quick Status Counters (Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-400 block font-medium">Total de Alunos</span>
          <span className="text-xl font-bold text-white">{students.length}</span>
          <span className="text-[10px] text-blue-400 mt-0.5 block">Matrículas no Sistema</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-400 block font-medium">Em Formação Ativa</span>
          <span className="text-xl font-bold text-emerald-400">{countActive}</span>
          <span className="text-[10px] text-emerald-500/80 mt-0.5 block">Turmas em frequência</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-400 block font-medium">Pagamentos Pendentes</span>
          <span className="text-xl font-bold text-amber-400">{countPending}</span>
          <span className="text-[10px] text-amber-500/80 mt-0.5 block">Aguardando regularização</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-400 block font-medium">Processos com Baixa</span>
          <span className="text-xl font-bold text-rose-400">{countTerminated}</span>
          <span className="text-[10px] text-rose-500/80 mt-0.5 block">Desistências / Transferências</span>
        </div>
      </div>

      {/* Professional Data Table */}
      <ProfessionalDataTable
        data={students}
        columns={columns}
        idAccessor={(s) => s.id}
        title="Quadro Geral de Discentes"
        subtitle="Registo histórico, controlo de assiduidade e situação pedagógica de cada formando."
        searchPlaceholder="Buscar por nome, BI, código ou telefone..."
        searchKeys={['fullName', 'code', 'documentNumber', 'phone', 'email', 'courseName']}
        filters={tableFilters}
        quickActions={quickActions}
        exportFileName={`Alunos_${activeInstitution.code}`}
        renderMobileCard={renderMobileCard}
        onRowClick={(s) => navigate('alunos_perfil', { id: s.id })}
        defaultRowsPerPage={10}
        badgeContent={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold">
            {students.length} Alunos
          </span>
        }
      />

      {/* Visualização Rápida de Detalhes do Aluno */}
      <RecordDetailsModal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        title={viewingStudent?.fullName || ''}
        subtitle={viewingStudent ? `${viewingStudent.courseName} • ${viewingStudent.classGroupName}` : ''}
        code={viewingStudent?.code}
        imageUrl={viewingStudent?.photoUrl}
        statusBadge={
          viewingStudent && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
              {viewingStudent.status}
            </span>
          )
        }
        fields={viewingFields}
        onEdit={() => {
          const s = viewingStudent;
          setViewingStudent(null);
          setEditingStudent(s);
        }}
        onViewHistory={() => {
          const s = viewingStudent;
          setViewingStudent(null);
          setHistoryStudent(s);
        }}
        onDelete={() => {
          const s = viewingStudent;
          setViewingStudent(null);
          setDeletingStudent(s);
        }}
      />

      {/* Edição de Aluno */}
      <StudentEditModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
      />

      {/* Histórico & Auditoria do Aluno */}
      <RecordHistoryModal
        isOpen={!!historyStudent}
        onClose={() => setHistoryStudent(null)}
        entityName={historyStudent?.fullName || 'Aluno'}
        entityId={historyStudent?.id || ''}
        entityCode={historyStudent?.code}
      />

      {/* Confirmação de Exclusão Perigosa */}
      <ConfirmationModal
        isOpen={!!deletingStudent}
        onCancel={() => setDeletingStudent(null)}
        title="Eliminar Aluno do Sistema"
        message={`Tem a certeza de que pretende eliminar definitivamente o discente ${deletingStudent?.fullName} (Código SIGAR: ${deletingStudent?.code})? Esta operação é irreversível.`}
        confirmText="Sim, Eliminar Registo"
        cancelText="Voltar"
        variant="danger"
        requiredConfirmationWord="ELIMINAR"
        onConfirm={() => {
          if (deletingStudent) {
            deleteStudent(deletingStudent.id);
            success('Aluno Eliminado', `O processo de ${deletingStudent.fullName} foi removido com sucesso.`);
            setDeletingStudent(null);
          }
        }}
      />
    </div>
  );
};
