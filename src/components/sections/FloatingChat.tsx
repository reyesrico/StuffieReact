import React, { useContext, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UserContext from '../../context/UserContext';
import { useProducts, useCategories, useFriendsWithProducts } from '../../hooks/queries';
import { useChatGpt, DEFAULT_MODEL_ID } from '../../hooks/useChatGpt';
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
        {bulletBuffer.map((l, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`bullet-${i}`}>{l.slice(2)}</li>
        ))}
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
          // eslint-disable-next-line react/no-array-index-key
          <span key={idx} className="floating-chat__path">{line.slice(2)}</span>
        );
      } else {
        nodes.push(// eslint-disable-next-line react/no-array-index-key
        <p key={idx}>{line}</p>);
      }
    }
  });
  flushBullets();

  return <>{nodes}</>;
};

// Build a readable product summary (current user) — includes price for sell/trade context
const buildProductsContext = (products: Record<number, any[]>, categories: any[]): string => {
  const lines: string[] = [];
  categories.forEach(cat => {
    const catProducts = products[cat.id] || [];
    catProducts.forEach((p: any) => {
      const price = p.cost > 0 ? ` [$${p.cost}]` : '';
      lines.push(`- ${p.name}${price} [Category: ${cat.name}]`);
    });
  });
  return lines.length > 0 ? lines.join('\n') : 'No products added yet.';
};

// Build a readable summary of all friends' products for the AI
const buildFriendsContext = (friendsWithProducts: any[]): string => {
  if (!friendsWithProducts?.length) return 'No friends yet.';
  const lines: string[] = [];
  friendsWithProducts.forEach(friend => {
    if (!friend.products?.length) return;
    const name = `${friend.first_name || ''} ${friend.last_name || ''}`.trim();
    lines.push(`${name}:`);
    friend.products.forEach((p: any) => {
      const price = p.cost > 0 ? `$${p.cost}` : 'not for sale';
      lines.push(`  - ${p.name} [${price}]`);
    });
  });
  return lines.length > 0 ? lines.join('\n') : 'Friends have no products yet.';
};

const SNAP_MARGIN = 16; // px from screen edge
const BUBBLE_SIZE = 56;

const FloatingChat = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const { data: products = {} } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: friendsWithProducts = [] } = useFriendsWithProducts();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedModelId] = useState(DEFAULT_MODEL_ID);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Snap-to-edge drag state ─────────────────────────────────────────────────
  const [snapSide, setSnapSide] = useState<'left' | 'right'>('right');
  const [snapY, setSnapY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragXY, setDragXY] = useState({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const dragReady = useRef(false); // becomes true after hold-delay (200ms)
  const dragStart = useRef({ x: 0, y: 0 });
  const dragHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextClick = useRef(false);

  const handleTriggerPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isOpen) return;
    dragMoved.current = false;
    dragReady.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    // Only unlock drag after the user has held the button for 200ms
    dragHoldTimer.current = setTimeout(() => {
      dragReady.current = true;
    }, 200);
  };

  const handleTriggerPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isOpen || !dragReady.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (!dragMoved.current && Math.sqrt(dx * dx + dy * dy) > 12) {
      dragMoved.current = true;
      setIsDragging(true);
    }
    if (dragMoved.current) {
      setDragXY({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTriggerPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragHoldTimer.current) {
      clearTimeout(dragHoldTimer.current);
      dragHoldTimer.current = null;
    }
    dragReady.current = false;
    if (isOpen) return;
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

  const friendsContext = React.useMemo(
    () => buildFriendsContext(friendsWithProducts as any[]),
    [friendsWithProducts]
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
    clearConversation,
    isStuck,
    supportEmailUrl,
  } = useChatGpt({
    userId: user?.id,
    userName,
    userEmail: user?.email,
    productsContext,
    friendsContext,
    modelId: selectedModelId,
  });

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, isOpen]);

  // Clean up hold timer on unmount
  useEffect(() => {
    return () => {
      if (dragHoldTimer.current) clearTimeout(dragHoldTimer.current);
    };
  }, []);

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
              // eslint-disable-next-line react/no-array-index-key
              <div key={`${msg.role}-${idx}`}
                className={`floating-chat__bubble floating-chat__bubble--${msg.role}${
                  isLoading && msg.role === 'assistant' && idx === conversation.length - 1
                    ? ' floating-chat__bubble--streaming'
                    : ''
                }`}
              >
                {msg.role === 'assistant' ? renderMessage(msg.content) : msg.content}
              </div>
            ))}
            {/* Typing dots: only while waiting for the first token (empty placeholder) */}
            {isLoading && conversation[conversation.length - 1]?.role !== 'assistant' && (
              <div className="floating-chat__bubble floating-chat__bubble--assistant floating-chat__bubble--typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Stuck banner — shown when user asks the same question 3+ times */}
          {isStuck && (
            <div className="floating-chat__stuck-banner">
              <p className="floating-chat__stuck-text">
                {t('chat.stuckMessage')}
              </p>
              <div className="floating-chat__stuck-actions">
                <a
                  href={supportEmailUrl}
                  className="floating-chat__stuck-email"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('chat.stuckEmail')}
                </a>
                <button
                  className="floating-chat__stuck-clear"
                  onClick={clearConversation}
                >
                  {t('chat.clearChat')}
                </button>
              </div>
            </div>
          )}

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
        className={`floating-chat__trigger${isOpen ? ' floating-chat__trigger--open' : ''}${isDragging ? ' floating-chat__trigger--dragging' : ''}`}
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
