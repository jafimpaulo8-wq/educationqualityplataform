import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Send,
  FileCheck2,
  DollarSign,
  Smartphone,
  Building,
  Lock,
  RefreshCw,
  Sparkles,
  Printer,
  Copy,
  Check,
  User,
  Bell,
  Receipt,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  PAYMENT_WORKFLOW_STEPS,
  AVAILABLE_PAYMENT_SERVICES,
  INITIAL_PAYMENT_ORDERS,
  PaymentOrderRecord,
  PaymentServiceOption,
  PaymentStepKey
} from '../../services/paymentWorkflowService';

export const PaymentWorkflowView: React.FC = () => {
  const { activeInstitution } = useApp();
  const currentInstitution = activeInstitution;

  const [orders, setOrders] = useState<PaymentOrderRecord[]>(INITIAL_PAYMENT_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(INITIAL_PAYMENT_ORDERS[1].id); // order 2 is pending
  const [activeTab, setActiveTab] = useState<'timeline' | 'aluno_simulator' | 'financeiro_approver' | 'receipt_view'>('timeline');

  // Student checkout simulator states
  const [selectedServiceId, setSelectedServiceId] = useState<string>(AVAILABLE_PAYMENT_SERVICES[0].id);
  const [selectedMethod, setSelectedMethod] = useState<'M-Pesa' | 'e-Mola' | 'Transferência BIM'>('M-Pesa');
  const [transactionCodeInput, setTransactionCodeInput] = useState('MP260922.' + Math.floor(1000 + Math.random() * 9000) + '.A' + Math.floor(10000 + Math.random() * 90000));
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const currentOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  // Advance step by step
  const handleAdvanceStep = () => {
    if (currentOrder.currentStepIndex >= 14) return;

    const nextIndex = currentOrder.currentStepIndex + 1;
    const nextStepDef = PAYMENT_WORKFLOW_STEPS[nextIndex];

    const updated = orders.map(ord => {
      if (ord.id === currentOrder.id) {
        const newLogs = [...ord.stepLogs];
        newLogs.push({
          stepKey: nextStepDef.key,
          completedAt: new Date().toISOString(),
          actor: nextStepDef.actor,
          details: `Etapa concluída: ${nextStepDef.label}`
        });

        const isPaid = nextIndex >= 9; // Step 10 is 'pago'

        return {
          ...ord,
          currentStepIndex: nextIndex,
          status: isPaid ? ('PAGO' as const) : ('PENDENTE' as const),
          stepLogs: newLogs,
          receiptMetadata: isPaid ? {
            receiptNumber: ord.receiptMetadata?.receiptNumber || `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            qrVerificationUrl: `https://sigar.co.mz/recibos/${ord.orderNumber}`,
            sha256Hash: ord.receiptMetadata?.sha256Hash || '8f3a9e142bc099147efba42196bc541982ea9184ca910248f2931bc74912aa19',
            issuedAt: ord.receiptMetadata?.issuedAt || new Date().toLocaleString('pt-MZ'),
            authorizedBy: 'Dra. Elsa Cossa (Tesoureira-Geral)'
          } : ord.receiptMetadata
        };
      }
      return ord;
    });

    setOrders(updated);
  };

  // Immediate 1-Click Executive Approval (Steps 8 -> 15 cascade)
  const handleApproveImmediate = () => {
    const updated = orders.map(ord => {
      if (ord.id === currentOrder.id) {
        const fullLogs = PAYMENT_WORKFLOW_STEPS.map((step) => ({
          stepKey: step.key,
          completedAt: new Date().toISOString(),
          actor: step.actor,
          details: `Etapa validada e registrada: ${step.label}`
        }));

        return {
          ...ord,
          currentStepIndex: 14,
          status: 'PAGO' as const,
          stepLogs: fullLogs,
          receiptMetadata: {
            receiptNumber: ord.receiptMetadata?.receiptNumber || `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            qrVerificationUrl: `https://sigar.co.mz/recibos/${ord.orderNumber}`,
            sha256Hash: '4a6b98e1f021bc4987ca991024fb721839a8c17240182498fa7c9120984ba219',
            issuedAt: new Date().toLocaleString('pt-MZ'),
            authorizedBy: 'Dra. Elsa Cossa (Tesoureira) & Direção Geral'
          }
        };
      }
      return ord;
    });

    setOrders(updated);
    setActiveTab('receipt_view');
  };

  // Reset order to Step 1
  const handleResetOrder = () => {
    const updated = orders.map(ord => {
      if (ord.id === currentOrder.id) {
        return {
          ...ord,
          currentStepIndex: 0,
          status: 'PENDENTE' as const,
          stepLogs: [
            { stepKey: 'aluno' as const, completedAt: new Date().toISOString(), actor: 'Aluno (Portal)', details: 'Sessão aberta' }
          ]
        };
      }
      return ord;
    });

    setOrders(updated);
  };

  // Submit code as student
  const handleSubmitCodeAsStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionCodeInput.trim()) return;

    const targetService = AVAILABLE_PAYMENT_SERVICES.find(s => s.id === selectedServiceId) || AVAILABLE_PAYMENT_SERVICES[0];

    const updated = orders.map(ord => {
      if (ord.id === currentOrder.id) {
        const newLogs = [...ord.stepLogs];
        newLogs.push(
          { stepKey: 'efetuar_pagamento' as const, completedAt: new Date().toISOString(), actor: 'Aluno', details: 'Ação iniciada' },
          { stepKey: 'selecionar_servico' as const, completedAt: new Date().toISOString(), actor: 'Aluno', details: targetService.name },
          { stepKey: 'ver_instrucoes' as const, completedAt: new Date().toISOString(), actor: 'Sistema Reativo', details: `Método: ${selectedMethod}` },
          { stepKey: 'pagar' as const, completedAt: new Date().toISOString(), actor: selectedMethod, details: `Débito de ${targetService.amountMzn} MT` },
          { stepKey: 'enviar_codigo' as const, completedAt: new Date().toISOString(), actor: 'Aluno', details: `Código: ${transactionCodeInput}` },
          { stepKey: 'pendente_confirmacao' as const, completedAt: new Date().toISOString(), actor: 'Sistema Reativo', details: 'Fatura na fila de conferência' }
        );

        return {
          ...ord,
          serviceId: targetService.id,
          serviceName: targetService.name,
          amountMzn: targetService.amountMzn,
          paymentMethod: selectedMethod as any,
          transactionReference: transactionCodeInput,
          currentStepIndex: 6, // Step 7: Pendente de confirmação
          status: 'PENDENTE' as const,
          stepLogs: newLogs
        };
      }
      return ord;
    });

    setOrders(updated);
    setActiveTab('financeiro_approver');
  };

  const copyAccountText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              Módulo 72: Ciclo Completo de Liquidação Financeira
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              72. Fluxo Completo de Pagamento
            </h1>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Cadeia operacional estrita de 15 etapas: desde o início no <strong className="text-white font-semibold">Aluno</strong>, 
              seleção de serviço e envio de código, até a validação pelo <strong className="text-white font-semibold">Financeiro/Diretor</strong>, 
              atualização de conta, liberação de serviços, emissão de recibo, WhatsApp e <strong className="text-white font-semibold">Auditoria Zero-Trust</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('aluno_simulator')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Etapas 1 a 6: Visão Aluno</span>
            </button>
            <button
              onClick={() => setActiveTab('financeiro_approver')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Etapas 7 a 15: Financeiro</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-800 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Timeline 15 Etapas (↓)</span>
          </button>
          <button
            onClick={() => setActiveTab('aluno_simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'aluno_simulator'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Passos do Aluno (1 a 6)</span>
          </button>
          <button
            onClick={() => setActiveTab('financeiro_approver')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'financeiro_approver'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Aprovação Financeiro/Diretor (7 a 15)</span>
          </button>
          <button
            onClick={() => setActiveTab('receipt_view')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'receipt_view'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Recibo Fiscal Digital (Etapa 13)</span>
          </button>
        </div>
      </div>

      {/* Selector of Transactions & Global Progress Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fatura Selecionada:</span>
            <div className="flex items-center gap-2">
              {orders.map(ord => (
                <button
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    ord.id === currentOrder.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {ord.orderNumber} ({ord.studentName.split(' ')[0]}) - {ord.status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400">
              Etapa {currentOrder.currentStepIndex + 1} de 15: {PAYMENT_WORKFLOW_STEPS[currentOrder.currentStepIndex]?.label}
            </span>
            <div className="w-32 sm:w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${((currentOrder.currentStepIndex + 1) / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: TIMELINE DE 15 ETAPAS (↓) */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Summary Box & Controls */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                Dados do Pagamento
              </h2>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Número da Fatura:</span>
                  <span className="font-mono font-bold text-white">{currentOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estudante:</span>
                  <span className="font-bold text-emerald-400">{currentOrder.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Código Aluno:</span>
                  <span className="font-mono text-slate-300">{currentOrder.studentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Serviço:</span>
                  <span className="font-semibold text-slate-200">{currentOrder.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valor a Liquidar:</span>
                  <span className="font-black text-white text-sm">{currentOrder.amountMzn.toLocaleString()} MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Método de Envio:</span>
                  <span className="font-medium text-cyan-400">{currentOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref. Transação:</span>
                  <span className="font-mono text-slate-300">{currentOrder.transactionReference || 'Aguardando envio'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-850">
                  <span className="text-slate-500">Estado Atual:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                    currentOrder.status === 'PAGO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {currentOrder.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAdvanceStep}
                  disabled={currentOrder.currentStepIndex >= 14}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {currentOrder.currentStepIndex >= 14
                      ? 'Processo 100% Concluído'
                      : `Executar Etapa ${currentOrder.currentStepIndex + 2}`}
                  </span>
                </button>

                <button
                  onClick={handleApproveImmediate}
                  disabled={currentOrder.status === 'PAGO'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Aprovar & Cascata Imediata (Etapas 8 a 15)</span>
                </button>

                <button
                  onClick={handleResetOrder}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-bold text-rose-300 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reiniciar para Etapa 1</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 15-Step Vertical Flow with Arrows (↓) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Fluxo Sequencial das 15 Etapas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Acompanhe em tempo real a transição de responsabilidade entre Aluno, Tesouraria e Automações.
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  {currentOrder.status}
                </span>
              </div>

              {/* Steps Vertical List */}
              <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                {PAYMENT_WORKFLOW_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentOrder.currentStepIndex;
                  const isCurrent = idx === currentOrder.currentStepIndex;
                  const isPending = idx > currentOrder.currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`relative pl-10 transition-all ${
                        isCurrent
                          ? 'opacity-100'
                          : isCompleted
                          ? 'opacity-90'
                          : 'opacity-40'
                      }`}
                    >
                      {/* Step Indicator */}
                      <div
                        className={`absolute left-0 top-3.5 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all z-10 ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                            : isCurrent
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : step.stepNumber}
                      </div>

                      {/* Card Content */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                            : isCompleted
                            ? 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                            : 'bg-slate-950/30 border-slate-900'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{step.label}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                              {step.actor}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Validado
                              </span>
                            )}
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                Aguardando Ação
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[11px] text-slate-500 font-medium">Pendente</span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{step.description}</p>
                      </div>

                      {/* Visual Arrow Down (↓) */}
                      {idx < 14 && (
                        <div className="flex items-center justify-center my-1 ml-[-24px] text-slate-700">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISÃO DO ALUNO (PASSOS 1 A 6) */}
      {activeTab === 'aluno_simulator' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">
                  Portal do Aluno: Efetuar Pagamento (Passos 1 a 6)
                </h2>
                <p className="text-xs text-slate-400">
                  Experimente o fluxo de checkout e submissão do código do comprovativo pelo estudante.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitCodeAsStudent} className="space-y-6">
              {/* 1. Aluno */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">1. Aluno Conectado:</span>
                    <span className="font-bold text-white text-sm">{currentOrder.studentName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Código:</span>
                  <span className="font-mono text-emerald-400 font-bold">{currentOrder.studentNumber}</span>
                </div>
              </div>

              {/* 2 & 3. Selecionar Serviço */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  3. Selecionar Serviço a Liquidar:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_PAYMENT_SERVICES.map(service => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedServiceId === service.id
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white">{service.name}</span>
                        <span className="text-xs font-black text-emerald-400">{service.amountMzn.toLocaleString()} MT</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{service.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Ver Instruções */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  4. Ver Instruções de Pagamento:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['M-Pesa', 'e-Mola', 'Transferência BIM'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        selectedMethod === method
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-2">
                  {selectedMethod === 'M-Pesa' && (
                    <>
                      <div className="font-bold text-cyan-300">Como pagar via Vodacom M-Pesa:</div>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                        <li>Digite <strong>*150#</strong> no seu celular Vodacom.</li>
                        <li>Escolha a opção <strong>4. Pagamentos de Serviços</strong>.</li>
                        <li>Introduza a Conta / Negócio: <strong className="text-white font-mono">849922001</strong></li>
                        <li>Introduza o valor correspondente e confirme com o seu PIN.</li>
                      </ol>
                    </>
                  )}
                  {selectedMethod === 'e-Mola' && (
                    <>
                      <div className="font-bold text-cyan-300">Como pagar via Movitel e-Mola:</div>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                        <li>Digite <strong>*898#</strong> no seu celular Movitel.</li>
                        <li>Escolha a opção <strong>5. Pagamentos</strong>.</li>
                        <li>Introduza o Código da Instituição: <strong className="text-white font-mono">99401</strong></li>
                        <li>Digite a Referência: <strong className="text-white font-mono">{currentOrder.studentNumber}</strong></li>
                      </ol>
                    </>
                  )}
                  {selectedMethod === 'Transferência BIM' && (
                    <>
                      <div className="font-bold text-cyan-300">Como pagar via Millennium BIM:</div>
                      <p className="text-slate-300">
                        Conta Corrente: <strong className="text-white font-mono">0001.0029.1129384-01</strong> (NIB: 000100000029112938401)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* 5 & 6. Pagar & Enviar Código */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  6. Inserir Código de Transação / Comprovativo Recebido:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={transactionCodeInput}
                    onChange={(e) => setTransactionCodeInput(e.target.value)}
                    placeholder="Ex: MP260922.0841.B71829"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar para Validação</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ao submeter o código, a fatura avançará para a Etapa 7: <strong>Pendente de confirmação</strong>.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: VISÃO FINANCEIRO / DIRETOR (PASSOS 7 A 15) */}
      {activeTab === 'financeiro_approver' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">
                  Conferência da Tesouraria / Diretor (Passos 7 a 15)
                </h2>
                <p className="text-xs text-slate-400">
                  Conciliação com extrato bancário ou webhook oficial e execução atômica em cascata.
                </p>
              </div>
            </div>

            {/* Pending Check Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  7. Pendente de confirmação na Tesouraria
                </span>
                <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                  Ref: {currentOrder.transactionReference || 'MP260922.0915.C44102'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div>
                  <span className="text-slate-500 block">Estudante:</span>
                  <span className="font-bold text-white text-sm">{currentOrder.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Valor a Conciliar:</span>
                  <span className="font-black text-emerald-400 text-sm">{currentOrder.amountMzn.toLocaleString()} MT</span>
                </div>
              </div>
            </div>

            {/* Cascata Informativa */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-2">
              <div className="font-bold text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Ao clicar em "Aprovar Pagamento", o sistema executará automaticamente em menos de 500ms:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                <li><strong>10. Pago</strong>: Estado atualizado para liquidado com selo antifraude.</li>
                <li><strong>11. Atualizar conta</strong>: Saldo devedor zerado no extrato do aluno.</li>
                <li><strong>12. Liberar serviço</strong>: Desbloqueio imediato da catraca física, pautas e notas.</li>
                <li><strong>13. Gerar recibo</strong>: Criação de Recibo Fiscal Eletrônico oficial numerado com QR Code.</li>
                <li><strong>14. Notificar aluno</strong>: Envio automático no WhatsApp do aluno e encarregado.</li>
                <li><strong>15. Auditoria</strong>: Registro imutável com data/hora UTC e IP do operador.</li>
              </ul>
            </div>

            {/* Approve Button */}
            <div className="pt-2">
              <button
                onClick={handleApproveImmediate}
                disabled={currentOrder.status === 'PAGO'}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-2xl shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-40"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {currentOrder.status === 'PAGO' ? 'Pagamento Já Aprovado e Liquidado' : '9. Aprovar Pagamento & Disparar Cascata'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECIBO FISCAL ELETRÔNICO (ETAPA 13) */}
      {activeTab === 'receipt_view' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-slate-900 font-sans">
            <div className="relative z-10 bg-slate-50 text-slate-900 p-8 rounded-2xl shadow-inner space-y-6">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                    REPÚBLICA DE MOÇAMBIQUE
                  </div>
                  <h3 className="text-base font-black text-slate-950 uppercase pt-0.5">
                    {currentInstitution.name}
                  </h3>
                  <div className="text-[11px] text-slate-600">
                    NUIT: {currentInstitution.nuit || '400129384'} • Província de Maputo
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Recibo Eletrónico</span>
                  <span className="text-sm font-black font-mono text-emerald-800">
                    {currentOrder.receiptMetadata?.receiptNumber || 'REC-2026-04192'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {currentOrder.receiptMetadata?.issuedAt || '22 de Setembro de 2026'}
                  </span>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Recebido de:</span>
                    <strong className="text-slate-900">{currentOrder.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Código do Aluno:</span>
                    <strong className="font-mono text-slate-900">{currentOrder.studentNumber}</strong>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-200/70 text-slate-700 text-[11px]">
                      <tr>
                        <th className="p-2.5">Descrição do Serviço</th>
                        <th className="p-2.5 text-right">Valor (MZN)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-200">
                        <td className="p-2.5 font-medium">{currentOrder.serviceName}</td>
                        <td className="p-2.5 text-right font-bold">{currentOrder.amountMzn.toLocaleString()} MT</td>
                      </tr>
                      <tr className="bg-emerald-50 border-t-2 border-emerald-300 font-bold">
                        <td className="p-2.5 text-emerald-950">TOTAL LIQUIDADO</td>
                        <td className="p-2.5 text-right text-emerald-950 text-sm">
                          {currentOrder.amountMzn.toLocaleString()} MT
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QR Code & Signatures */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-300 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-300 flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">Selo de Autenticidade Digital</div>
                    <div className="text-[10px] text-slate-500">Validação instantânea online</div>
                    <div className="text-[9px] font-mono text-slate-400">
                      Ref: {currentOrder.transactionReference || 'MP260922.0841.B71829'}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="italic text-slate-700 font-serif border-b border-slate-400 pb-1">
                    Dra. Elsa Cossa
                  </div>
                  <div className="text-[10px] font-bold text-slate-900">Tesouraria Geral</div>
                </div>
              </div>

              {/* Hash Footer */}
              <div className="pt-2 border-t border-slate-200 text-[9px] font-mono text-slate-500 flex justify-between">
                <span className="truncate max-w-xs">
                  SHA-256: {currentOrder.receiptMetadata?.sha256Hash || '9b2d8f431a4781c0092c478a8f4c8996fb92427ae41e4649b934ca495991c491'}
                </span>
                <span className="text-emerald-700 font-bold">CONCILIADO COM SUCESSO</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
