import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Institution, OfficialReceiptRecord, PaymentRecord, PAYMENT_SERVICE_CATALOG } from '../types';
import { resolveInstitutionIdentity } from './institutionIdentity';

export interface ReceiptPdfInput {
  receipt?: OfficialReceiptRecord;
  payment?: PaymentRecord;
  institution?: Partial<Institution>;
  isReprint?: boolean;
}

export interface ReceiptPdfOutput {
  doc: jsPDF;
  fileName: string;
  receiptNumber: string;
}

/**
 * Gera o documento PDF do recibo oficial exclusivamente em memória no navegador via jsPDF.
 * Nunca armazena ficheiros PDF no Firebase Storage nem usa window.open.
 */
export async function buildReceiptPdfDocument(input: ReceiptPdfInput): Promise<ReceiptPdfOutput> {
  const { receipt, payment, institution } = input;
  if (!receipt && !payment) {
    throw new Error('Dados do pagamento ou recibo são obrigatórios para gerar PDF.');
  }

  const identity = resolveInstitutionIdentity(institution as Institution);
  const instName = receipt?.institutionName || identity.officialName || 'Instituição de Ensino SIGAR PRO';
  const instNuit = receipt?.institutionNuit || identity.nuit;
  const instAddress = receipt?.institutionAddress || [identity.address, identity.city, identity.province].filter(Boolean).join(', ');
  const instPhone = receipt?.institutionPhone || identity.phone;

  const receiptNumber =
    receipt?.receiptNumber ||
    payment?.receiptNumber ||
    `REC-${new Date().getFullYear()}-${(payment?.id || receipt?.id || '0000').slice(-5).toUpperCase()}`;

  const studentName = receipt?.studentName || payment?.studentName || 'Utente / Formando';
  const studentCode = receipt?.studentCode || payment?.studentCode || 'N/A';
  const courseName = receipt?.courseName || payment?.courseName || 'Formação Geral';
  const serviceKey = (receipt?.serviceItem || payment?.serviceItem || 'outros') as keyof typeof PAYMENT_SERVICE_CATALOG;
  const serviceLabel =
    receipt?.serviceDescription ||
    payment?.serviceDescription ||
    PAYMENT_SERVICE_CATALOG[serviceKey]?.label ||
    String(receipt?.serviceItem || payment?.serviceItem || 'Serviço Académico');
  const amount = Number(receipt?.amount ?? payment?.amount ?? 0);
  const network = String(receipt?.network || payment?.network || 'M-Pesa');
  const transactionCode = String(receipt?.transactionCode || payment?.transactionCode || 'N/A');
  const paymentDate = receipt?.paymentDate || payment?.date || (receipt?.issuedAt ? receipt.issuedAt.split('T')[0] : new Date().toISOString().split('T')[0]);
  const paymentTime = receipt?.paymentTime || payment?.time || (receipt?.issuedAt ? receipt.issuedAt.slice(11, 16) : '');
  const issuedAt = receipt?.issuedAt || payment?.reviewedAt || new Date().toISOString();
  const issuedBy = receipt?.issuedBy || payment?.reviewedBy || 'Tesouraria';
  const reprintCount = Number(payment?.reprintCount ?? receipt?.reprintCount ?? 0);
  const isReprint = input.isReprint ?? reprintCount > 0;
  const qrCodeValue =
    receipt?.qrVerificationCode ||
    `SIVERC-REC-${receiptNumber}-${transactionCode}`.toUpperCase();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Banner Superior
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 24, 'F');

  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('REPÚBLICA DE MOÇAMBIQUE • SIVERC / SIGAR PRO', 20, y + 7);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text(instName.toUpperCase(), 20, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const contactSummary = [instNuit ? `NUIT: ${instNuit}` : '', instPhone ? `Tel: ${instPhone}` : '', instAddress]
    .filter(Boolean)
    .join('  •  ');
  if (contactSummary) {
    doc.text(contactSummary.slice(0, 95), 20, y + 20);
  }

  y += 30;

  // Bloco Título do Recibo & Via
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('RECIBO OFICIAL DE PAGAMENTO', 20, y + 7.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text(receiptNumber, pageWidth - 20, y + 7.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const viaText = isReprint
    ? `2ª VIA — REIMPRESSÃO OFICIAL (#${Math.max(1, reprintCount)}) • SEM DUPLICAÇÃO DE CRÉDITO`
    : '1ª VIA — DOCUMENTO ORIGINAL HOMOLOGADO';
  doc.text(viaText, 20, y + 13.5);
  doc.text(`Emitido em: ${new Date(issuedAt).toLocaleString('pt-MZ')}`, pageWidth - 20, y + 13.5, { align: 'right' });

  y += 24;

  // Dados do Estudante & Transação
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DADOS DO ESTUDANTE / UTENTE', 20, y + 6);
  doc.text('DADOS DA TRANSAÇÃO', 112, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(studentName.slice(0, 42), 20, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Código / Matrícula: ${studentCode}`, 20, y + 19);
  doc.text(`Curso / Modalidade: ${courseName.slice(0, 40)}`, 20, y + 25);

  doc.text(`Canal / Método: ${network}`, 112, y + 13);
  doc.text(`Referência Tx: ${transactionCode}`, 112, y + 19);
  doc.text(`Data do Pagamento: ${paymentDate}${paymentTime ? ` ${paymentTime}` : ''}`, 112, y + 25);

  y += 38;

  // Tabela de Itens Liquidados
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DESCRIÇÃO DO SERVIÇO / RUBRICA', 20, y + 5.5);
  doc.text('REFERÊNCIA', 125, y + 5.5);
  doc.text('VALOR (MZN)', pageWidth - 20, y + 5.5, { align: 'right' });

  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 16, 'S');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(serviceLabel.slice(0, 52), 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Estado: Homologado e Quitado`, 20, y + 12.5);
  doc.setFont('courier', 'bold');
  doc.text(transactionCode.slice(0, 20), 125, y + 9.5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT`, pageWidth - 20, y + 9.5, { align: 'right' });

  y += 16;

  // Linha Total
  doc.setFillColor(236, 253, 245);
  doc.rect(14, y, pageWidth - 28, 12, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.rect(14, y, pageWidth - 28, 12, 'S');
  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL PAGO E QUITADO', 20, y + 7.5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.text(`${amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT`, pageWidth - 20, y + 8, { align: 'right' });

  y += 20;

  // QR Code & Assinatura / Responsável
  try {
    const qrDataUrl = await QRCode.toDataURL(qrCodeValue, { width: 120, margin: 1 });
    doc.addImage(qrDataUrl, 'PNG', 18, y, 26, 26);
  } catch {
    doc.setDrawColor(148, 163, 184);
    doc.rect(18, y, 26, 26);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('AUTENTICIDADE DIGITAL SIVERC', 48, y + 6);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Código de Verificação: ${qrCodeValue}`, 48, y + 12);
  doc.text(`Aprovado por: ${issuedBy}`, 48, y + 18);
  doc.text(`Data de Homologação: ${new Date(issuedAt).toLocaleString('pt-MZ')}`, 48, y + 24);

  // Linha de assinatura
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - 74, y + 18, pageWidth - 16, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Tesouraria / Direção Financeira', pageWidth - 45, y + 23, { align: 'center' });

  y += 34;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Recibo oficial gerado sob demanda pelo SIGAR PRO. Documento imutável no livro contabilístico após homologação.',
    pageWidth / 2,
    y + 5,
    { align: 'center' }
  );

  const safeReceiptName = receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  return {
    doc,
    fileName: `Recibo_${safeReceiptName}.pdf`,
    receiptNumber
  };
}

export async function downloadReceiptPdf(input: ReceiptPdfInput): Promise<{ fileName: string; receiptNumber: string; byteLength: number }> {
  const { doc, fileName, receiptNumber } = await buildReceiptPdfDocument(input);
  const arrayBuffer = doc.output('arraybuffer');
  doc.save(fileName);
  return {
    fileName,
    receiptNumber,
    byteLength: arrayBuffer.byteLength
  };
}

export async function getReceiptPdfBytes(input: ReceiptPdfInput): Promise<Uint8Array> {
  const { doc } = await buildReceiptPdfDocument(input);
  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}

export async function printReceiptPdf(input: ReceiptPdfInput): Promise<void> {
  const { doc } = await buildReceiptPdfDocument(input);
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        iframe.remove();
      }, 1500);
    }
  };
  document.body.appendChild(iframe);
}
