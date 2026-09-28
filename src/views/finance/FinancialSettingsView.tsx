import React, { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Building, 
  Calendar, 
  Percent, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Save, 
  RefreshCw, 
  HelpCircle, 
  QrCode, 
  Layers, 
  Sliders, 
  Users, 
  ShieldCheck, 
  Coins, 
  Check, 
  X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { soundManager } from '../../utils/audio';
import { 
  FinancialSettings, 
  FinancialServiceItem, 
  PaymentMethodConfig, 
  InstitutionBankAccount 
} from '../../types';

export const FinancialSettingsView: React.FC = () => {
  const { 
    activeInstitution, 
    updateInstitution, 
    addInstitutionBankAccount, 
    removeInstitutionBankAccount 
  } = useApp();
  const { success, error } = useToast();
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<'vencimento_multas' | 'servicos_precos' | 'metodos_pagamento' | 'contas_bancarias' | 'carteiras_moveis'>('vencimento_multas');
  const [saving, setSaving] = useState(false);

  // Vencimento e Multas
  const [dueDay, setDueDay] = useState(activeInstitution.financialSettings?.dueDay || 10);
  const [toleranceDays, setToleranceDays] = useState(activeInstitution.financialSettings?.toleranceDays || 5);
  const [fineAmount, setFineAmount] = useState(activeInstitution.financialSettings?.fineAmount || 250);
  const [finePercentage, setFinePercentage] = useState(activeInstitution.financialSettings?.finePercentage || 10);
  const [interestRateDaily, setInterestRateDaily] = useState(activeInstitution.financialSettings?.interestRateDaily || 0.5);
  const [maxFinePercentage, setMaxFinePercentage] = useState(activeInstitution.financialSettings?.maxFinePercentage || 25);
  const [familyDiscountPercentage, setFamilyDiscountPercentage] = useState(activeInstitution.financialSettings?.familyDiscountPercentage || 10);
  const [scholarshipDiscountPercentage, setScholarshipDiscountPercentage] = useState(activeInstitution.financialSettings?.scholarshipDiscountPercentage || 25);

  // Beneficiários
  const [beneficiaryName, setBeneficiaryName] = useState(
    activeInstitution.financialSettings?.beneficiaryName || activeInstitution.name || 'Centro de Formação Técnica e Profissional de Maputo, Lda.'
  );
  const [beneficiaryNuit, setBeneficiaryNuit] = useState(
    activeInstitution.financialSettings?.beneficiaryNuit || activeInstitution.nuit || '400192837'
  );

  // M-Pesa
  const [mpesaNumber, setMpesaNumber] = useState(activeInstitution.financialSettings?.mpesaNumber || '849001200');
  const [mpesaShortcode, setMpesaShortcode] = useState(activeInstitution.financialSettings?.mpesaShortcode || '90124');
  const [mpesaHolderName, setMpesaHolderName] = useState(activeInstitution.financialSettings?.mpesaHolderName || 'CFTPM MOZTEC');
  const [mpesaInstructions, setMpesaInstructions] = useState(
    activeInstitution.financialSettings?.mpesaInstructions || 
    'Discar *150# > Pagamentos > Pagar Negócio / Compra > Inserir Shortcode 90124 > Referência: Código do Aluno'
  );

  // e-Mola
  const [emolaNumber, setEmolaNumber] = useState(activeInstitution.financialSettings?.emolaNumber || '861203400');
  const [emolaShortcode, setEmolaShortcode] = useState(activeInstitution.financialSettings?.emolaShortcode || '44102');
  const [emolaHolderName, setEmolaHolderName] = useState(activeInstitution.financialSettings?.emolaHolderName || 'CFTPM FORMACAO');
  const [emolaInstructions, setEmolaInstructions] = useState(
    activeInstitution.financialSettings?.emolaInstructions || 
    'Discar *898# > Pagamentos de Serviços > Referência da Instituição: 44102 > Inserir Código do Aluno'
  );

  // Serviços e Preços Dinâmicos (Não codificar valores fixos)
  const defaultServices: FinancialServiceItem[] = [
    {
      id: 'srv-1',
      code: 'PROP-01',
      name: 'Propina Mensal Padrão',
      category: 'Propina',
      description: 'Mensalidade regular dos cursos técnicos e profissionais',
      price: 2500,
      currency: activeInstitution.currency || 'MT',
      periodicity: 'mensal',
      isActive: true,
      applicableTo: 'todos'
    },
    {
      id: 'srv-2',
      code: 'MATR-01',
      name: 'Taxa de Inscrição / Matrícula',
      category: 'Matrícula',
      description: 'Taxa inicial de abertura de pasta e matrícula anual',
      price: 1500,
      currency: activeInstitution.currency || 'MT',
      periodicity: 'anual',
      isActive: true,
      applicableTo: 'novos_alunos'
    },
    {
      id: 'srv-3',
      code: 'DECL-01',
      name: 'Declaração com Notas SIVEC',
      category: 'Declaração',
      description: 'Declaração oficial autenticada com pauta curricular',
      price: 350,
      currency: activeInstitution.currency || 'MT',
      periodicity: 'por_solicitacao',
      isActive: true,
      applicableTo: 'todos'
    },
    {
      id: 'srv-4',
      code: 'DECL-02',
      name: 'Declaração Simples de Frequência',
      category: 'Declaração',
      description: 'Comprovativo de frequência para efeitos laborais ou SEF',
      price: 200,
      currency: activeInstitution.currency || 'MT',
      periodicity: 'por_solicitacao',
      isActive: true,
      applicableTo: 'todos'
    },
    {
      id: 'srv-5',
      code: 'CERT-01',
      name: 'Emissão de Certificado e Diploma',
      category: 'Certificado',
      description: 'Diploma oficial homologado com selo de autenticidade',
      price: 1800,
      currency: activeInstitution.currency || 'MT',
      periodicity: 'unico',
      isActive: true,
      applicableTo: 'concluintes'
    },
    {
      id: 'srv-6',
      code: 'EXAM-01',
      name: 'Exame de Recurso / 2ª Chamada',
      category: 'Outros',
      description: 'Inscrição para exame de época especial ou recurso',
      price: 500,
      currency: activeInstitution.currency || 'MT',
      periodicity: 'por_solicitacao',
      isActive: true,
      applicableTo: 'todos'
    },
    {
      id: 'srv-7',
      code: 'UNIF-01',
      name: 'Bata / Uniforme e Crachá RFID',
      category: 'Material',
      description: 'Kit de identificação escolar e uniforme institucional',
      price: 1200,
      currency: activeInstitution.currency || 'MT',
      periodicity: 'unico',
      isActive: true,
      applicableTo: 'novos_alunos'
    }
  ];

  const [services, setServices] = useState<FinancialServiceItem[]>(
    activeInstitution.financialSettings?.customServices && activeInstitution.financialSettings.customServices.length > 0
      ? activeInstitution.financialSettings.customServices
      : defaultServices
  );

  // Modal para criar/editar serviço
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceCode, setServiceCode] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Propina');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState<number>(1000);
  const [servicePeriodicity, setServicePeriodicity] = useState<'mensal' | 'unico' | 'anual' | 'por_solicitacao'>('mensal');
  const [serviceIsActive, setServiceIsActive] = useState(true);

  // Métodos de Pagamento
  const defaultPaymentMethods: PaymentMethodConfig[] = [
    {
      id: 'm-mpesa',
      key: 'mpesa',
      name: 'M-Pesa (Vodacom)',
      enabled: true,
      instructions: 'Pagamento instantâneo via USSD *150# ou carteira móvel',
      entityCode: mpesaShortcode,
      phone: mpesaNumber,
      beneficiaryName: mpesaHolderName
    },
    {
      id: 'm-emola',
      key: 'emola',
      name: 'e-Mola (Movitel)',
      enabled: true,
      instructions: 'Pagamento rápido via USSD *898#',
      entityCode: emolaShortcode,
      phone: emolaNumber,
      beneficiaryName: emolaHolderName
    },
    {
      id: 'm-banco',
      key: 'banco',
      name: 'Transferência Bancária / Depósito',
      enabled: true,
      instructions: 'Depósito em conta ou transferência BCI / Millennium BIM / Standard Bank',
      beneficiaryName: beneficiaryName
    },
    {
      id: 'm-ponto24',
      key: 'ponto24',
      name: 'Ponto24 / SIMO Rede',
      enabled: true,
      instructions: 'Pagamento por referência bancária na rede Ponto24 / Caixas ATM'
    },
    {
      id: 'm-dinheiro',
      key: 'dinheiro',
      name: 'Dinheiro / Balcão da Tesouraria',
      enabled: true,
      instructions: 'Pagamento em numerário diretamente na tesouraria da instituição'
    },
    {
      id: 'm-pos',
      key: 'pos',
      name: 'Terminal POS (Cartão Débito/Crédito)',
      enabled: true,
      instructions: 'Pagamento via cartão Visa, Mastercard ou SIMO no balcão'
    }
  ];

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(
    activeInstitution.financialSettings?.paymentMethods && activeInstitution.financialSettings.paymentMethods.length > 0
      ? activeInstitution.financialSettings.paymentMethods
      : defaultPaymentMethods
  );

  // Nova Conta Bancária Modal
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('Millennium BIM');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newNib, setNewNib] = useState('');
  const [newIban, setNewIban] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Toggle do método de pagamento
  const handleTogglePaymentMethod = (key: string) => {
    setPaymentMethods(prev =>
      prev.map(m => (m.key === key ? { ...m, enabled: !m.enabled } : m))
    );
  };

  // Abrir modal de serviço para criação
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceCode(`SRV-${String(services.length + 1).padStart(2, '0')}`);
    setServiceName('');
    setServiceCategory('Propina');
    setServiceDescription('');
    setServicePrice(1500);
    setServicePeriodicity('mensal');
    setServiceIsActive(true);
    setServiceModalOpen(true);
  };

  // Abrir modal de serviço para edição
  const handleOpenEditService = (item: FinancialServiceItem) => {
    setEditingServiceId(item.id);
    setServiceCode(item.code);
    setServiceName(item.name);
    setServiceCategory(item.category);
    setServiceDescription(item.description);
    setServicePrice(item.price);
    setServicePeriodicity(item.periodicity);
    setServiceIsActive(item.isActive);
    setServiceModalOpen(true);
  };

  // Salvar serviço (novo ou editado)
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || servicePrice <= 0) {
      error('Preencha os dados', 'O nome do serviço e um preço válido são obrigatórios.');
      return;
    }

    if (editingServiceId) {
      setServices(prev =>
        prev.map(s =>
          s.id === editingServiceId
            ? {
                ...s,
                code: serviceCode,
                name: serviceName,
                category: serviceCategory,
                description: serviceDescription,
                price: Number(servicePrice),
                periodicity: servicePeriodicity,
                isActive: serviceIsActive
              }
            : s
        )
      );
      success('Serviço Atualizado', `Preço e detalhes do serviço "${serviceName}" foram atualizados.`);
    } else {
      const newService: FinancialServiceItem = {
        id: `srv-${Date.now()}`,
        code: serviceCode,
        name: serviceName,
        category: serviceCategory,
        description: serviceDescription,
        price: Number(servicePrice),
        currency: activeInstitution.currency || 'MT',
        periodicity: servicePeriodicity,
        isActive: serviceIsActive,
        applicableTo: 'todos'
      };
      setServices(prev => [...prev, newService]);
      success('Novo Serviço Criado', `Serviço "${serviceName}" com preço de ${servicePrice} ${activeInstitution.currency || 'MT'} adicionado.`);
    }

    setServiceModalOpen(false);
  };

  // Excluir serviço
  const handleDeleteService = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o serviço "${name}"?`)) {
      setServices(prev => prev.filter(s => s.id !== id));
      success('Serviço Removido', `O serviço "${name}" foi excluído.`);
    }
  };

  // Adicionar Conta Bancária
  const handleAddBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountNumber.trim() || !newNib.trim()) {
      error('Dados Incompletos', 'Informe o número da conta e o NIB.');
      return;
    }

    addInstitutionBankAccount({
      bankName: newBankName,
      accountNumber: newAccountNumber,
      nib: newNib,
      iban: newIban || undefined,
      currency: activeInstitution.currency || 'MT',
      isDefault: newIsDefault
    });

    setNewAccountNumber('');
    setNewNib('');
    setNewIban('');
    setNewIsDefault(false);
    setBankModalOpen(false);
    success('Conta Adicionada', `Conta bancária do ${newBankName} cadastrada com sucesso.`);
  };

  // Salvar Todas as Configurações Financeiras
  const handleSaveAllFinance = () => {
    setSaving(true);
    try {
      const updatedFinancialSettings: FinancialSettings = {
        ...activeInstitution.financialSettings,
        dueDay,
        toleranceDays,
        fineAmount,
        finePercentage,
        interestRateDaily,
        maxFinePercentage,
        familyDiscountPercentage,
        scholarshipDiscountPercentage,
        beneficiaryName,
        beneficiaryNuit,
        mpesaNumber,
        mpesaShortcode,
        mpesaHolderName,
        mpesaInstructions,
        emolaNumber,
        emolaShortcode,
        emolaHolderName,
        emolaInstructions,
        customServices: services,
        paymentMethods: paymentMethods
      };

      updateInstitution(activeInstitution.id, {
        financialSettings: updatedFinancialSettings
      });

      soundManager.playSuccess();
      success(
        t('common.success', 'Configurações Financeiras Salvas'),
        t('common.saved', 'Preços, regras de juros, métodos de pagamento e carteiras móveis salvos!')
      );
    } catch (err: any) {
      error('Erro ao Salvar', err.message || 'Falha ao gravar parâmetros financeiros.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#090d16] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {t('institution.currency', 'Moeda Ativa')}: {activeInstitution.currency || 'MT (Metical)'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {services.length} {t('services.title', 'Serviços Cadastrados')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              {t('finance.title', 'Configurações Financeiras')}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              {t('finance.subtitle', 'Gestão flexível de serviços, catálogo de preços, regras de multa, prazos de vencimento e carteiras móveis (M-Pesa e e-Mola).')}
            </p>
          </div>

          <button
            onClick={handleSaveAllFinance}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('action.saving', 'A salvar...')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('action.save', 'Salvar Alterações')}</span>
              </>
            )}
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveTab('vencimento_multas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'vencimento_multas'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{t('finance.tab_rules', 'Vencimento & Multas')}</span>
          </button>

          <button
            onClick={() => setActiveTab('servicos_precos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'servicos_precos'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>{t('finance.tab_services', 'Serviços & Preços')}</span>
          </button>

          <button
            onClick={() => setActiveTab('metodos_pagamento')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'metodos_pagamento'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span>{t('finance.tab_methods', 'Métodos de Pagamento')}</span>
          </button>

          <button
            onClick={() => setActiveTab('contas_bancarias')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'contas_bancarias'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building className="w-4 h-4 text-cyan-400" />
            <span>{t('finance.tab_accounts', 'Contas & Beneficiários')}</span>
          </button>

          <button
            onClick={() => setActiveTab('carteiras_moveis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'carteiras_moveis'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>{t('finance.tab_mobile', 'M-Pesa & e-Mola')}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Vencimento & Multas */}
      {activeTab === 'vencimento_multas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Prazos de Vencimento e Tolerância
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('finance.due_day', 'Dia de Vencimento da Propina')}
                </label>
                <select
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value={1}>Dia 01 de cada mês</option>
                  <option value={5}>Dia 05 de cada mês</option>
                  <option value={10}>Dia 10 de cada mês</option>
                  <option value={15}>Dia 15 de cada mês</option>
                  <option value={20}>Dia 20 de cada mês</option>
                  <option value={25}>Dia 25 de cada mês</option>
                  <option value={30}>Dia 30 / Último dia útil</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Data limite padrão em que as faturas mensais de propinas são geradas sem incidência de acréscimos.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('finance.tolerance_days', 'Dias de Carência / Tolerância')}
                </label>
                <input
                  type="number"
                  value={toleranceDays}
                  onChange={(e) => setToleranceDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Período em dias corridos após a data de vencimento antes da cobrança automática da primeira taxa de multa.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('finance.family_discount', 'Desconto Familiar (%)')}
                  </label>
                  <input
                    type="number"
                    value={familyDiscountPercentage}
                    onChange={(e) => setFamilyDiscountPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Aplicável a irmãos matriculados simultaneamente.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('finance.scholarship_discount', 'Desconto para Bolseiros (%)')}
                  </label>
                  <input
                    type="number"
                    value={scholarshipDiscountPercentage}
                    onChange={(e) => setScholarshipDiscountPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Percentagem base atribuída a estudantes com bolsa parcial.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" />
              Taxas de Multa e Juros de Mora
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('finance.fine_amount', 'Multa Fixa por Atraso')} ({activeInstitution.currency || 'MT'})
                </label>
                <input
                  type="number"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold text-emerald-400 focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Taxa administrativa cobrada imediatamente no 1º dia após esgotado o período de tolerância.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('finance.fine_percentage', 'Multa Percentual por Atraso')} (%)
                </label>
                <input
                  type="number"
                  value={finePercentage}
                  onChange={(e) => setFinePercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold text-amber-400 focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Percentagem calculada sobre o valor nominal da propina devida.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('finance.daily_interest', 'Juros Diários de Mora')} (% ao dia)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={interestRateDaily}
                    onChange={(e) => setInterestRateDaily(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('finance.max_fine', 'Teto Máximo de Multa')} (%)
                  </label>
                  <input
                    type="number"
                    value={maxFinePercentage}
                    onChange={(e) => setMaxFinePercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  O valor de multa aplicado nunca ultrapassará o teto de <strong>{maxFinePercentage}%</strong> do valor base da propina, conforme a legislação educacional vigente.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Serviços & Preços Configuráveis (Não codificar valores fixos) */}
      {activeTab === 'servicos_precos' && (
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                {t('services.title', 'Tabela de Serviços e Preços Configuráveis')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('services.subtitle', 'Todos os preços são flexíveis e dinâmicos. Nenhum valor monetário está fixo no código.')}
              </p>
            </div>

            <button
              onClick={handleOpenAddService}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('services.add_btn', 'Adicionar Serviço / Taxa')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px] bg-[#0d1527]">
                  <th className="py-3 px-4">{t('services.code', 'Código')}</th>
                  <th className="py-3 px-4">{t('services.name', 'Nome do Serviço')}</th>
                  <th className="py-3 px-4">{t('services.category', 'Categoria')}</th>
                  <th className="py-3 px-4">{t('services.periodicity', 'Periodicidade')}</th>
                  <th className="py-3 px-4">{t('services.price', 'Preço Unitário')}</th>
                  <th className="py-3 px-4 text-center">{t('services.status', 'Estado')}</th>
                  <th className="py-3 px-4 text-right">{t('services.actions', 'Ações')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {services.map((item) => (
                  <tr key={item.id} className="hover:bg-[#0d1527]/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div>{item.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{item.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 capitalize">
                      {item.periodicity.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                      {item.price.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} {item.currency}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> {t('status.active', 'Ativo')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          <XCircle className="w-3 h-3" /> {t('status.inactive', 'Inativo')}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditService(item)}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all cursor-pointer"
                          title="Editar Preço e Dados"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(item.id, item.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                          title="Remover Serviço"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Métodos de Pagamento */}
      {activeTab === 'metodos_pagamento' && (
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              {t('methods.title', 'Métodos de Pagamento Disponíveis')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {t('methods.subtitle', 'Ative ou desative métodos de cobrança oferecidos aos estudantes no portal e na tesouraria.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-5 rounded-2xl border transition-all ${
                  method.enabled
                    ? 'bg-[#0d1527] border-slate-700'
                    : 'bg-[#0a0f1d]/50 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {method.key === 'mpesa' && <Smartphone className="w-5 h-5 text-red-500" />}
                    {method.key === 'emola' && <Smartphone className="w-5 h-5 text-orange-500" />}
                    {method.key === 'banco' && <Building className="w-5 h-5 text-blue-400" />}
                    {method.key === 'ponto24' && <CreditCard className="w-5 h-5 text-emerald-400" />}
                    {method.key === 'dinheiro' && <Coins className="w-5 h-5 text-amber-400" />}
                    {method.key === 'pos' && <CreditCard className="w-5 h-5 text-purple-400" />}
                    <h4 className="text-sm font-bold text-white">{method.name}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePaymentMethod(method.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      method.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        method.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-3">{method.instructions}</p>

                {method.entityCode && (
                  <div className="text-[11px] font-mono text-cyan-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800 mb-2">
                    Código / Entidade: {method.entityCode}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-800">
                  <span className="text-slate-400">Estado</span>
                  <span className={`font-bold ${method.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {method.enabled ? t('status.active', 'Ativo no Sistema') : t('status.inactive', 'Desativado')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Contas Bancárias & Beneficiários */}
      {activeTab === 'contas_bancarias' && (
        <div className="space-y-6">
          {/* Dados do Beneficiário */}
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              {t('accounts.title', 'Beneficiário Oficial para Pagamentos')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('accounts.beneficiary_name', 'Nome do Titular / Beneficiário da Conta')}
                </label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('accounts.beneficiary_nuit', 'NUIT do Beneficiário')}
                </label>
                <input
                  type="text"
                  value={beneficiaryNuit}
                  onChange={(e) => setBeneficiaryNuit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono font-bold focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Lista de Contas Bancárias */}
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  Contas Bancárias da Instituição
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Contas exibidas nas guias de depósito e no portal do aluno para transferências bancárias.
                </p>
              </div>

              <button
                onClick={() => setBankModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('accounts.add_bank', 'Cadastrar Nova Conta')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeInstitution.financialAccounts && activeInstitution.financialAccounts.length > 0 ? (
                activeInstitution.financialAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-cyan-400" />
                        <h4 className="text-sm font-bold text-white">{account.bankName}</h4>
                      </div>
                      {account.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {t('accounts.is_default', 'Principal')}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Conta:</span>
                        <span className="font-bold text-white">{account.accountNumber}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">NIB:</span>
                        <span className="text-cyan-400">{account.nib}</span>
                      </div>
                      {account.iban && (
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-400">IBAN:</span>
                          <span className="text-slate-300">{account.iban}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => removeInstitutionBankAccount(account.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remover
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center bg-[#0d1527]/50 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                  Nenhuma conta bancária cadastrada. Clique em "Cadastrar Nova Conta" acima.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Carteiras Móveis (M-Pesa & e-Mola) */}
      {activeTab === 'carteiras_moveis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* M-Pesa */}
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-red-500" />
                {t('mobile.mpesa_heading', 'Integração M-Pesa (Vodacom)')}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                USSD *150#
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('mobile.mpesa_shortcode', 'Shortcode de Negócio / Paybill')}
                </label>
                <input
                  type="text"
                  value={mpesaShortcode}
                  onChange={(e) => setMpesaShortcode(e.target.value)}
                  placeholder="Ex: 90124"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono font-bold focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('mobile.mpesa_phone', 'Número M-Pesa (Contacto ou Carteira Alternativa)')}
                </label>
                <input
                  type="text"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  placeholder="+258 84 900 1200"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('mobile.mpesa_holder', 'Nome Registado no M-Pesa')}
                </label>
                <input
                  type="text"
                  value={mpesaHolderName}
                  onChange={(e) => setMpesaHolderName(e.target.value)}
                  placeholder="CFTPM MOZTEC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('mobile.mpesa_instructions', 'Instruções para o Aluno pagar por *150#')}
                </label>
                <textarea
                  rows={3}
                  value={mpesaInstructions}
                  onChange={(e) => setMpesaInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* e-Mola */}
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-500" />
                {t('mobile.emola_heading', 'Integração e-Mola (Movitel)')}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                USSD *898#
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('mobile.emola_shortcode', 'Código de Entidade / Referência e-Mola')}
                </label>
                <input
                  type="text"
                  value={emolaShortcode}
                  onChange={(e) => setEmolaShortcode(e.target.value)}
                  placeholder="Ex: 44102"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('mobile.emola_phone', 'Número de Telefone e-Mola')}
                </label>
                <input
                  type="text"
                  value={emolaNumber}
                  onChange={(e) => setEmolaNumber(e.target.value)}
                  placeholder="+258 86 120 3400"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('mobile.emola_holder', 'Nome Titular da Carteira e-Mola')}
                </label>
                <input
                  type="text"
                  value={emolaHolderName}
                  onChange={(e) => setEmolaHolderName(e.target.value)}
                  placeholder="CFTPM FORMACAO"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('mobile.emola_instructions', 'Instruções para o Aluno pagar por *898#')}
                </label>
                <textarea
                  rows={3}
                  value={emolaInstructions}
                  onChange={(e) => setEmolaInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar / Editar Serviço & Preço */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                {editingServiceId ? t('services.edit_title', 'Editar Serviço & Preço') : t('services.new_title', 'Novo Serviço / Taxa')}
              </h3>
              <button
                onClick={() => setServiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('services.code', 'Código')}
                  </label>
                  <input
                    type="text"
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('services.category', 'Categoria')}
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs"
                  >
                    <option value="Propina">Propina / Mensalidade</option>
                    <option value="Matrícula">Matrícula / Inscrição</option>
                    <option value="Declaração">Declaração Escolar</option>
                    <option value="Certificado">Certificado / Diploma</option>
                    <option value="Material">Material / Uniforme / Crachá</option>
                    <option value="Outros">Outras Taxas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('services.name', 'Nome do Serviço')} *
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ex: Propina Mensal Regular"
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('services.price', 'Preço Unitário')} ({activeInstitution.currency || 'MT'}) *
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-sm font-bold text-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('services.periodicity', 'Periodicidade')}
                  </label>
                  <select
                    value={servicePeriodicity}
                    onChange={(e) => setServicePeriodicity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="unico">Pagamento Único</option>
                    <option value="anual">Anual</option>
                    <option value="por_solicitacao">Por Solicitação</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Ex: Cobrança mensal regular das aulas..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceIsActive}
                    onChange={(e) => setServiceIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-xs text-white">Serviço ativo para cobranças e faturas</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  {t('action.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingServiceId ? t('action.save', 'Salvar Alterações') : t('action.create', 'Criar Serviço')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Conta Bancária */}
      {bankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-cyan-400" />
                {t('accounts.add_bank', 'Cadastrar Nova Conta Bancária')}
              </h3>
              <button
                onClick={() => setBankModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBankSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('accounts.bank_name', 'Nome do Banco')} *
                </label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-semibold"
                >
                  <option value="Millennium BIM">Millennium BIM</option>
                  <option value="BCI (Banco Comercial e de Investimentos)">BCI</option>
                  <option value="Standard Bank Moçambique">Standard Bank</option>
                  <option value="Moza Banco">Moza Banco</option>
                  <option value="FNB Moçambique">FNB</option>
                  <option value="Nedbank Moçambique">Nedbank</option>
                  <option value="Absa Bank Moçambique">Absa Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('accounts.account_number', 'Número da Conta')} *
                </label>
                <input
                  type="text"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  placeholder="Ex: 109283741"
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('accounts.nib', 'NIB (Número de Identificação Bancária)')} *
                </label>
                <input
                  type="text"
                  value={newNib}
                  onChange={(e) => setNewNib(e.target.value)}
                  placeholder="0001 0000 0109 2837 4102 3"
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('accounts.iban', 'IBAN Internacional (Opcional)')}
                </label>
                <input
                  type="text"
                  value={newIban}
                  onChange={(e) => setNewIban(e.target.value)}
                  placeholder="MZ59 0001 0000 0109 2837 4102 3"
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsDefault}
                    onChange={(e) => setNewIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600"
                  />
                  <span className="text-xs text-white">{t('accounts.is_default', 'Definir como Conta Principal')}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  {t('action.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {t('action.confirm', 'Confirmar & Adicionar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
