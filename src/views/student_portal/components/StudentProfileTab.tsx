import React from 'react';
import { Student } from '../../../types';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Send, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Building2,
  HeartHandshake
} from 'lucide-react';

interface StudentProfileTabProps {
  currentStudent: Student;
  onRequestChange: () => void;
}

export const StudentProfileTab: React.FC<StudentProfileTabProps> = ({
  currentStudent,
  onRequestChange
}) => {
  return (
    <div id="student-profile-tab" className="space-y-6">
      {/* Banner de Proteção Administrativa & Solicitação à Secretaria */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 text-amber-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Dados Administrativos Protegidos (Somente Leitura)
              </h3>
              <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Auditoria SIGAR
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
              Por razões de segurança e integridade de registros oficiais, o aluno <strong>não pode editar diretamente</strong> seus dados biográficos, filiação, números de documentos ou contactos oficiais. Caso necessite atualizar ou retificar qualquer informação, submeta um pedido à secretaria.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRequestChange}
          className="px-4 py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Solicitar Retificação à Secretaria</span>
        </button>
      </div>

      {/* Grid de Informações do Perfil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cartão de Identificação Biográfica */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <User className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Identificação Pessoal</h2>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <img
              src={currentStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={currentStudent.fullName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentStudent.fullName}</h3>
              {currentStudent.socialName && (
                <p className="text-xs text-slate-500 italic">Nome Social: {currentStudent.socialName}</p>
              )}
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs rounded-full font-semibold">
                Matrícula: {currentStudent.code}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Documento de Identidade:</span>
              <span className="font-semibold text-slate-900 font-mono">{currentStudent.documentType} nº {currentStudent.documentNumber}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">NUIT Fiscal:</span>
              <span className="font-semibold text-slate-900 font-mono">{currentStudent.nuit || 'Cadastrado'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Data de Nascimento:</span>
              <span className="font-semibold text-slate-900">{currentStudent.birthDate}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Gênero:</span>
              <span className="font-semibold text-slate-900">{currentStudent.gender}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Data de Ingresso:</span>
              <span className="font-semibold text-slate-900">{currentStudent.enrollmentDate}</span>
            </div>
          </div>
        </div>

        {/* Contactos & Localização */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Phone className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Contactos & Morada</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Telefone Principal:</span>
              </div>
              <p className="font-bold text-slate-900 font-mono pl-5">{currentStudent.phone}</p>
            </div>

            {currentStudent.whatsapp && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp:</span>
                </div>
                <p className="font-bold text-emerald-700 font-mono pl-5">{currentStudent.whatsapp}</p>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Correio Eletrônico (E-mail):</span>
              </div>
              <p className="font-bold text-slate-900 pl-5 break-all">{currentStudent.email}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Endereço Residencial:</span>
              </div>
              <p className="font-semibold text-slate-800 pl-5 leading-relaxed">
                {currentStudent.address}
                <br />
                <span className="text-slate-500 text-[11px] font-normal">
                  {currentStudent.city} • Província de {currentStudent.province}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Encarregado de Educação & Situação Administrativa */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Filiação & Emergência</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">
                Encarregado de Educação / Responsável Legal
              </span>
              <p className="font-bold text-slate-900 text-sm">{currentStudent.guardianName || 'Não especificado'}</p>
              {currentStudent.guardianPhone && (
                <p className="text-slate-600 font-mono text-xs flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {currentStudent.guardianPhone}
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">
                Contacto em Caso de Emergência
              </span>
              <p className="font-bold text-slate-900 text-sm">{currentStudent.emergencyContact}</p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
              <span className="text-emerald-800 uppercase font-semibold text-[10px] tracking-wider block">
                Situação Acadêmica e Regime
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Regime de Aulas:</span>
                <span className="font-bold text-slate-900">{currentStudent.regime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Estado da Matrícula:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                  {currentStudent.status}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
