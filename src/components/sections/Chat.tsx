import React, { useEffect, useRef, useState } from 'react';
import { map } from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import State from '../../redux/State';
import TextField from '../shared/TextField';

import './Chat.scss';

let url = 'ws://stuffie-server.herokuapp.com';
// let urlDev = 'ws://localhost:8080/';

const Chat = () => {
  const user = useSelector((state: State) => state.user);
  const { t } = useTranslation();
  const messageEl = useRef(null);

  let [messages, setMessages] = useState<any>([]);
  let [newMessage, setNewMessage] = useState('');
  let [disabledButton, setDisabledButton] = useState(true);
  let socket = new WebSocket(url);

  useEffect(() => {
    if (messageEl &&  messageEl.current) {
      (messageEl.current as any).addEventListener('DOMNodeInserted', (event: any) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }

    socket.onopen = () => {
      console.log('Connected to the server');
      setDisabledButton(false);
    };
    socket.onclose = (e) => {
      console.log('Disconnected. Check internet or server.')
      setDisabledButton(true);
    };
    socket.onerror = (e: any) => {
      console.log(e.message);
    };
    socket.onmessage = (e: any) => {
      const message = e.data;
      setMessages((messages: any[]) => [...messages, message]);
    };
  }, [socket.onclose, socket.onerror, socket.onmessage, socket.onopen]);

  const getChatBubble = (userName: string, message: any) => {
    let chatMessage = 'chat__message';
    if (userName === 'Stuffie') {
      return chatMessage + '-stuffie';
    }

    return chatMessage + (user.id === message.id ? '-user' : '-other');
  }

  const showMessages = () => {
    return map(messages, (message, index) => {
      message = JSON.parse(message);
      let text = (typeof message === 'string') ? message : message.text;
      let userName = (typeof message === 'string') ? 'Stuffie' : message.user;
      let row = user.id === message.id ? 'chat__message-row-right' : 'chat__message-row-left'
      return (
        <div className={row} key={index}>
          <div className={getChatBubble(userName, message)}>
            <div className='chat__message-text'>{text}</div>
            <div className='chat__message-name'>{userName}</div>
          </div>
        </div>
      );
    })
  }

  const sendMessage = () => {
    console.log(`send Message ${newMessage}`);
    let message = { id: user.id, user: `${user.first_name} ${user.last_name}`, text: newMessage };
    socket.send(JSON.stringify(message) as string);
    setNewMessage('');
  }

  return (
    <div className="chat">
      <div className='chat__title'>{t('Chat')}</div>
      <div className="chat__messages" ref={messageEl}>
        {showMessages()}
      </div>
      <div className="chat__form">
        <TextField name="id" type="text" onChange={(message: string) => setNewMessage(message)} value={newMessage} />
        <div className="chat__form-right"><Button disabled={disabledButton} onClick={() => sendMessage()} text={"Submit"} /></div>
      </div>
    </div>
  );
};

export default Chat;
