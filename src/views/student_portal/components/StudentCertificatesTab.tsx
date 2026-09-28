import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  Award, 
  Download, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  Send, 
  CheckCircle2, 
  FileCheck, 
  ExternalLink,
  X,
  FileText
} from 'lucide-react';

interface StudentCertificatesTabProps {
  currentStudent: Student;
  onRequestCertificateChange: (refInfo?: string) => void;
}

export const StudentCertificatesTab: React.FC<StudentCertificatesTabProps> = ({
  currentStudent,
  onRequestCertificateChange
}) => {
  const { activeInstitution } = useApp();

  const certificates = [
    {
      id: 'cert-01',
      title: 'Certificado de Conclusão Técnico-Profissional',
      courseName: currentStudent.courseName,
      code: `MTW-CERT-2026-${currentStudent.code.slice(-4)}`,
      issueDate: '15 de Agosto de 2026',
      hours: 1200,
      grade: `${currentStudent.averageGrade} Valores (Distinção e Mérito)`,
      authHash: 'e7c90b41aa891048b71d99e034ac2b6f',
      status: 'Homologado',
      validationUrl: `https://sigar.moztechwave.co.mz/validar/MTW-CERT-2026-${currentStudent.code.slice(-4)}`,
      type: 'Diploma de Habilitação'
    },
    {
      id: 'cert-02',
      title: 'Certificado Modular Intermédio: Desenvolvimento Full-Stack & APIs',
      courseName: 'Módulo II - Programação Avançada',
      code: `MTW-MOD-2026-${currentStudent.code.slice(-4)}-B`,
      issueDate: '30 de Junho de 2026',
      hours: 480,
      grade: '18.0 Valores',
      authHash: '88c1092b7719fba0124c90e812f90a1b',
      status: 'Homologado',
      validationUrl: `https://sigar.moztechwave.co.mz/validar/MTW-MOD-2026-${currentStudent.code.slice(-4)}-B`,
      type: 'Certificação Modular'
    },
    {
      id: 'cert-03',
      title: 'Declaração Oficial de Matrícula & Frequência',
      courseName: currentStudent.courseName,
      code: `MTW-DEC-2026-${currentStudent.code.slice(-4)}`,
      issueDate: '01 de Setembro de 2026',
      hours: 1200,
      grade: 'Assíduo (96% de Presença)',
      authHash: '55a90192bc8740192eab88192a01f92c',
      status: 'Válido',
      validationUrl: `https://sigar.moztechwave.co.mz/validar/MTW-DEC-2026-${currentStudent.code.slice(-4)}`,
      type: 'Declaração com Notas'
    }
  ];

  const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null);

  return (
    <div id="student-certificates-tab" className="space-y-6">
      
      {/* Banner de Proteção de Certificados */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 text-amber-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Certificados Oficiais Protegidos (Somente Leitura)
              </h3>
              <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Fé Pública SIVEC
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
              Os diplomas, certificados e declarações com validação SIVEC possuem validade jurídica nacional e <strong>não podem ser alterados pelo aluno</strong>. Para emissão de 2ª via ou correção de grafia, requisite os serviços da secretaria.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRequestCertificateChange()}
          className="px-4 py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Solicitar 2ª Via ou Declaração</span>
        </button>
      </div>

      {/* Lista de Certificados do Aluno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {certificates.map(cert => (
          <div
            key={cert.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold uppercase">
                  {cert.type}
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-400">
                  {cert.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{cert.title}</h3>
              <p className="text-xs text-slate-500 font-mono">{cert.code}</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Carga Horária:</span>
                  <span className="font-bold text-slate-900">{cert.hours} Horas</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Aproveitamento:</span>
                  <span className="font-bold text-emerald-700">{cert.grade}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Data de Emissão:</span>
                  <span className="font-medium text-slate-800">{cert.issueDate}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCert(cert)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ver Certificado</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CERTIFICADO EM ALTA RESOLUÇÃO */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">{selectedCert.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificado Visual com Borda Estilizada de Segurança */}
            <div className="p-8 overflow-y-auto bg-amber-50/30 text-center space-y-6 border-8 border-double border-amber-800/30 m-4 rounded-xl">
              <div className="space-y-1">
                <h4 className="text-xs tracking-widest text-slate-500 uppercase font-serif">
                  República de Moçambique • Ministério da Educação
                </h4>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                  {activeInstitution?.name || 'Moztechwave Professional Institute'}
                </h3>
              </div>

              <div className="py-2">
                <span className="text-2xl font-serif font-black text-amber-900 tracking-widest uppercase block">
                  CERTIFICADO
                </span>
                <p className="text-xs text-slate-500 italic mt-1">
                  Certificamos para os devidos efeitos legais e profissionais que
                </p>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-950 underline decoration-amber-600 decoration-1 underline-offset-8">
                  {currentStudent.fullName}
                </h2>
                <p className="text-xs text-slate-500 pt-2">
                  Portador do {currentStudent.documentType} nº {currentStudent.documentNumber}
                </p>
              </div>

              <p className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed">
                Concluiu com aproveitamento e dedicação exemplar o programa de formação em{' '}
                <strong>{selectedCert.courseName}</strong>, com uma carga horária total de{' '}
                <strong>{selectedCert.hours} Horas</strong>, tendo obtido a classificação final de{' '}
                <strong>{selectedCert.grade}</strong>.
              </p>

              {/* Autenticação e QR Code */}
              <div className="pt-6 border-t border-amber-900/20 flex items-center justify-between text-left text-[11px] text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white border border-amber-800/30 rounded p-1 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div className="font-mono text-[10px] space-y-0.5">
                    <p className="font-bold text-slate-900">{selectedCert.code}</p>
                    <p>Chave: {selectedCert.authHash.slice(0, 16)}...</p>
                    <p>Data: {selectedCert.issueDate}</p>
                  </div>
                </div>

                <div className="text-center text-[10px]">
                  <div className="w-32 border-b border-slate-700 pb-1 mb-1 font-semibold text-slate-900">
                    Direção Geral
                  </div>
                  <span>Chancela SIVEC</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
