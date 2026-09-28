import React, { useState } from 'react';
import { ContractTemplate } from '../../types';
import { FilePlus, Check, X, Sparkles, Sliders } from 'lucide-react';

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (data: Omit<ContractTemplate, 'id' | 'versionHistory' | 'updatedAt'>) => void;
  availableTags: { tag: string; label: string }[];
}

export const NewTemplateModal: React.FC<NewTemplateModalProps> = ({
  isOpen,
  onClose,
  onCreateTemplate,
  availableTags
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'formacao' | 'estagio' | 'financeiro' | 'admissao'>('formacao');
  const [version, setVersion] = useState('v1.0');
  const [content, setContent] = useState(
`Pelo presente instrumento particular de Contrato de Formação Técnico-Profissional, de um lado {{instituicao}}, neste ato representada por seu Diretor Geral {{diretor}}, e de outro lado o(a) formando(a) {{nome_aluno}}, inscrito(a) na turma {{turma}} do curso de {{curso}}, ajustam as cláusulas a seguir:

CLÁUSULA PRIMEIRA - DO OBJETO:
O presente contrato tem por objeto a prestação de serviços educacionais de nível técnico profissionalizante para o curso {{curso}}, com duração regular de {{duracao}}, ministrado nas dependências de {{instituicao}}.

CLÁUSULA SEGUNDA - DO VALOR E CONDICIONALISMOS:
Pela prestação dos serviços contratados, o(a) formando(a) obriga-se ao pagamento da contraprestação financeira no montante global ou mensal de {{valor}} Meticais, liquidável até o 10º dia de cada mês letivo.

CLÁUSULA TERCEIRA - DA FREQUÊNCIA E AVALIAÇÃO:
O formando compromete-se a cumprir a assiduidade mínima regulamentar de 80% das horas-aulas ministradas e atingir nota mínima de 10.0 (dez) valores na escala pedagógica nacional de 0 a 20 valores.

E por estarem de acordo, lavram o presente termo em Maputo, na data de {{data}}.`
  );

  const handleInsertTag = (tag: string) => {
    setContent(prev => prev + ' ' + tag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !content.trim()) return;

    onCreateTemplate({
      name,
      title,
      type: category,
      version: version || 'v1.0',
      content,
      isDefault: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                <FilePlus className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono text-pink-400 font-bold uppercase">
                Gabinete Jurídico &amp; Minutas Oficiais
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Criar Novo Modelo de Contrato
            </h3>
            <p className="text-xs text-slate-400">
              Defina as cláusulas contratuais e utilize tags dinâmicas para preenchimento automático.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Nome Identificador do Modelo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Contrato de Especialização Noturna"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Versão Inicial</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-hidden focus:border-pink-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Título Formal do Cabeçalho</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: TERMO DE ADESÃO E COMPROMISSO EDUCACIONAL"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold uppercase focus:outline-hidden focus:border-pink-500"
            />
          </div>

          {/* Seletor de Tags Rápidas */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 block">
              Variáveis Obrigatórias e Disponíveis (Clique para Adicionar):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(({ tag, label }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-pink-400 text-[11px] font-mono text-pink-300 hover:text-white cursor-pointer transition-all"
                  title={label}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Editor de Texto das Cláusulas */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Corpo das Cláusulas &amp; Termos</label>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs leading-relaxed focus:outline-hidden focus:border-pink-500 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Novo Modelo Oficial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
