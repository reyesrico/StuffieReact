import React, { useContext, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UserContext from '../../context/UserContext';
import { useProducts, useCategories } from '../../hooks/queries';
import { useChatGpt, CHAT_MODELS, DEFAULT_MODEL_ID } from '../../hooks/useChatGpt';
import { Bot20Regular, Send20Regular, Dismiss20Regular, Chat20Regular } from '@fluentui/react-icons';

import './FloatingChat.scss';

/**
 * Render assistant message content with minimal structured formatting:
 *   Lines starting with `- ` → bullet list
 *   Lines starting with `> ` → breadcrumb path badge
 *   Otherwise → plain paragraph
 */
const renderMessage = (content: string): React.ReactNode => {
  const lines = content.split('\n').filter(l => l.trim() !== '');

  const isBullet = (l: string) => l.startsWith('- ');
  const isPath   = (l: string) => l.startsWith('> ');

  // Mixed-content: render line by line
  const nodes: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`}>
        {bulletBuffer.map((l, i) => <li key={i}>{l.slice(2)}</li>)}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((line, idx) => {
    if (isBullet(line)) {
      bulletBuffer.push(line);
    } else {
      flushBullets();
      if (isPath(line)) {
        nodes.push(
          <span key={idx} className="floating-chat__path">{line.slice(2)}</span>
        );
      } else {
        nodes.push(<p key={idx}>{line}</p>);
      }
    }
  });
  flushBullets();

  return <>{nodes}</>;
};

// Build a readable product summary to inject as AI context
const buildProductsContext = (products: Record<number, any[]>, categories: any[]): string => {
  const lines: string[] = [];
  categories.forEach(cat => {
    const catProducts = products[cat.id] || [];
    catProducts.forEach((p: any) => {
      const desc = p.description ? `: ${p.description}` : '';
      lines.push(`- ${p.name}${desc} [Category: ${cat.name}]`);
    });
  });
  return lines.length > 0 ? lines.join('\n') : 'No products added yet.';
};

const SNAP_MARGIN = 16; // px from screen edge
const BUBBLE_SIZE = 56;

const FloatingChat = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const { data: products = {} } = useProducts();
  const { data: categories = [] } = useCategories();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Snap-to-edge drag state ─────────────────────────────────────────────────
  const [snapSide, setSnapSide] = useState<'left' | 'right'>('right');
  const [snapY, setSnapY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragXY, setDragXY] = useState({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const suppressNextClick = useRef(false);

  const handleTriggerPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleTriggerPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (!dragMoved.current && Math.sqrt(dx * dx + dy * dy) > 8) {
      dragMoved.current = true;
      setIsDragging(true);
    }
    if (dragMoved.current) {
      setDragXY({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTriggerPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragMoved.current) {
      suppressNextClick.current = true;
      const newSide: 'left' | 'right' = e.clientX < window.innerWidth / 2 ? 'left' : 'right';
      const clampedY = Math.max(
        SNAP_MARGIN,
        Math.min(window.innerHeight - BUBBLE_SIZE - SNAP_MARGIN, e.clientY - BUBBLE_SIZE / 2)
      );
      setSnapSide(newSide);
      setSnapY(clampedY);
      setIsDragging(false);
      dragMoved.current = false;
    }
  };

  const handleTriggerClick = () => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      return;
    }
    setIsOpen(prev => !prev);
  };

  const floatingStyle: React.CSSProperties = isDragging
    ? { left: dragXY.x - BUBBLE_SIZE / 2, top: dragXY.y - BUBBLE_SIZE / 2, right: 'auto', bottom: 'auto', transition: 'none' }
    : snapY !== null
      ? { [snapSide === 'left' ? 'left' : 'right']: SNAP_MARGIN, [snapSide === 'left' ? 'right' : 'left']: 'auto', top: snapY, bottom: 'auto' }
      : {};

  const productsContext = React.useMemo(
    () => buildProductsContext(products as Record<number, any[]>, categories as any[]),
    [products, categories]
  );

  const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';

  const {
    conversation,
    sendMessage,
    isLoading,
    tokensRemaining,
    isLimitReached,
    dailyLimit,
    totalUsers,
  } = useChatGpt({
    userId: user?.id,
    userName,
    productsContext,
    modelId: selectedModelId,
  });

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, isOpen]);

  const handleSubmit = () => {
    if (!inputValue.trim() || isLoading || isLimitReached) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      className={`floating-chat${snapSide === 'left' ? ' floating-chat--left' : ''}`}
      style={floatingStyle}
    >
      {isOpen && (
        <div className="floating-chat__panel">
          {/* Header */}
          <div className="floating-chat__header">
            <div className="floating-chat__header-info">
              <span className="floating-chat__header-icon" aria-hidden="true"><Bot20Regular /></span>
              <div>
                <div className="floating-chat__title">{t('chat.title')}</div>
                <div className="floating-chat__subtitle">{t('chat.subtitle')}</div>
              </div>
            </div>
            <button
              className="floating-chat__close"
              onClick={() => setIsOpen(false)}
              aria-label={t('chat.close')}
            >
              <Dismiss20Regular />
            </button>
          </div>

          {/* Messages */}
          <div className="floating-chat__messages">
            {conversation.length === 0 && (
              <div className="floating-chat__welcome">
                {t('chat.welcome', { name: user?.first_name || 'there' })}
              </div>
            )}
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`floating-chat__bubble floating-chat__bubble--${msg.role}`}
              >
                {msg.role === 'assistant' ? renderMessage(msg.content) : msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="floating-chat__bubble floating-chat__bubble--assistant floating-chat__bubble--typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="floating-chat__footer">
            <div className={`floating-chat__limit${isLimitReached ? ' floating-chat__limit--exceeded' : ''}`}>
              {isLimitReached
                ? t('chat.limitReached')
                : t('chat.charsRemaining', { chars: tokensRemaining, limit: dailyLimit, users: totalUsers })}
            </div>
            <div className="floating-chat__input-row">
              <input
                className="floating-chat__input"
                type="text"
                placeholder={isLimitReached ? t('chat.limitPlaceholder') : t('chat.placeholder')}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLimitReached || isLoading}
                aria-label={t('chat.placeholder')}
              />
              <button
                className="floating-chat__send"
                onClick={handleSubmit}
                disabled={isLimitReached || isLoading || !inputValue.trim()}
                aria-label={t('chat.send')}
              >
                <Send20Regular />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger bubble */}
      <button
        className={`floating-chat__trigger${isOpen ? ' floating-chat__trigger--open' : ''}`}
        onClick={handleTriggerClick}
        onPointerDown={handleTriggerPointerDown}
        onPointerMove={handleTriggerPointerMove}
        onPointerUp={handleTriggerPointerUp}
        aria-label={t('chat.openAssistant')}
        title={t('chat.openAssistant')}
      >
        {isOpen ? <Dismiss20Regular /> : <Chat20Regular />}
      </button>
    </div>
  );
};

export default FloatingChat;
