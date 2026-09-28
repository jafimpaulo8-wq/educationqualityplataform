import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Lock, 
  Send,
  Eye,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface StudentDocumentsTabProps {
  currentStudent: Student;
  onRequestDocumentReview: () => void;
}

export const StudentDocumentsTab: React.FC<StudentDocumentsTabProps> = ({
  currentStudent,
  onRequestDocumentReview
}) => {
  const [documents, setDocuments] = useState([
    {
      id: 'doc-01',
      name: `Bilhete_de_Identidade_${currentStudent.fullName.split(' ')[0]}.pdf`,
      type: 'BI / Documento de Identificação',
      size: '1.8 MB',
      uploadDate: '2026-02-01',
      status: 'Verificado',
      notes: 'Conferido com original na Secretaria'
    },
    {
      id: 'doc-02',
      name: 'Certificado_12a_Classe_Habilitacoes.pdf',
      type: 'Certificado de Habilitações Literárias',
      size: '3.2 MB',
      uploadDate: '2026-02-01',
      status: 'Verificado',
      notes: 'Autenticado pelo Notário'
    },
    {
      id: 'doc-03',
      name: 'Cartao_NUIT_Contribuinte.pdf',
      type: 'Comprovativo de NUIT',
      size: '850 KB',
      uploadDate: '2026-02-03',
      status: 'Verificado',
      notes: 'Emitido pela Autoridade Tributária'
    },
    {
      id: 'doc-04',
      name: 'Contrato_Prestacao_Servicos_Assinado.pdf',
      type: 'Contrato Educacional Homologado',
      size: '2.4 MB',
      uploadDate: '2026-02-05',
      status: 'Verificado',
      notes: 'Assinatura digital válida'
    },
    {
      id: 'doc-05',
      name: 'Atestado_Medico_Aptidao_Fisica.pdf',
      type: 'Atestado Médico & Sanidade',
      size: '1.1 MB',
      uploadDate: '2026-02-02',
      status: 'Verificado',
      notes: 'Clínica Autorizada'
    }
  ]);

  const [newDocType, setNewDocType] = useState('Outro');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: newDocType,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        notes: 'Aguardando validação formal pela Secretaria'
      };

      setDocuments(prev => [newDoc, ...prev]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3500);
    }
  };

  return (
    <div id="student-documents-tab" className="space-y-6">
      
      {/* Banner Informativo */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Dossier Digital do Estudante
            </span>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-emerald-600" />
              Documentos & Comprovativos Arquivados
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Documentos pessoais, termos de matrícula e habilitações arquivados no arquivo digital SIGAR
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Documentos aprovados não podem ser substituídos sem autorização.</span>
          </div>
        </div>

        {/* Upload de Novo Documento */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-900">Submeter Documento Complementar à Secretaria</h3>
            <p className="text-[11px] text-slate-500">
              Envie cópias de BI atualizado, declarações de dispensa ou atestados médicos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={newDocType}
              onChange={e => setNewDocType(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
            >
              <option value="BI / Documento de Identificação">BI / Passaporte Renovado</option>
              <option value="Atestado Médico">Atestado Médico</option>
              <option value="Declaração de Trabalho">Declaração de Trabalho</option>
              <option value="Comprovativo Residencial">Comprovativo de Residência</option>
              <option value="Outro">Outro Documento</option>
            </select>

            <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Anexar Ficheiro</span>
              <input
                type="file"
                className="hidden"
                onChange={handleSimulatedUpload}
              />
            </label>
          </div>
        </div>

        {uploadSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Documento enviado com sucesso! Está registrado com status "Pendente" para conferência na secretaria.</span>
          </div>
        )}
      </div>

      {/* Tabela de Documentos no Dossier */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">Relação de Documentos Oficiais ({documents.length})</h3>
          <span className="text-[11px] text-slate-400 font-mono">Dossier: {currentStudent.code}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">Nome do Ficheiro</th>
                <th className="px-4 py-3">Tipo de Documento</th>
                <th className="px-4 py-3">Data de Upload</th>
                <th className="px-4 py-3">Tamanho</th>
                <th className="px-4 py-3 text-center">Status na Secretaria</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{doc.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">{doc.type}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono">{doc.uploadDate}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono">{doc.size}</td>
                  <td className="px-4 py-3.5 text-center">
                    {doc.status === 'Verificado' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[11px]">
                        <Clock className="w-3 h-3" />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Abrindo visualização do documento oficial: ${doc.name}`)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition cursor-pointer"
                    >
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
