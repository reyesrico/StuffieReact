/**
 * useSmartAdd — logic for the SmartAdd page.
 * 3 input methods: barcode scan, photo (GPT Vision, 1/day), voice (SpeechRecognition).
 * All 3 feed into a shared confirmation form → useAddProduct.
 */
import { useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { useCategories } from './queries/useCategories';
import { useSubcategories } from './queries/useSubcategories';
import { useAddProduct } from './queries/mutations';
import config from '../config/api';
import {
  createSampleBarcodeCanvas,
  createSampleProductCanvas,
  canvasToFile,
} from '../lib/smartAddSamples';
import type { BarcodeDetectorConstructor } from '../components/types/BarcodeDetector';
import type {
  SpeechRecognitionConstructor,
  SpeechRecognitionInstance,
  SpeechRecognitionEvent,
} from '../components/types/SpeechRecognition';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SmartTab = 'barcode' | 'photo' | 'voice';
export type SmartStep = 'input' | 'loading' | 'confirm' | 'success' | 'error';

// One representative product per tab — no AI used for these demos
const EXAMPLE_NAMES: Record<SmartTab, string> = {
  barcode: 'The Great Gatsby',
  photo: 'Sony WH-1000XM5 Headphones',
  voice: 'Nintendo Switch OLED',
};

// Category + subcategory name hints for each example (matched case-insensitively at runtime)
const EXAMPLE_CATEGORIES: Record<SmartTab, { categoryHint: string; subcategoryHint: string }> = {
  barcode: { categoryHint: 'book',       subcategoryHint: 'novel' },
  photo:   { categoryHint: 'electronic', subcategoryHint: 'headphone' },
  voice:   { categoryHint: 'game',       subcategoryHint: 'video' },
};

function findByHint<T extends { id: number; name: string }>(
  items: T[],
  hint: string,
): T | undefined {
  const lower = hint.toLowerCase();
  return items.find(i => i.name.toLowerCase().includes(lower));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Run Tesseract OCR on a File and return the first meaningful product-name line.
 * Filters out ISBN lines, pure numbers, and very short tokens.
 */
async function ocrProductName(
  file: File,
  onStatus: (msg: string) => void,
): Promise<string | null> {
  const worker = await createWorker('eng', 1, {
    logger: (m: any) => {
      if (m.status === 'recognizing text' || m.status === 'loading language traineddata') {
        onStatus('smartAdd.loadingOcr');
      }
    },
  });
  try {
    const { data: { text } } = await worker.recognize(file);
    const lines = text
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) =>
        l.length > 3 &&
        /[a-zA-Z]/.test(l) &&
        !/^isbn/i.test(l) &&
        !/^\d[\d\s-]{4,}$/.test(l),
      );
    return lines.length > 0 ? lines.slice(0, 2).join(' ').trim() : null;
  } finally {
    await worker.terminate();
  }
}

async function lookupISBN(code: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${code}&format=json&jscmd=data`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const book = data[`ISBN:${code}`];
    return book?.title ?? null;
  } catch {
    return null;
  }
}

async function lookupEAN(code: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.product?.product_name ?? null;
  } catch {
    return null;
  }
}

async function lookupBarcodeViaAI(code: string): Promise<string | null> {
  try {
    const res = await fetch(`${config.server}ai-chat`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `What consumer product has the barcode/EAN/ISBN/UPC "${code}"? Reply with ONLY the product name (brand + model/title), or "unknown" if you don't know.`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content: string = data?.content?.trim() ?? '';
    return content.toLowerCase() === 'unknown' || !content ? null : content;
  } catch {
    return null;
  }
}

interface AISuggestResult {
  category_id: number;
  subcategory_id: number;
  suggested_name: string;
}

