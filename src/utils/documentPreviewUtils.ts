/**
 * Utilitários seguros para leitura, validação, pré-visualização e descarga de documentos (PDF e Imagens)
 * no fluxo de candidaturas online e conferência documental da secretaria.
 */

export const MAX_PUBLIC_DOC_PDF_BYTES = 450 * 1024; // 450 KB raw (~600 KB em base64)
export const MAX_PUBLIC_DOC_IMAGE_RAW_BYTES = 5 * 1024 * 1024; // 5 MB antes de compressão
export const MAX_PUBLIC_DOCS_TOTAL_BYTES = 820_000; // Folga segura abaixo de 1 MiB no Firestore

export function getUtf8Bytes(value: string): number {
  if (!value) return 0;
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value).length;
  }
  return value.length;
}

export function isPdfFileMeta(meta: { mimeType?: string; type?: string; fileName?: string; url?: string }): boolean {
  const url = (meta.url || '').trim().toLowerCase();
  const mime = (meta.mimeType || meta.type || '').trim().toLowerCase();
  const fileName = (meta.fileName || '').trim().toLowerCase();
  if (url.startsWith('data:application/pdf')) return true;
  if (mime === 'application/pdf') return true;
  if (fileName.endsWith('.pdf')) return true;
  if (/\.pdf(\?|$)/i.test(url)) return true;
  return false;
}

export function isImageDocumentMeta(meta: { mimeType?: string; type?: string; fileName?: string; url?: string }): boolean {
  if (isPdfFileMeta(meta)) return false;
  const url = (meta.url || '').trim().toLowerCase();
  const mime = (meta.mimeType || meta.type || '').trim().toLowerCase();
  const fileName = (meta.fileName || '').trim().toLowerCase();
  if (url.startsWith('data:image/')) return true;
  if (mime.startsWith('image/')) return true;
  if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(fileName)) return true;
  if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(url)) return true;
  return false;
}

export function isSafeDocumentUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#') return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^blob:/i.test(trimmed)) return true;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.test(trimmed)) return true;
  if (/^data:application\/pdf(;[^,]*)?;base64,[a-z0-9+/=]+$/i.test(trimmed)) return true;
  return false;
}

export function calculateApplicationAttachmentsByteSize(
  photoUrl: string,
  docs: Record<string, { dataUrl?: string } | undefined>
): number {
  let total = getUtf8Bytes(photoUrl || '');
  for (const item of Object.values(docs || {})) {
    if (item?.dataUrl) {
      total += getUtf8Bytes(item.dataUrl);
    }
  }
  return total;
}

/**
 * Lê um ficheiro PDF e valida formato, tamanho máximo (<= 450 KB raw) e assinatura base64 `%PDF-`.
 */
export function readPdfFileAsValidatedDataUrl(
  file: File,
  maxRawBytes = MAX_PUBLIC_DOC_PDF_BYTES
): Promise<string> {
  return new Promise((resolve, reject) => {
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    const isPdfMime = file.type === 'application/pdf';
    if (!isPdfMime && !isPdfExt) {
      reject(new Error(`O ficheiro "${file.name}" não é um PDF válido.`));
      return;
    }
    if (file.type && !isPdfMime && file.type !== 'application/octet-stream') {
      reject(new Error(`Tipo MIME inválido (${file.type}) para documento PDF.`));
      return;
    }
    if (!file.size || file.size <= 0) {
      reject(new Error(`O ficheiro "${file.name}" está vazio.`));
      return;
    }
    if (file.size > maxRawBytes) {
      reject(
        new Error(
          `O PDF "${file.name}" excede o limite de ${Math.round(maxRawBytes / 1024)} KB para submissão segura. Comprima o PDF ou envie uma imagem JPG/PNG.`
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Erro ao ler o ficheiro PDF "${file.name}".`));
    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : '';
      const base64Idx = raw.indexOf(',');
      if (base64Idx < 0) {
        reject(new Error('Não foi possível codificar o ficheiro PDF.'));
        return;
      }
      const b64 = raw.slice(base64Idx + 1).trim();
      if (!b64) {
        reject(new Error('O ficheiro PDF não contém dados válidos.'));
        return;
      }
      // Verificar cabeçalho mágico %PDF- nos primeiros bytes codificados (JVBERi0 em base64)
      if (!b64.startsWith('JVBERi0')) {
        reject(new Error(`O ficheiro "${file.name}" não possui uma estrutura PDF autêntica (%PDF-).`));
        return;
      }
      resolve(`data:application/pdf;base64,${b64}`);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Converte uma DataURL segura (ex.: data:application/pdf;base64,...) num Blob ObjectURL
 * fiável para pré-visualização em <iframe> e descarga em Chromium sem bloqueio de data: URI.
 */
export function dataUrlToBlobUrl(dataUrl: string): string | null {
  if (!isSafeDocumentUrl(dataUrl) || !dataUrl.startsWith('data:')) {
    return null;
  }
  if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return null;
  }
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx < 0) return null;
  const header = dataUrl.slice(5, commaIdx);
  const b64 = dataUrl.slice(commaIdx + 1);
  const mime = header.split(';')[0] || 'application/octet-stream';

  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function getSuggestedDownloadFilename(doc: {
  name?: string;
  fileName?: string;
  mimeType?: string;
  type?: string;
  url?: string;
}): string {
  const base = (doc.fileName || doc.name || 'documento').trim().replace(/[^\w.\-()\s]/g, '_');
  if (isPdfFileMeta(doc) && !base.toLowerCase().endsWith('.pdf')) {
    return `${base}.pdf`;
  }
  return base || 'documento';
}
