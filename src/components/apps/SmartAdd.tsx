import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  QrCode20Regular,
  Camera20Regular,
  Mic20Regular,
  ArrowUpload20Regular,
} from '@fluentui/react-icons';

import DropDown from '../shared/DropDown';
import Button from '../shared/Button';
import Loading from '../shared/Loading';
import type Category from '../types/Category';
import type Subcategory from '../types/Subcategory';
import { useSmartAdd, type SmartTab } from '../../hooks/useSmartAdd';

import './SmartAdd.scss';

// ─── Drop Zone ────────────────────────────────────────────────────────────────

interface DropZoneProps {
  inputRef: React.RefObject<HTMLInputElement>;
  accept: string;
  onFile: (file: File) => void;
  label: string;
  hint: string;
}

const DropZone: React.FC<DropZoneProps> = ({ inputRef, accept, onFile, label, hint }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFile(file);
      e.target.value = '';
    }
  };

  return (
    <div
      className="smart-add__drop-zone"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      aria-label={label}
    >
      <span className="smart-add__drop-icon"><ArrowUpload20Regular /></span>
      <p className="smart-add__drop-label">{label}</p>
      <p className="smart-add__drop-hint">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="smart-add__file-input"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SmartAdd: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    tab, handleTabChange, step, loadingMsg, errorMsg,
    barcodeInputRef, barcodeSupported, handleBarcodeFile,
    photoInputRef, handlePhotoFile,
    voiceListening, voiceTranscript, voiceSupported, startVoice, stopVoice, analyzeVoice,
    confirmName, setConfirmName, confirmCategoryId, confirmSubcategoryId,
    confirmPrice, setConfirmPrice, previewUrl,
    categories, filteredSubcategories,
    handleCategoryChange, handleSubcategoryChange,
    canAdd, isAdding, handleAdd, handleReset, tryExample,
  } = useSmartAdd();

  const tabs: { key: SmartTab; label: string; icon: React.ReactNode }[] = [
    { key: 'barcode', label: t('smartAdd.tabBarcode'), icon: <QrCode20Regular /> },
    { key: 'photo', label: t('smartAdd.tabPhoto'), icon: <Camera20Regular /> },
    { key: 'voice', label: t('smartAdd.tabVoice'), icon: <Mic20Regular /> },
  ];

  // ── Input step per tab ─────────────────────────────────────────────────────

  const renderInput = () => {
    if (tab === 'barcode') {
      return (
        <div className="smart-add__tab-content">
          <h3 className="smart-add__section-title">{t('smartAdd.barcodeTitle')}</h3>
          <p className="smart-add__section-hint">{t('smartAdd.barcodeHint')}</p>
          {!barcodeSupported && (
            <p className="smart-add__warn">{t('smartAdd.barcodeNotSupported')}</p>
          )}
          <DropZone
            inputRef={barcodeInputRef}
            accept="image/*"
            onFile={handleBarcodeFile}
            label={t('smartAdd.barcodeDropTitle')}
            hint={t('smartAdd.barcodeDropHint')}
          />
          <div className="smart-add__example">
            <span className="smart-add__example-note">{t('smartAdd.exampleNote')}</span>
            <button className="smart-add__example-btn" onClick={tryExample} type="button">
              {t('smartAdd.tryExample')} — "The Great Gatsby"
            </button>
          </div>
        </div>
      );
    }

    if (tab === 'photo') {
      return (
        <div className="smart-add__tab-content">
          <h3 className="smart-add__section-title">{t('smartAdd.photoTitle')}</h3>
          <p className="smart-add__section-hint">{t('smartAdd.photoHint')}</p>
          <DropZone
            inputRef={photoInputRef}
            accept="image/*"
            onFile={handlePhotoFile}
            label={t('smartAdd.barcodeDropTitle')}
            hint={t('smartAdd.barcodeDropHint')}
          />
          <div className="smart-add__example">
            <span className="smart-add__example-note">{t('smartAdd.exampleNote')}</span>
            <button className="smart-add__example-btn" onClick={tryExample} type="button">
              {t('smartAdd.tryExample')} — "Sony WH-1000XM5 Headphones"
            </button>
          </div>
        </div>
      );
    }

    // voice
    return (
      <div className="smart-add__tab-content">
        <h3 className="smart-add__section-title">{t('smartAdd.voiceTitle')}</h3>
        <p className="smart-add__section-hint">{t('smartAdd.voiceHint')}</p>

        {!voiceSupported && (
          <p className="smart-add__warn">{t('smartAdd.voiceNotSupported')}</p>
        )}

        {voiceSupported && (
          <>
            <Button
              variant={voiceListening ? 'primary' : 'outline'}
              size="lg"
              icon={<Mic20Regular />}
              text={voiceListening ? t('smartAdd.voiceStop') : t('smartAdd.voiceStart')}
              onClick={voiceListening ? stopVoice : startVoice}
              className={voiceListening ? 'smart-add__voice-btn--recording' : ''}
            />

            {voiceTranscript && (
              <p className="smart-add__transcript">"{voiceTranscript}"</p>
            )}

            {voiceTranscript && !voiceListening && (
              <Button
                variant="secondary"
                size="md"
                text={t('smartAdd.voiceAnalyze')}
                onClick={analyzeVoice}
              />
            )}
          </>
        )}

        <div className="smart-add__example">
          <span className="smart-add__example-note">{t('smartAdd.exampleNote')}</span>
          <button className="smart-add__example-btn" onClick={tryExample} type="button">
            {t('smartAdd.tryExample')} — "Nintendo Switch OLED"
          </button>
        </div>
      </div>
    );
  };

  // ── Loading step ───────────────────────────────────────────────────────────

  const renderLoading = () => (
    <div className="smart-add__loading">
      <Loading />
      <p className="smart-add__loading-msg">{t(loadingMsg)}</p>
    </div>
  );

  // ── Confirm step ───────────────────────────────────────────────────────────

  const renderConfirm = () => {
    // Put the AI-suggested item first so DropDown (seeded from values[0]) shows it selected
    const orderedCategories = confirmCategoryId != null
      ? [
          ...categories.filter((c: Category) => c.id === confirmCategoryId),
          ...categories.filter((c: Category) => c.id !== confirmCategoryId),
        ]
      : categories;

    const orderedSubcategories = confirmSubcategoryId != null
      ? [
          ...filteredSubcategories.filter((s: Subcategory) => s.id === confirmSubcategoryId),
          ...filteredSubcategories.filter((s: Subcategory) => s.id !== confirmSubcategoryId),
        ]
      : filteredSubcategories;

    return (
    <div className="smart-add__confirm">
      <h3 className="smart-add__section-title">{t('smartAdd.confirmTitle')}</h3>

      {previewUrl && (
        <div className="smart-add__preview">
          <img
            src={previewUrl}
            alt={t('smartAdd.previewAlt')}
            className="smart-add__preview-img"
          />
        </div>
      )}

      <div className="smart-add__field">
        <label className="smart-add__label" htmlFor="sa-name">
          {t('smartAdd.confirmName')}
        </label>
        <input
          id="sa-name"
          className="smart-add__input"
          type="text"
          value={confirmName}
          onChange={e => setConfirmName(e.target.value)}
        />
      </div>

      <div className="smart-add__field">
        <label className="smart-add__label">{t('smartAdd.confirmCategory')}</label>
        <DropDown
          key={`cat-${confirmCategoryId ?? 'none'}`}
          values={orderedCategories as any[]}
          placeholder={t('smartAdd.confirmCategory')}
          onChange={(cat: Category) => handleCategoryChange(cat)}
          fullWidth
        />
      </div>

      <div className="smart-add__field">
        <label className="smart-add__label">{t('smartAdd.confirmSubcategory')}</label>
        <DropDown
          key={`sub-${confirmCategoryId ?? 'none'}-${confirmSubcategoryId ?? 'none'}`}
          values={orderedSubcategories as any[]}
          placeholder={t('smartAdd.confirmSubcategory')}
          onChange={(sub: Subcategory) => handleSubcategoryChange(sub)}
          disabled={!confirmCategoryId}
          fullWidth
        />
      </div>

      <div className="smart-add__field">
        <label className="smart-add__label" htmlFor="sa-price">
          {t('smartAdd.confirmPrice')}
        </label>
        <input
          id="sa-price"
          className="smart-add__input"
          type="number"
          min="0"
          step="0.01"
          value={confirmPrice}
          onChange={e => setConfirmPrice(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="smart-add__actions">
        <Button
          variant="ghost"
          text={t('smartAdd.confirmBack')}
          onClick={handleReset}
          disabled={isAdding}
        />
        <Button
          variant="primary"
          text={isAdding ? t('addProduct.confirmAdding') : t('smartAdd.confirmAdd')}
          onClick={handleAdd}
          disabled={!canAdd || isAdding}
          loading={isAdding}
        />
      </div>
    </div>
    );
  };

  // ── Success step ───────────────────────────────────────────────────────────

  const renderSuccess = () => (
    <div className="smart-add__success">
      <div className="smart-add__success-icon">✓</div>
      <h3 className="smart-add__section-title">{t('smartAdd.successTitle')}</h3>
      <p className="smart-add__section-hint">{t('smartAdd.successAdded', { name: confirmName })}</p>
      <div className="smart-add__actions">
        <Button
          variant="outline"
          text={t('smartAdd.goToProducts')}
          onClick={() => navigate('/products')}
        />
        <Button
          variant="primary"
          text={t('smartAdd.addAnother')}
          onClick={handleReset}
        />
      </div>
    </div>
  );

  // ── Error step ─────────────────────────────────────────────────────────────

  const renderError = () => (
    <div className="smart-add__error">
      <p className="smart-add__error-msg">{t(errorMsg)}</p>
      <Button
        variant="primary"
        text={t('smartAdd.retry')}
        onClick={handleReset}
      />
    </div>
  );

  // ── Page ───────────────────────────────────────────────────────────────────

  return (
    <div className="smart-add">
      <div className="smart-add__header">
        <h2 className="smart-add__title">{t('smartAdd.title')}</h2>
        <p className="smart-add__subtitle">{t('smartAdd.subtitle')}</p>
      </div>

      {(step === 'input' || step === 'error') && (
        <div className="smart-add__tabs" role="tablist">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              className={`smart-add__tab${tab === key ? ' smart-add__tab--active' : ''}`}
              onClick={() => handleTabChange(key)}
              type="button"
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="smart-add__body">
        {step === 'input' && renderInput()}
        {step === 'loading' && renderLoading()}
        {step === 'confirm' && renderConfirm()}
        {step === 'success' && renderSuccess()}
        {step === 'error' && renderError()}
      </div>
    </div>
  );
};

export default SmartAdd;
