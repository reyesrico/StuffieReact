/**
 * receiptParser — pure utilities for the Tickets receipt scanner.
 *
 * No React, no side effects. Everything here is deterministic and testable.
 */
import type Category from '../components/types/Category';
import type Subcategory from '../components/types/Subcategory';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedItem {
  id: string;
  name: string;
  price: number | null;
  selected: boolean;
  category: Category | null;
  subcategory: Subcategory | null;
}

export type ScanStep = 'upload' | 'analyzing' | 'review' | 'done';

// ─── Step helpers ─────────────────────────────────────────────────────────────

export const STEPS_KEYS: ScanStep[] = ['upload', 'review', 'done'];

export function toStepIndex(step: ScanStep): number {
  if (step === 'upload') return 0;
  if (step === 'analyzing' || step === 'review') return 1;
  return 2;
}

// ─── Receipt text parser ──────────────────────────────────────────────────────
// Extracts item lines: any line with a dollar amount at the end that is NOT
// a totals/payment/store-info line.

const SKIP_RE = /\b(subtotal|sub.total|total|tax|gst|hst|pst|discount|saving|save|rebate|cash|change|balance|visa|mastercard|amex|discover|debit|credit|approved|auth|receipt|store|thank|welcome|phone|fax|tel|www\.|\.(com|net|org)|email|return|coupon|rewards|member|loyalty|points|date:|time:|trans|qty|#)\b/i;
const PRICE_RE = /\$?\s*(\d{1,4}[.,]\d{2})\s*$/;

export function parseReceiptText(rawText: string): ParsedItem[] {
  const result: ParsedItem[] = [];

  for (const raw of rawText.split('\n')) {
    const line = raw.trim();
    if (!line || line.length < 4) continue;
    if (SKIP_RE.test(line)) continue;

    const priceMatch = line.match(PRICE_RE);
    if (!priceMatch) continue;

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    if (price < 0.50 || price > 9999) continue;

    const name = line
      .slice(0, line.length - priceMatch[0].length)
      .trim()
      .replace(/\s+/g, ' ');

    if (!name || name.length < 2 || /^\d+$/.test(name)) continue;

    result.push({
      id: Math.random().toString(36).slice(2),
      name,
      price,
      selected: true,
      category: null,
      subcategory: null,
    });
  }

  return result;
}

// ─── Sample receipt canvas ────────────────────────────────────────────────────
// Draws a realistic Best Buy receipt directly onto a Canvas element.
// Tesseract can read Canvas elements natively so no image file is needed.

export function createSampleReceiptCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 540;
  canvas.height = 680;
  const ctx = canvas.getContext('2d')!;
  const mono = '"Courier New", Courier, monospace';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const center = canvas.width / 2;

  // Header
  ctx.fillStyle = '#000';
  ctx.font = `bold 28px ${mono}`;
  ctx.textAlign = 'center';
  ctx.fillText('BEST BUY', center, 50);

  ctx.font = `14px ${mono}`;
  ctx.fillText('Store #1042 — San Mateo CA', center, 76);
  ctx.fillText('123 Gateway Blvd, San Mateo CA 94404', center, 96);
  ctx.fillText('(650) 555-0142', center, 116);
  ctx.fillText('Date: 04/02/2026    Time: 14:32', center, 136);

  // Divider
  ctx.textAlign = 'left';
  ctx.fillStyle = '#555';
  ctx.font = `13px ${mono}`;
  ctx.fillText('- - - - - - - - - - - - - - - - - - - - - -', 25, 162);

  // Items
  const receiptItems: [string, string][] = [
    ['LG OLED C4 55IN 4K TV',   '899.99'],
    ['NINTENDO SWITCH 2',        '449.99'],
    ['THE NATURE FIX BOOK',      ' 16.99'],
    ['HDMI PREMIUM CABLE 6FT',  ' 19.99'],
  ];

  ctx.fillStyle = '#000';
  ctx.font = `16px ${mono}`;
  let y = 195;
  for (const [name, price] of receiptItems) {
    ctx.textAlign = 'left';
    ctx.fillText(name, 25, y);
    ctx.textAlign = 'right';
    ctx.fillText(price, canvas.width - 25, y);
    y += 30;
  }

  // Divider
  ctx.textAlign = 'left';
  ctx.fillStyle = '#555';
  ctx.font = `13px ${mono}`;
  ctx.fillText('- - - - - - - - - - - - - - - - - - - - - -', 25, y + 5);
  y += 28;

  // Totals
  ctx.fillStyle = '#000';
  ctx.font = `14px ${mono}`;
  for (const [label, val] of [['SUBTOTAL', '1386.96'], ['TAX 8.75%', ' 121.36']]) {
    ctx.textAlign = 'left';
    ctx.fillText(label, 25, y);
    ctx.textAlign = 'right';
    ctx.fillText(val, canvas.width - 25, y);
    y += 26;
  }

  ctx.font = `bold 16px ${mono}`;
  ctx.textAlign = 'left';
  ctx.fillText('TOTAL', 25, y);
  ctx.textAlign = 'right';
  ctx.fillText('1508.32', canvas.width - 25, y);
  y += 30;

  // Divider + payment
  ctx.textAlign = 'left';
  ctx.fillStyle = '#555';
  ctx.font = `13px ${mono}`;
  ctx.fillText('- - - - - - - - - - - - - - - - - - - - - -', 25, y + 5);
  y += 26;

  ctx.fillStyle = '#000';
  ctx.font = `14px ${mono}`;
  ctx.fillText('VISA CREDIT CARD ****1234', 25, y);
  ctx.textAlign = 'right';
  ctx.fillText('1508.32', canvas.width - 25, y);
  y += 22;
  ctx.textAlign = 'left';
  ctx.fillText('AUTH: 827341', 25, y);
  y += 36;

  // Footer
  ctx.fillStyle = '#555';
  ctx.font = `13px ${mono}`;
  ctx.fillText('- - - - - - - - - - - - - - - - - - - - - -', 25, y);
  y += 26;

  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText('THANK YOU FOR SHOPPING AT BEST BUY!', center, y);
  y += 20;
  ctx.fillStyle = '#555';
  ctx.font = `12px ${mono}`;
  ctx.fillText('RETURNS ACCEPTED WITHIN 15 DAYS WITH RECEIPT', center, y);

  return canvas;
}
