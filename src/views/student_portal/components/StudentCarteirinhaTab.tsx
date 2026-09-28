import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { RealQRCode } from '../../../components/common/RealQRCode';
import { 
  CreditCard, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  RotateCw,
  Award
} from 'lucide-react';

interface StudentCarteirinhaTabProps {
  currentStudent: Student;
}

export const StudentCarteirinhaTab: React.FC<StudentCarteirinhaTabProps> = ({ currentStudent }) => {
  const { activeInstitution } = useApp();
  const [cardSide, setCardSide] = useState<'frente' | 'verso'>('frente');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="student-carteirinha-tab" className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Identidade Estudantil Oficial
          </span>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            Carteirinha Digital do Estudante
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cartão de identificação acadêmica oficial com validação biométrica por QR Code e validade anual
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCardSide(cardSide === 'frente' ? 'verso' : 'frente')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Virar para {cardSide === 'frente' ? 'Verso' : 'Frente'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Carteirinha</span>
          </button>
        </div>
      </div>

      {/* RENDERIZAÇÃO DO CARTÃO DIGITAL EM FORMATO CR-80 PADRÃO */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-100/70 rounded-3xl border border-slate-200">
        
        {cardSide === 'frente' ? (
          /* FRENTE DO CARTÃO */
          <div className="w-full max-w-md aspect-[1.586] rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-700/50">
            {/* Linhas holográficas de fundo */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

            {/* Topo do cartão */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-black text-xs text-emerald-300">
                  MTW
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    {activeInstitution?.name || 'Moztechwave Institute'}
                  </h3>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-mono">
                    CARTÃO DE ESTUDANTE • 2026
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VÁLIDO
              </div>
            </div>

            {/* Centro do cartão */}
            <div className="flex items-center gap-4 relative z-10 my-2">
              <img
                src={currentStudent.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`}
                alt={currentStudent.fullName}
                className="w-16 h-20 rounded-xl object-cover border-2 border-emerald-400/60 shadow-md shrink-0"
              />

              <div className="space-y-1 min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-mono">Nome do Estudante</p>
                <h4 className="text-sm font-black text-white truncate leading-tight">
                  {currentStudent.fullName}
                </h4>
                <p className="text-xs text-emerald-400 font-bold truncate">
                  {currentStudent.courseName}
                </p>
                <p className="text-[10px] text-slate-300 font-mono">
                  Turma: {currentStudent.classGroupName} ({currentStudent.regime})
                </p>
              </div>
            </div>

            {/* Rodapé do cartão */}
            <div className="flex items-end justify-between border-t border-slate-700/60 pt-2.5 relative z-10 text-[10px]">
              <div>
                <span className="text-[8px] text-slate-400 uppercase block font-mono">Matrícula</span>
                <span className="font-mono font-bold text-white tracking-wider">{currentStudent.code}</span>
              </div>

              <div>
                <span className="text-[8px] text-slate-400 uppercase block font-mono">BI / Passaporte</span>
                <span className="font-mono font-medium text-slate-200">{currentStudent.documentNumber}</span>
              </div>

              <div>
                <span className="text-[8px] text-slate-400 uppercase block font-mono">Validade</span>
                <span className="font-mono font-bold text-emerald-400">31/12/2026</span>
              </div>
            </div>
          </div>
        ) : (
          /* VERSO DO CARTÃO */
          <div className="w-full max-w-md aspect-[1.586] rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-700/50">
            {/* Faixa magnética decorativa */}
            <div className="w-full h-8 bg-slate-950 -mx-6 -mt-1" />

            <div className="flex items-center justify-between gap-4 my-2">
              <div className="space-y-1 text-[10px] text-slate-300 max-w-[240px] leading-tight">
                <p className="font-bold text-white uppercase">Uso Pessoal & Intransferível</p>
                <p className="text-[9px] text-slate-400">
                  Este documento comprova a inscrição regular do estudante. Garante direitos e benefícios legais em transportes, bibliotecas e eventos culturais em todo o território de Moçambique.
                </p>
                <p className="text-[9px] text-emerald-400 font-mono pt-1">
                  Chave SIVEC: {currentStudent.id.slice(0, 12)}
                </p>
              </div>

              <div className="p-1.5 bg-white rounded-xl shadow-md shrink-0">
                <RealQRCode
                  value={JSON.stringify({
                    uid: currentStudent.userId || currentStudent.id,
                    numAluno: currentStudent.code,
                    institutionId: activeInstitution?.id || 'moztechwave-core',
                    validade: '31/12/2026'
                  })}
                  size={76}
                />
              </div>
            </div>

            <div className="border-t border-slate-700/60 pt-2 flex items-center justify-between text-[9px] text-slate-400">
              <span>Emissão: SIVEC / SIGAR Nacional</span>
              <span className="font-mono">www.moztechwave.co.mz</span>
            </div>
          </div>
        )}

      </div>

      {/* Benefícios e Instruções de Uso */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Instruções de Uso & Benefícios Estudantis
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
          <li>Apresente esta carteirinha digital nos transportes públicos municipais (TPM/Metrobus) para usufruir da tarifa social de estudante.</li>
          <li>Acesso gratuito ou com desconto na Rede Nacional de Bibliotecas, salas de estudo e centros de pesquisa conveniados.</li>
          <li>Descontos em livrarias parceiras, papelarias técnicas e eventos científicos credenciados.</li>
          <li>A validação de autenticidade é feita instantaneamente através do leitor de QR Code pelas autoridades competentes.</li>
        </ul>
      </div>

    </div>
  );
};
