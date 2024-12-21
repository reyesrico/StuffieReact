import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import State from '../../redux/State';
import TextField from '../shared/TextField';

import './Chat.scss';
import { useChatGpt } from '../../services/useChatGpt';

const Chat = () => {
  const user = useSelector((state: State) => state.user);
  const { messages, sendMessage } = useChatGpt();
  const { t } = useTranslation();
  const messageEl = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const width = window.screen.width <= 900 ? "85%" : "90%";

  useEffect(() => {
    // TBR
    if (messageEl && messageEl.current) {
      (messageEl.current as any).addEventListener('DOMNodeInserted', (event: any) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [messages]);

  const getChatBubble = (userName: string, message: any) => {
    let chatMessage = 'chat__message';
    if (userName === 'Stuffie') {
      return chatMessage + '-stuffie';
    }

    return chatMessage + (user.id === message.id ? '-user' : '-other');
  }

  return (
    <div className="chat">
      <div className='chat__title'>{t('Chat')}</div>
      <div className="chat__messages" ref={messageEl}>
        {messages.map((message, index) => (
          <div key={index} className={getChatBubble(user.id?.toString() || "", message)}>
            {message}
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
          {/* <div className="chat__status">Status: {status}</div> */}
          <Button onClick={() => sendMessage(newMessage)} text={"Submit"} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
