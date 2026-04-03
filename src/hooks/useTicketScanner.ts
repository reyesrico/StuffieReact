import { useEffect, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { useTranslation } from 'react-i18next';

import type Category from '../components/types/Category';
import type Subcategory from '../components/types/Subcategory';
import { useCategories, useSubcategories, useAddProduct } from './queries';
import {
  type ParsedItem,
  type ScanStep,
  parseReceiptText,
  createSampleReceiptCanvas,
} from '../lib/receiptParser';

export interface TicketScannerState {
  // Step & OCR
  step: ScanStep;
  previewSrc: string | null;
  ocrStatus: string;
  ocrProgress: number;
  ocrError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;

  // Catalog data
  categories: Category[];
  subcategories: Subcategory[];

  // Bulk defaults
  defaultCategory: Category | null;
  defaultSubcategory: Subcategory | null;
  setDefaultCategory: (c: Category) => void;
  setDefaultSubcategory: (s: Subcategory) => void;

  // Items
  items: ParsedItem[];
  selectedItems: ParsedItem[];
  readyItems: ParsedItem[];
  uncategorizedCount: number;

  // Item actions
  toggleItem: (id: string) => void;
  setItemName: (id: string, name: string) => void;
  setItemCategory: (id: string, category: Category) => void;
  setItemSubcategory: (id: string, subcategory: Subcategory) => void;
  handleSelectAll: () => void;
  handleClearAll: () => void;
  applyDefaultToSelected: () => void;

  // Upload actions
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleTestReceipt: () => void;
  handleReset: () => void;

  // Confirm
  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;
  isAdding: boolean;
  addedCount: number;
  handleConfirmAdd: () => Promise<void>;
}

export function useTicketScanner(): TicketScannerState {
  const { t } = useTranslation();

  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const addProductMutation = useAddProduct();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ScanStep>('upload');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<Category | null>(null);
  const [defaultSubcategory, setDefaultSubcategory] = useState<Subcategory | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  useEffect(() => {
    if (categories.length > 0 && !defaultCategory) setDefaultCategory(categories[0]);
  }, [categories, defaultCategory]);

  useEffect(() => {
    if (subcategories.length > 0 && !defaultSubcategory) setDefaultSubcategory(subcategories[0]);
  }, [subcategories, defaultSubcategory]);

  // ── OCR ──────────────────────────────────────────────────────────────────────

  const runOcr = async (source: File | HTMLCanvasElement, preview: string) => {
    setOcrError(null);
    setPreviewSrc(preview);
    setOcrProgress(0);
    setOcrStatus(t('tickets.initEngine'));
    setStep('analyzing');

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
            setOcrStatus(t('tickets.analyzing'));
          } else if (m.status === 'loading language traineddata') {
            setOcrStatus(t('tickets.loadingLang'));
          } else {
            setOcrStatus(t('tickets.initEngine'));
          }
        },
      });
      const { data: { text } } = await worker.recognize(source);
      await worker.terminate();

      const parsed = parseReceiptText(text);
      setItems(parsed.map(p => ({ ...p, category: defaultCategory, subcategory: defaultSubcategory })));
      setStep('review');
    } catch {
      setOcrError(t('tickets.ocrError'));
      setStep('upload');
    }
  };

  // ── Upload handlers ───────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    runOcr(file, URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) runOcr(file, URL.createObjectURL(file));
  };

  const handleTestReceipt = () => {
    const canvas = createSampleReceiptCanvas();
    runOcr(canvas, canvas.toDataURL('image/png'));
  };

  const handleReset = () => {
    setStep('upload');
    setPreviewSrc(null);
    setItems([]);
    setOcrError(null);
    setOcrProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Item handlers ─────────────────────────────────────────────────────────────

  const toggleItem = (id: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));

  const setItemName = (id: string, name: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, name } : i));

  const setItemCategory = (id: string, category: Category) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, category } : i));

  const setItemSubcategory = (id: string, subcategory: Subcategory) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, subcategory } : i));

  const handleSelectAll = () => setItems(prev => prev.map(i => ({ ...i, selected: true })));
  const handleClearAll  = () => setItems(prev => prev.map(i => ({ ...i, selected: false })));

  const applyDefaultToSelected = () =>
    setItems(prev => prev.map(i =>
      i.selected ? { ...i, category: defaultCategory, subcategory: defaultSubcategory } : i
    ));

  // ── Confirm & add ─────────────────────────────────────────────────────────────

  const handleConfirmAdd = async () => {
    setIsAdding(true);
    let count = 0;
    for (const item of items.filter(i => i.selected && i.category && i.subcategory)) {
      try {
        await addProductMutation.mutateAsync({
          name: item.name,
          category: item.category!.id,
          subcategory: item.subcategory!.id,
          cost: item.price ?? undefined,
        });
        count++;
      } catch {
        // continue on individual failures
      }
    }
    setAddedCount(count);
    setIsAdding(false);
    setShowConfirm(false);
    setStep('done');
  };

  // ── Derived ───────────────────────────────────────────────────────────────────

  const selectedItems = items.filter(i => i.selected);
  const readyItems = selectedItems.filter(i => i.category && i.subcategory);
  const uncategorizedCount = selectedItems.length - readyItems.length;

  return {
    step, previewSrc, ocrStatus, ocrProgress, ocrError, fileInputRef,
    categories, subcategories,
    defaultCategory, defaultSubcategory, setDefaultCategory, setDefaultSubcategory,
    items, selectedItems, readyItems, uncategorizedCount,
    toggleItem, setItemName, setItemCategory, setItemSubcategory,
    handleSelectAll, handleClearAll, applyDefaultToSelected,
    handleFileChange, handleDrop, handleTestReceipt, handleReset,
    showConfirm, setShowConfirm, isAdding, addedCount, handleConfirmAdd,
  };
}
