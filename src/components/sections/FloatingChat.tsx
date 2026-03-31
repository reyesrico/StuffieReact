import React, { useContext, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UserContext from '../../context/UserContext';
import { useProducts, useCategories } from '../../hooks/queries';
import { useChatGpt, CHAT_MODELS, DEFAULT_MODEL_ID } from '../../hooks/useChatGpt';

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

const FloatingChat = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  const { data: products = {} } = useProducts();
  const { data: categories = [] } = useCategories();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="floating-chat">
      {isOpen && (
        <div className="floating-chat__panel">
          {/* Header */}
          <div className="floating-chat__header">
            <div className="floating-chat__header-info">
              <span className="floating-chat__header-icon" aria-hidden="true">🤖</span>
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
              ✕
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
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger bubble */}
      <button
        className={`floating-chat__trigger${isOpen ? ' floating-chat__trigger--open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={t('chat.openAssistant')}
        title={t('chat.openAssistant')}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default FloatingChat;
