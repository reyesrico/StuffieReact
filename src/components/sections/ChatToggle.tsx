import React from 'react';
import { useTranslation } from 'react-i18next';

import './ChatToggle.scss';

export const CHAT_VISIBLE_KEY = 'stuffie_chat_visible';

export function useChatVisible() {
  const stored = localStorage.getItem(CHAT_VISIBLE_KEY);
  const [visible, setVisible] = React.useState<boolean>(stored !== 'false');

  const toggle = () => {
    const next = !visible;
    localStorage.setItem(CHAT_VISIBLE_KEY, String(next));
    setVisible(next);
    // Dispatch a storage event so Main.tsx (same tab) can react
    window.dispatchEvent(new StorageEvent('storage', { key: CHAT_VISIBLE_KEY, newValue: String(next) }));
  };

  return { visible, toggle };
}

const ChatToggle = () => {
  const { t } = useTranslation();
  const { visible, toggle } = useChatVisible();

  return (
    <button
      type="button"
      className="chat-toggle"
      onClick={toggle}
      aria-pressed={visible}
    >
      <span className="chat-toggle__icon">💬</span>
      <span className="chat-toggle__label">{t('settings.chatLabel')}</span>
      <span className={`chat-toggle__pill${visible ? ' chat-toggle__pill--on' : ''}`}>
        {visible ? t('settings.chatOn') : t('settings.chatOff')}
      </span>
    </button>
  );
};

export default ChatToggle;
