import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chat20Regular } from '@fluentui/react-icons';

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
      className="settings__row"
      onClick={toggle}
      aria-pressed={visible}
    >
      <span className="settings__row-icon"><Chat20Regular /></span>
      <span className="settings__row-label">{t('settings.chatLabel')}</span>
      <span className={`settings__row-badge${visible ? ' settings__row-badge--on' : ''}`}>
        {visible ? t('settings.chatOn') : t('settings.chatOff')}
      </span>
    </button>
  );
};

export default ChatToggle;