async function suggestCategories(
  name: string,
  categories: Array<{ id: number; name: string }>,
  subcategories: Array<{ id: number; name: string; category_id?: number }>,
): Promise<AISuggestResult | null> {
  try {
    const prompt = `Given the product name "${name}", pick the most appropriate category and subcategory from the lists below, and suggest a clean product name.

Categories: ${categories.map(c => `${c.id}:${c.name}`).join(', ')}
Subcategories: ${subcategories.map(s => `${s.id}:${s.name}(cat:${s.category_id})`).join(', ')}

Reply with ONLY valid JSON in the format: {"category_id": <number>, "subcategory_id": <number>, "suggested_name": "<string>"}`;

    const res = await fetch(`${config.server}ai-chat`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw: string = data?.content ?? '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as AISuggestResult;
  } catch {
    return null;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSmartAdd() {

  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const addProductMutation = useAddProduct();

  // Navigation state
  const [tab, setTab] = useState<SmartTab>('barcode');
  const [step, setStep] = useState<SmartStep>('input');
  const [loadingMsg, setLoadingMsg] = useState('smartAdd.loadingDetecting');
  const [errorMsg, setErrorMsg] = useState('smartAdd.genericError');

  // Confirm form state
  const [confirmName, setConfirmName] = useState('');
  const [confirmCategoryId, setConfirmCategoryId] = useState<number | null>(null);
  const [confirmSubcategoryId, setConfirmSubcategoryId] = useState<number | null>(null);
  const [confirmPrice, setConfirmPrice] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevPreviewUrlRef = useRef<string | null>(null);

  // Voice state
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // File inputs
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Computed
  const barcodeSupported = 'BarcodeDetector' in window;
  const voiceSupported =
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  const filteredSubcategories =
    confirmCategoryId != null
      ? subcategories.filter(
          (s: { category_id?: number }) => s.category_id === confirmCategoryId,
        )
      : subcategories;

  // ── Internal helpers ───────────────────────────────────────────────────────

  function handleTabChange(t: SmartTab) {
    setTab(t);
    setStep('input');
    setErrorMsg('smartAdd.genericError');
    setVoiceTranscript('');
    setVoiceListening(false);
    recognitionRef.current?.abort();
    if (prevPreviewUrlRef.current) {
      URL.revokeObjectURL(prevPreviewUrlRef.current);
      prevPreviewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }

  async function applyAISuggest(name: string) {
    setLoadingMsg('smartAdd.loadingCategories');
    const suggestion = await suggestCategories(name, categories, subcategories);
    if (suggestion) {
      setConfirmName(suggestion.suggested_name || name);
      setConfirmCategoryId(suggestion.category_id);
      setConfirmSubcategoryId(suggestion.subcategory_id);
    } else {
      setConfirmName(name);
      setConfirmCategoryId(null);
      setConfirmSubcategoryId(null);
    }
    setStep('confirm');
  }

  // ── Barcode ────────────────────────────────────────────────────────────────

  async function handleBarcodeFile(file: File) {
    if (!barcodeSupported) {
      setErrorMsg('smartAdd.barcodeNotSupported');
      setStep('error');
      return;
    }
    // Capture preview before anything else
    if (prevPreviewUrlRef.current) URL.revokeObjectURL(prevPreviewUrlRef.current);
    const url = URL.createObjectURL(file);
    prevPreviewUrlRef.current = url;
    setPreviewUrl(url);
    setLoadingMsg('smartAdd.barcodeDetecting');
    setStep('loading');
    try {
      const BarcodeDetectorCtor = (window as any).BarcodeDetector as BarcodeDetectorConstructor | undefined;
      if (!BarcodeDetectorCtor) {
        setErrorMsg('smartAdd.barcodeNotSupported');
        setStep('error');
        return;
      }
      const detector = new BarcodeDetectorCtor({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'code_128', 'code_39'],
      });
      const bitmap = await createImageBitmap(file);
      const results = await detector.detect(bitmap);
      bitmap.close();

      if (!results.length) {
        // No machine-readable barcode — fall back to Tesseract OCR text extraction
        setLoadingMsg('smartAdd.loadingOcr');
        const name = await ocrProductName(file, setLoadingMsg);
        if (!name) {
          setErrorMsg('smartAdd.barcodeNotFound');
          setStep('error');
          return;
        }
        await applyAISuggest(name);
        return;
      }

      const code = results[0].rawValue;
      setLoadingMsg('smartAdd.barcodeLookingUp');

      const name =
        (await lookupISBN(code)) ??
        (await lookupEAN(code)) ??
        (await lookupBarcodeViaAI(code));

      if (!name) {
        setErrorMsg('smartAdd.barcodeNotFound');
        setStep('error');
        return;
      }

      await applyAISuggest(name);
    } catch {
      setErrorMsg('smartAdd.genericError');
      setStep('error');
    }
  }

  // ── Photo ──────────────────────────────────────────────────────────────────

  async function handlePhotoFile(file: File) {
    // Capture preview before anything else
    if (prevPreviewUrlRef.current) URL.revokeObjectURL(prevPreviewUrlRef.current);
    const url = URL.createObjectURL(file);
    prevPreviewUrlRef.current = url;
    setPreviewUrl(url);
    setLoadingMsg('smartAdd.loadingOcr');
    setStep('loading');
    try {
      const name = await ocrProductName(file, setLoadingMsg);
      if (!name) {
        setErrorMsg('smartAdd.photoNoProduct');
        setStep('error');
        return;
      }
      await applyAISuggest(name);
    } catch {
      setErrorMsg('smartAdd.genericError');
      setStep('error');
    }
  }

  // ── Voice ──────────────────────────────────────────────────────────────────

  function startVoice() {
    if (!voiceSupported) return;
    const SpeechRec =
      ((window as any).webkitSpeechRecognition ??
      (window as any).SpeechRecognition) as SpeechRecognitionConstructor | undefined;
    if (!SpeechRec) return;
    const recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      setVoiceTranscript(transcript);
    };

    recognition.onend = () => setVoiceListening(false);
    recognition.onerror = () => setVoiceListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceListening(true);
    setVoiceTranscript('');
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setVoiceListening(false);
  }

  async function analyzeVoice() {
    const name = voiceTranscript.trim();
    if (!name) return;
    setLoadingMsg('smartAdd.loadingAnalyzing');
    setStep('loading');
    await applyAISuggest(name);
  }

  // ── Confirm form ───────────────────────────────────────────────────────────

  function handleCategoryChange(cat: { id: number }) {
    setConfirmCategoryId(cat.id);
    setConfirmSubcategoryId(null);
  }

  function handleSubcategoryChange(sub: { id: number }) {
    setConfirmSubcategoryId(sub.id);
  }

  const canAdd =
    !!confirmName.trim() &&
    confirmCategoryId != null &&
    confirmSubcategoryId != null;

  const isAdding = addProductMutation.isPending;

  async function handleAdd() {
    if (!canAdd) return;
    addProductMutation.mutate(
      {
        name: confirmName.trim(),
        category_id: confirmCategoryId!,
        subcategory_id: confirmSubcategoryId!,
        cost: confirmPrice ? parseFloat(confirmPrice) : undefined,
      },
      {
        onSuccess: () => setStep('success'),
        onError: () => {
          setErrorMsg('smartAdd.genericError');
          setStep('error');
        },
      },
    );
  }

  function handleReset() {
    setStep('input');
    setConfirmName('');
    setConfirmCategoryId(null);
    setConfirmSubcategoryId(null);
    setConfirmPrice('');
    setVoiceTranscript('');
    setVoiceListening(false);
    setErrorMsg('smartAdd.genericError');
    if (prevPreviewUrlRef.current) {
      URL.revokeObjectURL(prevPreviewUrlRef.current);
      prevPreviewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }

  async function tryExample() {
    if (tab === 'barcode') {
      // Real canvas → BarcodeDetector (will fail on fake stripes) → Tesseract fallback
      const file = await canvasToFile(createSampleBarcodeCanvas(), 'sample-barcode.jpg');
      await handleBarcodeFile(file);
      return;
    }

    if (tab === 'photo') {
      // Real canvas → Tesseract OCR → AI categorisation
      const file = await canvasToFile(createSampleProductCanvas(), 'sample-product.jpg');
      await handlePhotoFile(file);
      return;
    }

    // Voice — simulate mic input (SpeechRecognition can't be faked)
    const name = EXAMPLE_NAMES.voice;
    const { categoryHint, subcategoryHint } = EXAMPLE_CATEGORIES.voice;
    setVoiceTranscript(name);
    await new Promise<void>(resolve => setTimeout(resolve, 700));
    setLoadingMsg('smartAdd.loadingAnalyzing');
    setStep('loading');
    await new Promise<void>(resolve => setTimeout(resolve, 1200));
    const matchedCat = findByHint(categories, categoryHint) ?? categories[0] ?? null;
    const subsForCat = matchedCat
      ? subcategories.filter((s: { category_id?: number }) => s.category_id === matchedCat.id)
      : subcategories;
    const matchedSub =
      findByHint(subsForCat, subcategoryHint) ?? subsForCat[0] ?? subcategories[0] ?? null;
    setConfirmName(name);
    setConfirmCategoryId(matchedCat?.id ?? null);
    setConfirmSubcategoryId(matchedSub?.id ?? null);
    setStep('confirm');
  }

  return {
    // navigation
    tab,
    handleTabChange,
    step,
    loadingMsg,
    errorMsg,

    // barcode
    barcodeInputRef,
    barcodeSupported,
    handleBarcodeFile,

    // photo
    photoInputRef,
    handlePhotoFile,

    // voice
    voiceListening,
    voiceTranscript,
    voiceSupported,
    startVoice,
    stopVoice,
    analyzeVoice,

    // confirm form
    confirmName,
    setConfirmName,
    confirmCategoryId,
    confirmSubcategoryId,
    confirmPrice,
    setConfirmPrice,
    previewUrl,
    categories,
    subcategories,
    filteredSubcategories,
    handleCategoryChange,
    handleSubcategoryChange,

    // actions
    canAdd,
    isAdding,
    handleAdd,
    handleReset,
    tryExample,
  };
}
