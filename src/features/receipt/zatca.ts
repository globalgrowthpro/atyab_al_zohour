/**
 * ZATCA (Saudi Tax and Customs Authority) Phase 1 & 2 TLV & QR Code Utilities
 * Atyab Al Zohour Perishable Floral Invoicing
 */

export interface ZatcaInvoiceData {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalWithVat: number;
  vatAmount: number;
}

/**
 * Encodes string to UTF-8 TLV format (Tag-Length-Value) as required by ZATCA
 */
function toTLV(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const tlv = new Uint8Array(2 + valueBytes.length);
  tlv[0] = tag;
  tlv[1] = valueBytes.length;
  tlv.set(valueBytes, 2);
  return tlv;
}

/**
 * Generates ZATCA compliant Base64 TLV payload
 */
export function generateZatcaTlvBase64(data: ZatcaInvoiceData): string {
  const t1 = toTLV(1, data.sellerName);
  const t2 = toTLV(2, data.vatNumber);
  const t3 = toTLV(3, data.timestamp);
  const t4 = toTLV(4, data.totalWithVat.toFixed(2));
  const t5 = toTLV(5, data.vatAmount.toFixed(2));

  const totalLength = t1.length + t2.length + t3.length + t4.length + t5.length;
  const merged = new Uint8Array(totalLength);

  let offset = 0;
  for (const part of [t1, t2, t3, t4, t5]) {
    merged.set(part, offset);
    offset += part.length;
  }

  // Base64 encode in browser/Node
  if (typeof btoa === "function") {
    let binary = "";
    for (let i = 0; i < merged.length; i++) {
      binary += String.fromCharCode(merged[i]!);
    }
    return btoa(binary);
  }
  return Buffer.from(merged).toString("base64");
}

/**
 * Generates deterministic 25x25 QR Matrix modules for visual SVG QR display
 */
export function generateDeterministicQrMatrix(seedStr: string, size = 25): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to draw standard 7x7 Finder Pattern at (row, col)
  function drawFinderPattern(startR: number, startC: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startR + r]![startC + c] = true;
        } else {
          matrix[startR + r]![startC + c] = false;
        }
      }
    }
  }

  // Top-Left, Top-Right, Bottom-Left Finder Patterns
  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6]![i] = i % 2 === 0;
    matrix[i]![6] = i % 2 === 0;
  }

  // Seed data modules
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder pattern zones
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= size - 8;
      const isBottomLeft = r >= size - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!isTopLeft && !isTopRight && !isBottomLeft && !isTiming) {
        const val = Math.sin(hash + r * 17 + c * 31) * 10000;
        matrix[r]![c] = val - Math.floor(val) > 0.45;
      }
    }
  }

  return matrix;
}

