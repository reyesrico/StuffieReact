import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import TextField from '../shared/TextField';

import './Chat.scss';
import { useChatGpt } from '../../hooks/useChatGpt';

const Chat = () => {
  const { conversation, sendMessage, isLoading } = useChatGpt();
  const { t } = useTranslation();
  const messageEl = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const width = window.screen.width <= 900 ? "85%" : "90%";

  // useEffect(() => {
  //   // TBR
  //   if (messageEl && messageEl.current) {
  //     (messageEl.current as any).addEventListener('DOMNodeInserted', (event: any) => {
  //       const { currentTarget: target } = event;
  //       target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
  //     });
  //   }
  // }, [messages]);

  const onSubmit = () => {
    sendMessage(newMessage);
    setNewMessage("");
  }

  return (
    <div className="chat">
      <div className='chat__title'>{t('Chat')}</div>
      <div className="chat__messages" ref={messageEl}>
        {conversation.map((msg, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={`chat__message-${msg.role === 'user' ? 'user' : 'stuffie'}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="chat__form">
        <TextField
          name="id"
          type="text"
          onChange={(e: any) => setNewMessage(e.target.value)}
          value={newMessage}
          containerStyle={{ width }}
        />
        <div className="chat__form-bottom">
          <div className="chat__status">{t('chat.statusLabel')}{isLoading ? t('chat.loading') : t('chat.ready')}</div>
          {!isLoading && <Button onClick={() => onSubmit()} text={t('chat.submit')} />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
