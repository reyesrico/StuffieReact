/**
 * smartAddSamples — canvas-generated demo images for SmartAdd examples.
 * Same pattern as createSampleReceiptCanvas in receiptParser.ts.
 * Text is laid out for good Tesseract OCR readability (black on white,
 * large clear font, no noise around product title).
 */

// ─── Barcode sample (book label) ──────────────────────────────────────────────

export function createSampleBarcodeCanvas(): HTMLCanvasElement {
  const W = 340, H = 220;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Decorative barcode stripes (visual only — not machine-readable)
  const widths = [3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 2, 1, 3, 2, 1, 2, 3, 1, 2, 1];
  let x = 20;
  widths.forEach((w, i) => {
    ctx.fillStyle = i % 2 === 0 ? '#000000' : '#ffffff';
    ctx.fillRect(x, 10, w * 4, 76);
    x += w * 4;
  });

  // Product title — large, OCR-friendly
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('The Great Gatsby', W / 2, 130);

  // Author
  ctx.fillStyle = '#444444';
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText('F. Scott Fitzgerald', W / 2, 160);

  // ISBN (placed last so Tesseract reads title first)
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '13px monospace';
  ctx.fillText('ISBN 978-0-7432-7356-5', W / 2, 192);

  return canvas;
}

// ─── Product sample (electronics box) ────────────────────────────────────────

export function createSampleProductCanvas(): HTMLCanvasElement {
  const W = 340, H = 260;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Box border
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  // Dark brand banner
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(10, 10, W - 20, 52);

  // Brand name (white on dark — OCR handles well)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SONY', W / 2, 46);

  // Model name — large, black on white
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillText('WH-1000XM5', W / 2, 108);

  // Description
  ctx.fillStyle = '#333333';
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText('Wireless Headphones', W / 2, 142);

  // Decorative headphone icon (arcs)
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(W / 2, 208, 38, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2 - 38, 208, 11, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2 + 38, 208, 11, 0, 2 * Math.PI);
  ctx.stroke();

  return canvas;
}

// ─── Helper: canvas → File ────────────────────────────────────────────────────

export async function canvasToFile(
  canvas: HTMLCanvasElement,
  filename: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('canvas toBlob failed'));
        resolve(new File([blob], filename, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  });
}
