import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import DropDown from '../shared/DropDown';
import Loading from '../shared/Loading';
import type Category from '../types/Category';
import type Subcategory from '../types/Subcategory';
import { useTicketScanner } from '../../hooks/useTicketScanner';
import { STEPS_KEYS, toStepIndex } from '../../lib/receiptParser';

import './Tickets.scss';

const Tickets = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    step, previewSrc, ocrStatus, ocrProgress, ocrError, fileInputRef,
    categories, subcategories,
    defaultCategory, defaultSubcategory, setDefaultCategory, setDefaultSubcategory,
    items, selectedItems, readyItems, uncategorizedCount,
    toggleItem, setItemName, setItemCategory, setItemSubcategory,
    handleSelectAll, handleClearAll, applyDefaultToSelected,
    handleFileChange, handleDrop, handleTestReceipt, handleReset,
    showConfirm, setShowConfirm, isAdding, addedCount, handleConfirmAdd,
  } = useTicketScanner();

  const stepLabels = [t('tickets.step1'), t('tickets.step2'), t('tickets.step3')];
  const currentStepIndex = toStepIndex(step);

  return (
    <div className="tickets">

      {/* Header */}
      <div className="tickets__header">
        <div>
          <h2 className="tickets__title">{t('tickets.title')}</h2>
          <p className="tickets__subtitle">{t('tickets.subtitle')}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="tickets__steps" aria-label="Steps">
        {STEPS_KEYS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={[
              'tickets__step',
              i === currentStepIndex ? 'tickets__step--active' : '',
              i < currentStepIndex   ? 'tickets__step--done'   : '',
            ].filter(Boolean).join(' ')}>
              <span className="tickets__step-num">{i < currentStepIndex ? '✓' : i + 1}</span>
              <span className="tickets__step-label">{stepLabels[i]}</span>
            </div>
            {i < STEPS_KEYS.length - 1 && (
              <div className={`tickets__step-bar ${i < currentStepIndex ? 'tickets__step-bar--done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── UPLOAD ── */}
      {step === 'upload' && (
        <div className="tickets__section">
          {ocrError && <div className="tickets__error" role="alert">{ocrError}</div>}

          <div
            className="tickets__drop-zone"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label={t('tickets.dropZoneLabel')}
          >
            <div className="tickets__drop-icon">🧾</div>
            <p className="tickets__drop-title">{t('tickets.dropTitle')}</p>
            <p className="tickets__drop-hint">{t('tickets.dropHint')}</p>
            <span className="tickets__drop-formats">{t('tickets.supportedFormats')}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="tickets__file-input"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>

          <div className="tickets__upload-actions">
            <Button text={t('tickets.tryTestReceipt')} onClick={handleTestReceipt} size="sm" variant="ghost" />
          </div>

          <div className="tickets__help">
            <h4 className="tickets__help-title">{t('tickets.howTitle')}</h4>
            <ol className="tickets__how-list">
              <li>{t('tickets.how1')}</li>
              <li>{t('tickets.how2')}</li>
              <li>{t('tickets.how3')}</li>
              <li>{t('tickets.how4')}</li>
            </ol>
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {step === 'analyzing' && (
        <div className="tickets__section tickets__analyzing">
          {previewSrc && (
            <div className="tickets__preview-wrap">
              <img src={previewSrc} alt={t('tickets.receiptPreviewAlt')} className="tickets__preview" />
              <div className="tickets__preview-fade" />
            </div>
          )}
          <div className="tickets__ocr-status">
            <Loading size="md" />
            <p className="tickets__ocr-text">{ocrStatus}</p>
            <div className="tickets__progress-track">
              <div
                className="tickets__progress-fill"
                style={{ width: `${ocrProgress}%` }}
                role="progressbar"
                aria-valuenow={ocrProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="tickets__progress-pct">{ocrProgress}%</span>
          </div>
        </div>
      )}

      {/* ── REVIEW ── */}
      {step === 'review' && (
        <div className="tickets__section">
          <div className="tickets__review-header">
            <div className="tickets__review-info">
              <h3 className="tickets__review-title">
                {items.length > 0 ? t('tickets.foundItems', { count: items.length }) : t('tickets.noItems')}
              </h3>
              {items.length > 0 && <p className="tickets__review-hint">{t('tickets.reviewHint')}</p>}
            </div>
            {previewSrc && (
              <img src={previewSrc} alt={t('tickets.receiptPreviewAlt')} className="tickets__preview-thumb" />
            )}
          </div>

          {items.length > 0 && (
            <>
              {/* Bulk-apply bar */}
              <div className="tickets__bulk-bar">
                <span className="tickets__bulk-title">{t('tickets.applyToSelected')}</span>
                <div className="tickets__bulk-grid">
                  <label className="tickets__bulk-field-label">{t('tickets.bulkCategory')}</label>
                  <DropDown
                    values={defaultCategory ? [defaultCategory, ...categories.filter(c => c.id !== defaultCategory.id)] : categories}
                    onChange={(c: Category) => setDefaultCategory(c)}
                    size="sm"
                  />
                  <label className="tickets__bulk-field-label">{t('tickets.bulkSubcategory')}</label>
                  <DropDown
                    values={defaultSubcategory ? [defaultSubcategory, ...subcategories.filter(s => s.id !== defaultSubcategory.id)] : subcategories}
                    onChange={(s: Subcategory) => setDefaultSubcategory(s)}
                    size="sm"
                  />
                </div>
                <Button
                  text={t('tickets.applyBtn')}
                  onClick={applyDefaultToSelected}
                  size="sm"
                  variant="primary"
                  disabled={selectedItems.length === 0}
                />
              </div>

              {/* Toolbar */}
              <div className="tickets__toolbar">
                <span className="tickets__toolbar-count">
                  {t('tickets.selectedCount', { count: selectedItems.length, total: items.length })}
                </span>
                <button className="tickets__text-btn" onClick={handleSelectAll}>{t('tickets.selectAll')}</button>
                <button className="tickets__text-btn" onClick={handleClearAll}>{t('tickets.clearAll')}</button>
              </div>

              {/* Item list */}
              <ul className="tickets__items" role="list">
                {items.map(item => (
                  <li key={item.id} className={[
                    'tickets__item',
                    item.selected ? 'tickets__item--selected' : '',
                    item.selected && !item.category ? 'tickets__item--warn' : '',
                  ].filter(Boolean).join(' ')}>
                    <div className="tickets__item-top">
                      <label className="tickets__item-check-wrap">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItem(item.id)}
                          className="tickets__checkbox"
                          aria-label={item.name}
                        />
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => setItemName(item.id, e.target.value)}
                        className="tickets__item-name"
                        aria-label={t('tickets.editName')}
                        disabled={!item.selected}
                      />
                      {item.price !== null && (
                        <span className="tickets__item-price">${item.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="tickets__item-cats">
                      <DropDown
                        key={`cat-${item.id}-${item.category?.id ?? 'none'}`}
                        values={item.category ? [item.category, ...categories.filter(c => c.id !== item.category?.id)] : categories}
                        onChange={(c: Category) => setItemCategory(item.id, c)}
                        size="sm"
                        disabled={!item.selected}
                      />
                      <DropDown
                        key={`sub-${item.id}-${item.subcategory?.id ?? 'none'}`}
                        values={item.subcategory ? [item.subcategory, ...subcategories.filter(s => s.id !== item.subcategory?.id)] : subcategories}
                        onChange={(s: Subcategory) => setItemSubcategory(item.id, s)}
                        size="sm"
                        disabled={!item.selected}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              {uncategorizedCount > 0 && (
                <div className="tickets__uncategorized-warn" role="alert">
                  {t('tickets.uncategorizedWarn', { count: uncategorizedCount })}
                </div>
              )}

              <div className="tickets__review-actions">
                <Button text={t('tickets.scanAnother')} onClick={handleReset} size="sm" variant="outline" />
                <Button
                  text={t('tickets.addSelected', { count: readyItems.length })}
                  onClick={() => setShowConfirm(true)}
                  size="md"
                  disabled={readyItems.length === 0}
                />
              </div>
            </>
          )}

          {items.length === 0 && (
            <div className="tickets__no-items">
              <p className="tickets__no-items-hint">{t('tickets.noItemsHint')}</p>
              <Button text={t('tickets.tryAgain')} onClick={handleReset} variant="outline" size="sm" />
            </div>
          )}
        </div>
      )}

      {/* ── DONE ── */}
      {step === 'done' && (
        <div className="tickets__section tickets__done">
          <div className="tickets__done-icon">
            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="26" cy="26" r="26" fill="#22c55e" />
              <polyline points="14,27 22,35 38,18" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="tickets__done-title">
            {addedCount === 1 ? t('tickets.doneTitleOne') : t('tickets.doneTitleMany', { count: addedCount })}
          </h3>
          <p className="tickets__done-desc">{t('tickets.doneDesc', { count: addedCount })}</p>
          <div className="tickets__done-actions">
            <Button text={t('tickets.goToProducts')} onClick={() => navigate('/products')} size="md" />
            <Button text={t('tickets.scanAnother')} onClick={handleReset} size="md" variant="outline" />
          </div>
        </div>
      )}

      {/* ── CONFIRM MODAL ── */}
      {showConfirm && (
        <div
          className="tickets__modal-overlay"
          onClick={() => !isAdding && setShowConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tickets-confirm-title"
        >
          <div className="tickets__modal" onClick={e => e.stopPropagation()}>
            <h3 id="tickets-confirm-title" className="tickets__modal-title">{t('tickets.confirmTitle')}</h3>
            <p className="tickets__modal-desc">{t('tickets.confirmDesc', { count: readyItems.length })}</p>

            <ul className="tickets__modal-list">
              {readyItems.map(item => (
                <li key={item.id} className="tickets__modal-item">
                  <div className="tickets__modal-item-info">
                    <span className="tickets__modal-item-name">{item.name}</span>
                    <span className="tickets__modal-item-cat">
                      {item.category?.name}{item.subcategory ? ` › ${item.subcategory.name}` : ''}
                    </span>
                  </div>
                  {item.price !== null && (
                    <span className="tickets__modal-item-price">${item.price.toFixed(2)}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="tickets__modal-actions">
              <Button
                text={t('tickets.cancel')}
                onClick={() => setShowConfirm(false)}
                variant="outline"
                size="md"
                disabled={isAdding}
              />
              <Button
                text={isAdding ? t('tickets.adding') : t('tickets.confirm')}
                onClick={handleConfirmAdd}
                size="md"
                disabled={isAdding}
              />
            </div>
            {isAdding && <div className="tickets__modal-loading"><Loading size="sm" /></div>}
          </div>
        </div>
      )}

    </div>
  );
};

export default Tickets;
