import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Camera, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  FileText,
  UploadCloud,
  Paperclip,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PROVINCES_MOZAMBIQUE } from '../../data/mockData';
import { StudentAttachedDocument, StudentStatus } from '../../types';

export const StudentRegistrationForm: React.FC = () => {
  const { courses, classes, addStudent, navigate, activeInstitution, activeBranch, activeBranchId } = useApp();

  // 1. Identificação Pessoal
  const [fullName, setFullName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [gender, setGender] = useState<'Masculino' | 'Feminino' | 'Outro'>('Masculino');
  const [birthDate, setBirthDate] = useState('2003-05-20');
  const [documentType, setDocumentType] = useState<'BI' | 'DIRE' | 'Passaporte'>('BI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [nuit, setNuit] = useState('');

  // 2. Contactos & Residência
  const [phone, setPhone] = useState('+258 84 ');
  const [whatsapp, setWhatsapp] = useState('+258 84 ');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('Maputo Cidade');
  const [city, setCity] = useState('Maputo');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');

  // 3. Encarregado de Educação & Emergência
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+258 82 ');
  const [emergencyContact, setEmergencyContact] = useState('');

  // 4. Fotografia
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80');

  const samplePhotos = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80'
  ];

  // 5. Documentos Anexados
  const [attachedDocuments, setAttachedDocuments] = useState<StudentAttachedDocument[]>([
    {
      id: 'doc-init-bi',
      name: 'Copia_BI_Frente_Verso.pdf',
      type: 'BI',
      url: '#',
      size: '1.4 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Pendente'
    }
  ]);
  const [docNameInput, setDocNameInput] = useState('');
  const [docTypeInput, setDocTypeInput] = useState<StudentAttachedDocument['type']>('Certificado de Habilitações');

  // 6. Observações
  const [notes, setNotes] = useState('');

  // 7. Dados Acadêmicos & Matrícula
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [regime, setRegime] = useState<'Laboral' | 'Pós-Laboral' | 'Híbrido' | 'Online EAD'>('Pós-Laboral');
  const [paymentStatus, setPaymentStatus] = useState<'Pago' | 'Pendente'>('Pago');
  const [initialStatus, setInitialStatus] = useState<StudentStatus>('Matriculado');

  const handleAddDocument = () => {
    if (!docNameInput.trim()) return;
    const newDoc: StudentAttachedDocument = {
      id: `doc-${Date.now()}`,
      name: docNameInput.endsWith('.pdf') ? docNameInput : `${docNameInput}.pdf`,
      type: docTypeInput,
      url: '#',
      size: '2.1 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Verificado'
    };
    setAttachedDocuments(prev => [...prev, newDoc]);
    setDocNameInput('');
  };

  const handleRemoveDocument = (id: string) => {
    setAttachedDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !documentNumber) {
      alert('Por favor preencha os campos obrigatórios (Nome Completo e Número de Documento).');
      return;
    }

    const courseObj = courses.find(c => c.id === selectedCourseId);
    const classObj = classes.find(c => c.id === selectedClassId);

    const targetBranchId = activeBranchId !== 'todas' ? activeBranchId : (activeInstitution.branches?.[0]?.id || 'branch-default');

    const createdStudent = addStudent({
      institutionId: activeInstitution.id,
      fullName,
      socialName: socialName.trim() || undefined,
      gender,
      birthDate,
      documentType,
      documentNumber,
      nuit: nuit.trim() || undefined,
      phone,
      whatsapp: whatsapp.trim() || phone,
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      province,
      city,
      neighborhood: neighborhood.trim() || 'Central',
      address: address.trim() || `${city}, ${province}`,
      photoUrl,
      guardianName: guardianName.trim() || 'O Próprio',
      guardianPhone: guardianPhone.trim() || phone,
      emergencyContact: emergencyContact.trim() || phone,
      notes: notes.trim() || 'Matrícula efetuada via Secretaria Central com documentação regular.',
      attachedDocuments,
      courseId: selectedCourseId,
      courseName: courseObj?.name || 'Curso Moztechwave',
      classGroupId: selectedClassId,
      classGroupName: classObj?.name || 'Turma A',
      regime,
      status: initialStatus,
      enrollmentDate: new Date().toISOString().split('T')[0],
      paymentStatus,
      balanceOwing: paymentStatus === 'Pago' ? 0 : (courseObj?.feeMonthly || 3500),
      attendancePercentage: 100,
      averageGrade: 0,
      assessments: [],
      branchId: targetBranchId,
      historyEvents: [
        {
          id: `he-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: 'Matrícula Inicial Efetivada',
          category: 'matrícula',
          description: `Ingresso registrado no curso ${courseObj?.name} (${regime}) na turma ${classObj?.name}.`,
          recordedBy: activeInstitution.representativeName
        }
      ],
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString('pt-MZ'),
          actorName: activeInstitution.representativeName,
          actorRole: 'Secretaria / Direção',
          action: 'CADASTRO_COMPLETO_ALUNO',
          details: `Novo processo gerado com ${attachedDocuments.length} documentos anexados.`
        }
      ]
    });

    // Directly open the comprehensive student profile!
    navigate('alunos_perfil', { id: createdStudent.id });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('alunos_list')}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {activeInstitution.code}
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Dossiê Oficial SIGAR &amp; SIVERC
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cadastro Completo de Aluno
            </h1>
            <p className="text-xs text-slate-400">
              Formulário homologado com todos os dados pessoais, legais, fiscais, contactos e documentação exigida.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('alunos_list')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white cursor-pointer"
        >
          Voltar para Lista
        </button>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
        
        {/* ===================================================================
            SEÇÃO 1: FOTOGRAFIA & IDENTIFICAÇÃO PESSOAL
            =================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              1. Fotografia &amp; Identificação Pessoal
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Campos com (*) são obrigatórios</span>
          </div>

          {/* Fotografia */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
            <label className="text-xs font-bold text-white block">
              Fotografia do Aluno (Para Cartão Digital, Pautas &amp; Certificado)
            </label>
            <div className="flex flex-wrap items-center gap-5">
              <img
                src={photoUrl}
                alt="Foto Selecionada"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-sky-500 shadow-xl"
              />
              <div className="space-y-2">
                <span className="text-xs text-slate-400 block">
                  Selecione uma foto predefinida ou informe a URL:
                </span>
                <div className="flex flex-wrap gap-2">
                  {samplePhotos.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPhotoUrl(url)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        photoUrl === url ? 'border-sky-400 scale-105 shadow' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="URL customizada da fotografia (https://...)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full sm:w-80 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Dados Pessoais Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nome Completo */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Benedito Américo Langa"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            {/* Nome Social (Opcional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Nome Social (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Ben Langa"
                value={socialName}
                onChange={(e) => setSocialName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Sexo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Sexo / Gênero *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Data de Nascimento *</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Tipo de Documento */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tipo de Documento *</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="BI">Bilhete de Identidade (BI)</option>
                <option value="DIRE">DIRE (Estrangeiros)</option>
                <option value="Passaporte">Passaporte Internacional</option>
              </select>
            </div>

            {/* BI / Número do Documento */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">BI / Número do Documento *</label>
              <input
                type="text"
                required
                placeholder="Ex: 110293847182A"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>

            {/* NUIT quando aplicável */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">NUIT (Quando Aplicável)</label>
              <input
                type="text"
                placeholder="Ex: 400129841"
                value={nuit}
                onChange={(e) => setNuit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================
            SEÇÃO 2: CONTACTOS & ENDEREÇO
            =================================================================== */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              2. Contactos &amp; Localização
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Telefone Principal *</label>
              <input
                type="text"
                required
                placeholder="+258 84 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">WhatsApp Oficial *</label>
              <input
                type="text"
                required
                placeholder="+258 84 123 4567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">E-mail *</label>
              <input
                type="email"
                placeholder="estudante@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Província */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Província *</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {PROVINCES_MOZAMBIQUE.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Cidade */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Cidade *</label>
              <input
                type="text"
                required
                placeholder="Ex: Maputo, Matola, Beira, Nampula..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Bairro */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Bairro *</label>
              <input
                type="text"
                required
                placeholder="Ex: Malhangalene, Sommerschield, Machava..."
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Endereço Completo */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-slate-300">Endereço Completo (Rua / Avenida / Número de Casa)</label>
              <input
                type="text"
                placeholder="Ex: Av. Eduardo Mondlane nº 1200, Edifício Zimpeto, 2º Andar"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================
            SEÇÃO 3: ENCARREGADO / RESPONSÁVEL & CONTACTO DE EMERGÊNCIA
            =================================================================== */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              3. Responsável / Encarregado &amp; Contacto de Emergência
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Responsável/Encarregado */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Responsável / Encarregado</label>
              <input
                type="text"
                placeholder="Ex: Tomás Mabunda (Pai / Encarregado)"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Contacto do Responsável */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Contacto do Responsável</label>
              <input
                type="text"
                placeholder="+258 82 123 4567"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Contacto de Emergência */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Contacto de Emergência</label>
              <input
                type="text"
                placeholder="+258 84 987 6543 (Irmão / Cônjuge)"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================
            SEÇÃO 4: CURSO, TURMA & REGIME DE FORMAÇÃO
            =================================================================== */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              4. Atribuição de Curso, Turma &amp; Regime
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Curso Escolhido *</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.duration} - Propina: {c.feeMonthly.toLocaleString()} MT/mês)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Turma Designada *</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {classes.map(cl => (
                  <option key={cl.id} value={cl.id}>{cl.name} ({cl.shift})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Regime de Aulas *</label>
              <select
                value={regime}
                onChange={(e) => setRegime(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Laboral">Laboral (Manhã / Tarde)</option>
                <option value="Pós-Laboral">Pós-Laboral (Noturno)</option>
                <option value="Híbrido">Híbrido (Presencial + EAD)</option>
                <option value="Online EAD">Online EAD 100%</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Estado Inicial Regulamentar *</label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Matriculado">Matriculado (Matrícula Concluída)</option>
                <option value="Ativo">Ativo (Frequência Regular)</option>
                <option value="Em curso">Em curso (Aulas em Andamento)</option>
                <option value="Inscrito">Inscrito (Inscrição Confirmada)</option>
                <option value="Pré-inscrito">Pré-inscrito (Candidatura Pendente)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Taxa Inicial de Matrícula</label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    checked={paymentStatus === 'Pago'}
                    onChange={() => setPaymentStatus('Pago')}
                    className="accent-emerald-500"
                  />
                  <span>Pago (1.500 MT)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    checked={paymentStatus === 'Pendente'}
                    onChange={() => setPaymentStatus('Pendente')}
                    className="accent-amber-500"
                  />
                  <span>Pendente</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SEÇÃO 5: DOCUMENTOS ANEXADOS
            =================================================================== */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-teal-400" />
              5. Documentos Anexados ao Processo
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {attachedDocuments.length} anexados
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Nome do Documento (Ex: Certificado_12a.pdf)"
                value={docNameInput}
                onChange={(e) => setDocNameInput(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
              />

              <select
                value={docTypeInput}
                onChange={(e: any) => setDocTypeInput(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="BI">Cópia do BI / Passaporte</option>
                <option value="Certificado de Habilitações">Certificado de Habilitações</option>
                <option value="Atestado Médico">Atestado Médico de Aptidão</option>
                <option value="Comprovativo de Residência">Comprovativo de Residência</option>
                <option value="Contrato Assinado">Contrato de Formação</option>
                <option value="Outro">Outro Documento</option>
              </select>

              <button
                type="button"
                onClick={handleAddDocument}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Anexar</span>
              </button>
            </div>

            {/* Lista de Documentos Anexados */}
            <div className="space-y-2 pt-2">
              {attachedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="text-white font-semibold truncate">{doc.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {doc.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{doc.size}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================
            SEÇÃO 6: OBSERVAÇÕES
            =================================================================== */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              6. Observações &amp; Notas Administrativas
            </h3>
          </div>

          <textarea
            rows={3}
            placeholder="Informações adicionais, observações médicas, necessidades especiais, acordos de pagamento..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
          />
        </div>

        {/* ===================================================================
            RODAPÉ DO FORMULÁRIO COM SUBMISSÃO
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate('alunos_list')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-750"
          >
            Cancelar Cadastro
          </button>

          <button
            type="submit"
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-sky-500/20 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Gravar Cadastro Completo &amp; Abrir Perfil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
