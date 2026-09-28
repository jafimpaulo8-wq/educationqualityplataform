import React, { useState } from 'react';
import { X, Plus, FileText, Sparkles, Layout } from 'lucide-react';
import { DocumentCategory, DocumentFormat, StudioTemplate } from '../../types/studio';

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newTemplate: Partial<StudioTemplate>) => void;
  activeInstitutionId: string;
}

export const NewTemplateModal: React.FC<NewTemplateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  activeInstitutionId
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('certificado');
  const [format, setFormat] = useState<DocumentFormat>('A4_Horizontal');
  const [description, setDescription] = useState('');
  const [hasBackSide, setHasBackSide] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      category,
      format,
      description: description.trim() || `Modelo oficial de ${category}`,
      hasBackSide,
      institutionId: activeInstitutionId
    });

    onClose();
  };

  const handleCategoryChange = (cat: DocumentCategory) => {
    setCategory(cat);
    // Suggest natural defaults
    if (cat === 'certificado' || cat === 'pauta' || cat === 'carta_operador') {
      setFormat('A4_Horizontal');
      setHasBackSide(false);
    } else if (cat === 'carteirinha' || cat === 'cartao_operador') {
      setFormat('Carteirinha');
      setHasBackSide(true);
    } else if (cat === 'contrato' || cat === 'ficha_matricula' || cat === 'termo_compromisso') {
      setFormat('A4_Vertical');
      setHasBackSide(true);
    } else {
      setFormat('A4_Vertical');
      setHasBackSide(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Criar Novo Modelo de Documento
              </h2>
              <p className="text-xs text-slate-500">
                Personalizado para a instituição com editor gráfico profissional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nome do Modelo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Certificado de Conclusão de Curso 2026"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tipo de Documento
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as DocumentCategory)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
              >
                <optgroup label="Contratos & Termos">
                  <option value="contrato">Contrato de Formação</option>
                  <option value="termo_compromisso">Termo de Compromisso</option>
                  <option value="termo_responsabilidade">Termo de Responsabilidade</option>
                </optgroup>
                <optgroup label="Declarações Oficiais">
                  <option value="declaracao">Declaração Geral</option>
                  <option value="declaracao_conclusao">Declaração de Conclusão</option>
                  <option value="declaracao_estagio">Declaração de Estágio</option>
                  <option value="declaracao_frequencia">Declaração de Frequência</option>
                </optgroup>
                <optgroup label="Secretaria & Admissão">
                  <option value="ficha_matricula">Ficha de Matrícula</option>
                  <option value="ficha_inscricao">Ficha de Inscrição</option>
                  <option value="requerimento">Requerimento</option>
                </optgroup>
                <optgroup label="Financeiro">
                  <option value="recibo">Recibo Oficial</option>
                  <option value="comprovativo">Comprovativo de Pagamento</option>
                </optgroup>
                <optgroup label="Identificação & Certificação">
                  <option value="carteirinha">Cartão de Estudante (PVC)</option>
                  <option value="cartao_operador">Cartão de Operador</option>
                  <option value="certificado">Certificado de Conclusão</option>
                  <option value="carta_operador">Carta de Operador</option>
                </optgroup>
                <optgroup label="Outros">
                  <option value="personalizado">Documento Personalizado</option>
                  <option value="pauta">Pauta Oficial</option>
                  <option value="boletim">Boletim de Notas</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Formato do Papel
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as DocumentFormat)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
              >
                <option value="A4_Vertical">A4 Vertical (Retrato)</option>
                <option value="A4_Horizontal">A4 Horizontal (Paisagem)</option>
                <option value="Carteirinha">Carteirinha / Cartão PVC</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Descrição / Finalidade
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a utilização oficial deste modelo..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="chk-hasback"
              checked={hasBackSide}
              onChange={(e) => setHasBackSide(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
            />
            <label htmlFor="chk-hasback" className="text-xs text-slate-700 font-bold cursor-pointer">
              Habilitar Verso (Frente e Verso)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors shadow-xs"
            >
              Criar Modelo & Abrir Editor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
