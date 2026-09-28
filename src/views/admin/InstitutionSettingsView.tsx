import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Share2, 
  Hash, 
  Coins, 
  Clock, 
  Sliders, 
  FileText, 
  FileSpreadsheet, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Eye, 
  Upload, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  FileCheck, 
  ShieldCheck,
  RefreshCw,
  Stamp,
  PenTool
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { soundManager } from '../../utils/audio';
import { Institution, InstitutionPrefixes, FinancialSettings } from '../../types';

export const InstitutionSettingsView: React.FC = () => {
  const { activeInstitution, updateInstitution } = useApp();
  const { success, error } = useToast();
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<'geral' | 'prefixos' | 'assinatura_carimbo' | 'modelos' | 'regras_mensagens'>('geral');
  const [saving, setSaving] = useState(false);

  // Form states initialized with activeInstitution data
  const [name, setName] = useState(activeInstitution.name || '');
  const [code, setCode] = useState(activeInstitution.code || '');
  const [type, setType] = useState(activeInstitution.type || 'Centro de Formação Profissional');
  const [nuit, setNuit] = useState(activeInstitution.nuit || '');
  const [licenseNumber, setLicenseNumber] = useState(activeInstitution.licenseNumber || '');
  const [representativeName, setRepresentativeName] = useState(activeInstitution.representativeName || '');
  const [representativeRole, setRepresentativeRole] = useState(activeInstitution.representativeRole || 'Diretor Geral');
  const [phone, setPhone] = useState(activeInstitution.phone || '');
  const [phoneAlt, setPhoneAlt] = useState(activeInstitution.phoneAlt || '');
  const [email, setEmail] = useState(activeInstitution.email || '');
  const [whatsapp, setWhatsapp] = useState(activeInstitution.whatsapp || activeInstitution.whatsAppConfig?.phoneNumber || '');
  const [province, setProvince] = useState(activeInstitution.province || 'Maputo Cidade');
  const [city, setCity] = useState(activeInstitution.city || 'Maputo');
  const [address, setAddress] = useState(activeInstitution.address || '');
  const [logoUrl, setLogoUrl] = useState(activeInstitution.logoUrl || '');
  const [currency, setCurrency] = useState(activeInstitution.currency || 'MT');
  const [timezone, setTimezone] = useState(activeInstitution.timezone || 'Africa/Maputo (GMT+2)');

  // Prefixes & Numbering
  const [prefixes, setPrefixes] = useState<InstitutionPrefixes>({
    studentPrefix: activeInstitution.prefixes?.studentPrefix || `${activeInstitution.code}-AL`,
    candidatePrefix: activeInstitution.prefixes?.candidatePrefix || `${activeInstitution.code}-CAND`,
    certificatePrefix: activeInstitution.prefixes?.certificatePrefix || `${activeInstitution.code}-CERT`,
    receiptPrefix: activeInstitution.prefixes?.receiptPrefix || `${activeInstitution.code}-REC`,
    contractPrefix: activeInstitution.prefixes?.contractPrefix || `${activeInstitution.code}-CTR`,
    invoicePrefix: activeInstitution.prefixes?.invoicePrefix || `${activeInstitution.code}-FT`,
    studentNextSeq: activeInstitution.prefixes?.studentNextSeq || 101,
    candidateNextSeq: activeInstitution.prefixes?.candidateNextSeq || 205,
    certificateNextSeq: activeInstitution.prefixes?.certificateNextSeq || 54,
    receiptNextSeq: activeInstitution.prefixes?.receiptNextSeq || 1420,
    contractNextSeq: activeInstitution.prefixes?.contractNextSeq || 88,
    zeroPadding: activeInstitution.prefixes?.zeroPadding || 4
  });

  // Signature & Stamp
  const [signatureUrl, setSignatureUrl] = useState(activeInstitution.signatureUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80');
  const [signatoryName, setSignatoryName] = useState(activeInstitution.signatoryName || activeInstitution.representativeName || 'Prof. Dr. Mateus Macuácua');
  const [signatoryRole, setSignatoryRole] = useState(activeInstitution.signatoryRole || activeInstitution.representativeRole || 'Diretor Pedagógico e Geral');
  const [stampUrl, setStampUrl] = useState(activeInstitution.stampUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80');
  const [stampText, setStampText] = useState(activeInstitution.stampText || `${activeInstitution.name.toUpperCase()} • DIRECÇÃO GERAL • AUTENTICAÇÃO OFICIAL`);
  const [showStampOnDocuments, setShowStampOnDocuments] = useState(activeInstitution.showStampOnDocuments ?? true);

  // Document Models
  const [defaultContractModel, setDefaultContractModel] = useState(activeInstitution.officialModels?.defaultContractModel || 'modelo_padrao_formacao');
  const [defaultDeclarationModel, setDefaultDeclarationModel] = useState(activeInstitution.officialModels?.defaultDeclarationModel || 'declaracao_com_notas_siverc');
  const [defaultCertificateModel, setDefaultCertificateModel] = useState(activeInstitution.officialModels?.defaultCertificateModel || 'certificado_diploma_nacional');

  // Payment Rules & Messages
  const [dueDay, setDueDay] = useState(activeInstitution.financialSettings?.dueDay || 10);
  const [toleranceDays, setToleranceDays] = useState(activeInstitution.financialSettings?.toleranceDays || 5);
  const [fineAmount, setFineAmount] = useState(activeInstitution.financialSettings?.fineAmount || 250);
  const [finePercentage, setFinePercentage] = useState(activeInstitution.financialSettings?.finePercentage || 10);
  const [interestRateDaily, setInterestRateDaily] = useState(activeInstitution.financialSettings?.interestRateDaily || 0.5);
  const [maxFinePercentage, setMaxFinePercentage] = useState(activeInstitution.financialSettings?.maxFinePercentage || 30);
  const [familyDiscountPercentage, setFamilyDiscountPercentage] = useState(activeInstitution.financialSettings?.familyDiscountPercentage || 10);

  // Custom Messages (SMS / WhatsApp)
  const [welcomeMessage, setWelcomeMessage] = useState(
    activeInstitution.customMessages?.welcomeMessageTemplate ||
    `Prezado(a) {NOME}, bem-vindo(a) à {INSTITUICAO}! Sua matrícula no curso {CURSO} foi confirmada com o código {CODIGO}. Aceda ao portal: {PORTAL}`
  );
  const [dueReminderMessage, setDueReminderMessage] = useState(
    activeInstitution.customMessages?.dueReminderMessageTemplate ||
    `Olá {NOME}, informamos que a propina de {MES} vence no dia {DIA_VENCIMENTO}. Evite acréscimo de multas efetuando o pagamento via M-Pesa ou Conta Bancária.`
  );
  const [overdueMessage, setOverdueMessage] = useState(
    activeInstitution.customMessages?.overdueMessageTemplate ||
    `Aviso: Constatamos que a mensalidade de {MES} referente ao aluno {NOME} encontra-se vencida. Foi aplicada multa de {MULTA}. Regularize hoje mesmo.`
  );
  const [receiptMessage, setReceiptMessage] = useState(
    activeInstitution.customMessages?.receiptMessageTemplate ||
    `Recebemos com sucesso o pagamento de {VALOR} referente a {SERVICO}. Recibo emitido: #{NUMERO_RECIBO}. Obrigado, {INSTITUICAO}.`
  );

  const formatPreviewCode = (prefix: string, seq: number, padding: number) => {
    return `${prefix}-${String(seq).padStart(padding, '0')}`;
  };

  const handleSaveAll = () => {
    setSaving(true);
    try {
      const updatedData: Partial<Institution> = {
        name,
        code,
        type: type as any,
        nuit,
        licenseNumber,
        representativeName,
        representativeRole,
        phone,
        phoneAlt,
        email,
        whatsapp,
        province,
        city,
        address,
        logoUrl,
        currency,
        timezone,
        prefixes: {
          ...prefixes
        },
        signatureUrl,
        signatoryName,
        signatoryRole,
        stampUrl,
        stampText,
        showStampOnDocuments,
        officialModels: {
          defaultContractModel,
          defaultDeclarationModel,
          defaultCertificateModel
        },
        financialSettings: {
          ...activeInstitution.financialSettings,
          dueDay,
          toleranceDays,
          fineAmount,
          finePercentage,
          interestRateDaily,
          maxFinePercentage,
          familyDiscountPercentage
        },
        customMessages: {
          welcomeMessageTemplate: welcomeMessage,
          dueReminderMessageTemplate: dueReminderMessage,
          overdueMessageTemplate: overdueMessage,
          receiptMessageTemplate: receiptMessage
        }
      };

      updateInstitution(activeInstitution.id, updatedData);
      soundManager.playSuccess();
      success(
        t('common.success', 'Configurações Atualizadas'), 
        t('common.saved', 'Os dados e parâmetros da instituição foram salvos com sucesso!')
      );
    } catch (err: any) {
      error(t('action.cancel', 'Erro ao Salvar'), err.message || 'Falha ao gravar parâmetros.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="bg-[#090d16] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                {t('institution.code', 'Código')}: {activeInstitution.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {activeInstitution.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {language.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-400" />
              {t('institution.title', 'Configurações da Instituição')}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              {t('institution.subtitle', 'Configure identidade visual, contactos, prefixos, assinaturas, carimbo oficial, modelos de documentos e mensagens.')}
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveTab('geral')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'geral'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>{t('institution.tab_general', 'Identidade & Contactos')}</span>
          </button>

          <button
            onClick={() => setActiveTab('prefixos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'prefixos'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Hash className="w-4 h-4 text-cyan-400" />
            <span>{t('institution.tab_prefixes', 'Prefixos & Numeração')}</span>
          </button>

          <button
            onClick={() => setActiveTab('assinatura_carimbo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'assinatura_carimbo'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Stamp className="w-4 h-4 text-amber-400" />
            <span>{t('institution.tab_stamps', 'Assinatura & Carimbo')}</span>
          </button>

          <button
            onClick={() => setActiveTab('modelos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'modelos'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>{t('institution.tab_templates', 'Modelos Oficiais')}</span>
          </button>

          <button
            onClick={() => setActiveTab('regras_mensagens')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'regras_mensagens'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>{t('institution.tab_rules', 'Regras & Mensagens')}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Identidade & Contactos */}
      {activeTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo & Visual Identity */}
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-400" />
              {t('institution.logo', 'Logótipo Institucional')}
            </h3>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl bg-[#0d1527]/50 transition-all">
              {logoUrl ? (
                <div className="space-y-4 text-center">
                  <img
                    src={logoUrl}
                    alt="Logo da Instituição"
                    className="h-28 max-w-full object-contain mx-auto rounded-xl p-2 bg-slate-900 border border-slate-700 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Logo Ativo
                    </span>
                    <button
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-slate-400">Nenhum logótipo definido</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('institution.logo', 'URL do Logótipo')} (PNG / SVG)
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://exemplo.co.mz/logo.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {t('institution.logo_tip', 'Recomendado formato PNG transparente com dimensões de 400x120px.')}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  {t('institution.currency', 'Moeda Padrão')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="MT">Metical Moçambicano (MT / MZN)</option>
                  <option value="USD">Dólar Americano ($ USD)</option>
                  <option value="EUR">Euro (€ EUR)</option>
                  <option value="ZAR">Rand Sul-Africano (R ZAR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  {t('institution.timezone', 'Fuso Horário')}
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-medium focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Africa/Maputo (GMT+2)">Maputo, Moçambique (GMT+2 / CAT)</option>
                  <option value="Africa/Luanda (GMT+1)">Luanda, Angola (GMT+1 / WAT)</option>
                  <option value="Europe/Lisbon (GMT+0)">Lisboa, Portugal (GMT+0 / WET)</option>
                  <option value="UTC">UTC Padrão Internacional (GMT+0)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dados Principais e Fiscais */}
          <div className="lg:col-span-2 bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              {t('institution.name', 'Dados Cadastrais e Fiscais')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('institution.name', 'Nome Oficial da Instituição')} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Centro de Formação Técnica e Profissional de Maputo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-sm font-semibold focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('institution.code', 'Código da Instituição')} *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: CFTPM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono font-bold focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('institution.type', 'Tipo de Instituição')}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Centro de Formação Profissional">Centro de Formação Profissional</option>
                  <option value="Instituto Técnico Médio">Instituto Técnico Médio</option>
                  <option value="Instituto Politécnico Superior">Instituto Politécnico Superior</option>
                  <option value="Universidade / Faculdade">Universidade / Faculdade</option>
                  <option value="Colégio / Escola Primária e Secundária">Colégio / Escola Primária e Secundária</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('institution.nuit', 'NUIT da Instituição')} *
                </label>
                <input
                  type="text"
                  value={nuit}
                  onChange={(e) => setNuit(e.target.value)}
                  placeholder="Ex: 400192837"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('institution.license', 'Alvará / Registro Ministerial')}
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Ex: Reg. MINEDH-0842/2021"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('institution.representative_name', 'Diretor(a) / Representante Legal')}
                </label>
                <input
                  type="text"
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                  placeholder="Ex: Dr. Alberto Mondlane"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('institution.representative_role', 'Cargo / Título')}
                </label>
                <input
                  type="text"
                  value={representativeRole}
                  onChange={(e) => setRepresentativeRole(e.target.value)}
                  placeholder="Ex: Diretor Executivo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Contactos e Endereço */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                Contactos e Localização
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('institution.phone', 'Telefone Principal')}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+258 21 400 120"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('institution.phone_alt', 'Contacto Secundário')}
                  </label>
                  <input
                    type="text"
                    value={phoneAlt}
                    onChange={(e) => setPhoneAlt(e.target.value)}
                    placeholder="+258 84 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('institution.whatsapp', 'WhatsApp Oficial')}
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+258 84 900 1200"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('institution.email', 'Email Oficial')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="secretaria@cftpm.ac.mz"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('institution.province', 'Província')}
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Maputo Cidade"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('institution.address', 'Endereço Físico (Rua, Bairro, Nº)')}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. 24 de Julho, nº 1540, Bairro Central"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Prefixos & Numeração */}
      {activeTab === 'prefixos' && (
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Hash className="w-5 h-5 text-cyan-400" />
                {t('prefixes.title', 'Prefixos e Numeração Sequencial')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('prefixes.subtitle', 'Configure os padrões alfanuméricos e o próximo número sequencial para estudantes, candidatos, certificados e faturas.')}
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
              Padding: {prefixes.zeroPadding || 4} Dígitos
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Estudante */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{t('prefixes.student', 'Estudantes')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">
                  {formatPreviewCode(prefixes.studentPrefix, prefixes.studentNextSeq || 1, prefixes.zeroPadding || 4)}
                </span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Prefixo</label>
                <input
                  type="text"
                  value={prefixes.studentPrefix}
                  onChange={(e) => setPrefixes({ ...prefixes, studentPrefix: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t('prefixes.student_next', 'Próximo Sequencial')}</label>
                <input
                  type="number"
                  value={prefixes.studentNextSeq || 1}
                  onChange={(e) => setPrefixes({ ...prefixes, studentNextSeq: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Candidato */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{t('prefixes.candidate', 'Candidatos')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                  {formatPreviewCode(prefixes.candidatePrefix || 'CAND', prefixes.candidateNextSeq || 1, prefixes.zeroPadding || 4)}
                </span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Prefixo</label>
                <input
                  type="text"
                  value={prefixes.candidatePrefix || ''}
                  onChange={(e) => setPrefixes({ ...prefixes, candidatePrefix: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t('prefixes.candidate_next', 'Próximo Sequencial')}</label>
                <input
                  type="number"
                  value={prefixes.candidateNextSeq || 1}
                  onChange={(e) => setPrefixes({ ...prefixes, candidateNextSeq: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Certificado */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{t('prefixes.certificate', 'Certificados')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                  {formatPreviewCode(prefixes.certificatePrefix, prefixes.certificateNextSeq || 1, prefixes.zeroPadding || 4)}
                </span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Prefixo</label>
                <input
                  type="text"
                  value={prefixes.certificatePrefix}
                  onChange={(e) => setPrefixes({ ...prefixes, certificatePrefix: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t('prefixes.certificate_next', 'Próximo Sequencial')}</label>
                <input
                  type="number"
                  value={prefixes.certificateNextSeq || 1}
                  onChange={(e) => setPrefixes({ ...prefixes, certificateNextSeq: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Recibo */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{t('prefixes.receipt', 'Recibos Financeiros')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                  {formatPreviewCode(prefixes.receiptPrefix, prefixes.receiptNextSeq || 1, prefixes.zeroPadding || 4)}
                </span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Prefixo</label>
                <input
                  type="text"
                  value={prefixes.receiptPrefix}
                  onChange={(e) => setPrefixes({ ...prefixes, receiptPrefix: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t('prefixes.receipt_next', 'Próximo Sequencial')}</label>
                <input
                  type="number"
                  value={prefixes.receiptNextSeq || 1}
                  onChange={(e) => setPrefixes({ ...prefixes, receiptNextSeq: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Contrato */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{t('prefixes.contract', 'Contratos de Formação')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300">
                  {formatPreviewCode(prefixes.contractPrefix, prefixes.contractNextSeq || 1, prefixes.zeroPadding || 4)}
                </span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Prefixo</label>
                <input
                  type="text"
                  value={prefixes.contractPrefix}
                  onChange={(e) => setPrefixes({ ...prefixes, contractPrefix: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t('prefixes.contract_next', 'Próximo Sequencial')}</label>
                <input
                  type="number"
                  value={prefixes.contractNextSeq || 1}
                  onChange={(e) => setPrefixes({ ...prefixes, contractNextSeq: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Configuração de Padding de Zeros */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white">{t('prefixes.zero_padding', 'Formato de Zeros à Esquerda')}</span>
              <p className="text-[11px] text-slate-400">
                Quantidade mínima de dígitos nos códigos gerados.
              </p>
              <div>
                <select
                  value={prefixes.zeroPadding || 4}
                  onChange={(e) => setPrefixes({ ...prefixes, zeroPadding: parseInt(e.target.value) || 4 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-white text-xs font-bold focus:outline-hidden"
                >
                  <option value={3}>3 Dígitos (ex: 001, 042)</option>
                  <option value={4}>4 Dígitos (ex: 0001, 0142)</option>
                  <option value={5}>5 Dígitos (ex: 00001, 00142)</option>
                  <option value={6}>6 Dígitos (ex: 000001, 000142)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Assinatura & Carimbo */}
      {activeTab === 'assinatura_carimbo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assinatura Digital do Diretor */}
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PenTool className="w-5 h-5 text-amber-400" />
              {t('stamps.signature_title', 'Assinatura Digital do Diretor')}
            </h3>

            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 text-center space-y-3">
              <div className="h-28 flex items-center justify-center bg-white/5 rounded-lg border border-slate-700/50 p-2">
                {signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Assinatura Digital"
                    className="max-h-full object-contain filter invert opacity-90"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs text-slate-500 italic">Nenhuma assinatura carregada</span>
                )}
              </div>
              <div className="text-xs text-slate-400 border-t border-slate-800 pt-2">
                <span className="font-bold text-white block">{signatoryName}</span>
                <span className="text-slate-400 text-[11px]">{signatoryRole}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('stamps.signature_name', 'Nome do Signatário')}
                </label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="Prof. Dr. Mateus Macuácua"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('stamps.signature_role', 'Cargo / Função na Assinatura')}
                </label>
                <input
                  type="text"
                  value={signatoryRole}
                  onChange={(e) => setSignatoryRole(e.target.value)}
                  placeholder="Diretor Geral e Pedagógico"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('stamps.signature_url', 'URL da Imagem da Assinatura')} (Fundo transparente)
                </label>
                <input
                  type="text"
                  value={signatureUrl}
                  onChange={(e) => setSignatureUrl(e.target.value)}
                  placeholder="https://exemplo.co.mz/assinatura.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Carimbo Oficial */}
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Stamp className="w-5 h-5 text-cyan-400" />
              {t('stamps.stamp_title', 'Carimbo Oficial Institucional')}
            </h3>

            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 text-center space-y-3">
              <div className="h-28 flex items-center justify-center bg-white/5 rounded-lg border border-slate-700/50 p-2">
                {stampUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={stampUrl}
                      alt="Carimbo Oficial"
                      className="max-h-24 w-24 object-contain rounded-full border-2 border-dashed border-cyan-400/50 p-1 filter drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest bg-black/70 px-1 py-0.5 rounded rotate-[-15deg]">
                        AUTÊNTICO
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">Nenhum carimbo carregado</span>
                )}
              </div>
              <p className="text-[11px] text-cyan-400 font-mono font-bold truncate">
                {stampText}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('stamps.stamp_url', 'URL da Imagem do Carimbo')} (PNG Circular)
                </label>
                <input
                  type="text"
                  value={stampUrl}
                  onChange={(e) => setStampUrl(e.target.value)}
                  placeholder="https://exemplo.co.mz/carimbo.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('stamps.stamp_text', 'Texto de Autenticidade Gravado')}
                </label>
                <input
                  type="text"
                  value={stampText}
                  onChange={(e) => setStampText(e.target.value)}
                  placeholder="Ex: CFTPM • AUTENTICADO • MINEDH"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0d1527] border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStampOnDocuments}
                    onChange={(e) => setShowStampOnDocuments(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 focus:outline-hidden"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {t('stamps.show_on_docs', 'Carimbar Documentos Automaticamente')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Adicionar carimbo e assinatura digital em certificados, declarações e boletins PDF gerados.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Modelos Oficiais */}
      {activeTab === 'modelos' && (
        <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              {t('templates.title', 'Modelos de Documentos e Termos Oficiais')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {t('templates.subtitle', 'Configure os modelos base utilizados pelo SIVEC e pelo Módulo de Contratos para novas emissões.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('templates.contract_model', 'Contrato de Matrícula')}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Termo de prestação de serviços educacionais e compromisso de pagamento.
                </p>
              </div>
              <select
                value={defaultContractModel}
                onChange={(e) => setDefaultContractModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs font-semibold focus:outline-hidden"
              >
                <option value="modelo_padrao_formacao">Contrato Padrão de Formação Profissional (2026)</option>
                <option value="modelo_ensino_superior">Contrato de Graduação / Ensino Superior</option>
                <option value="modelo_bolseiro_convenio">Contrato com Cláusula de Convênio / Empresa</option>
              </select>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('templates.declaration_model', 'Declaração de Matrícula')}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Declarações formais com QR Code de verificação SIVEC integrado.
                </p>
              </div>
              <select
                value={defaultDeclarationModel}
                onChange={(e) => setDefaultDeclarationModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs font-semibold focus:outline-hidden"
              >
                <option value="declaracao_com_notas_siverc">Declaração com Pautas / Notas e Selo Digital</option>
                <option value="declaracao_simples_frequencia">Declaração Simples de Frequência Escolar</option>
                <option value="declaracao_fim_estudos">Declaração de Conclusão de Nível / Habilitações</option>
              </select>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('templates.certificate_model', 'Certificado de Formação')}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Layout de diploma com bordas clássicas, marcas de segurança e QR Code SIVEC.
                </p>
              </div>
              <select
                value={defaultCertificateModel}
                onChange={(e) => setDefaultCertificateModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs font-semibold focus:outline-hidden"
              >
                <option value="certificado_diploma_nacional">Certificado Oficial Padrão Moçambique (A4 Horizontal)</option>
                <option value="certificado_moderno_dark">Certificado Moderno Executive SIVEC (A4 Horizontal)</option>
                <option value="certificado_participacao_workshop">Certificado de Participação / Workshop (A4)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Regras de Pagamento & Mensagens */}
      {activeTab === 'regras_mensagens' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regras de Pagamento, Vencimento & Multa */}
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Regras de Vencimento e Multas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('finance.due_day', 'Dia de Vencimento da Propina')}
                </label>
                <select
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold focus:outline-hidden"
                >
                  <option value={5}>Dia 05 de cada mês</option>
                  <option value={10}>Dia 10 de cada mês</option>
                  <option value={15}>Dia 15 de cada mês</option>
                  <option value={20}>Dia 20 de cada mês</option>
                  <option value={25}>Dia 25 de cada mês</option>
                  <option value={30}>Último dia do mês</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('finance.tolerance_days', 'Dias de Tolerância')}
                </label>
                <input
                  type="number"
                  value={toleranceDays}
                  onChange={(e) => setToleranceDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('finance.fine_amount', 'Multa Fixa por Atraso')} (MT)
                </label>
                <input
                  type="number"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('finance.fine_percentage', 'Multa Percentual')} (%)
                </label>
                <input
                  type="number"
                  value={finePercentage}
                  onChange={(e) => setFinePercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('finance.daily_interest', 'Juros Diários')} (% ao dia)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRateDaily}
                  onChange={(e) => setInterestRateDaily(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Mensagens Padronizadas (SMS / WhatsApp) */}
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              {t('messages.title', 'Modelos de Mensagens (SMS & WhatsApp)')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('messages.welcome', 'Boas-Vindas & Matrícula')}</span>
                  <span className="text-[10px] text-slate-500">{'{NOME}, {CURSO}, {CODIGO}'}</span>
                </label>
                <textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('messages.due_reminder', 'Lembrete de Vencimento de Propina')}</span>
                  <span className="text-[10px] text-slate-500">{'{NOME}, {MES}, {DIA_VENCIMENTO}'}</span>
                </label>
                <textarea
                  rows={2}
                  value={dueReminderMessage}
                  onChange={(e) => setDueReminderMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('messages.overdue', 'Aviso de Atraso e Multa')}</span>
                  <span className="text-[10px] text-slate-500">{'{NOME}, {MES}, {MULTA}'}</span>
                </label>
                <textarea
                  rows={2}
                  value={overdueMessage}
                  onChange={(e) => setOverdueMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('messages.payment_receipt', 'Recibo de Pagamento')}</span>
                  <span className="text-[10px] text-slate-500">{'{VALOR}, {SERVICO}, {NUMERO_RECIBO}'}</span>
                </label>
                <textarea
                  rows={2}
                  value={receiptMessage}
                  onChange={(e) => setReceiptMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1527] border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
