import React, { useEffect, useRef, useState } from 'react';
import { map } from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import State from '../../redux/State';
import TextField from '../shared/TextField';

import './Chat.scss';

let url = 'wss://stuffie-server.herokuapp.com';
// let urlDev = 'ws://localhost:8080/';

const Chat = () => {
  const user = useSelector((state: State) => state.user);
  const { t } = useTranslation();
  const messageEl = useRef(null);

  let [messages, setMessages] = useState<any>([]);
  let [newMessage, setNewMessage] = useState('');
  let [disabledButton, setDisabledButton] = useState(true);
  let [status, setStatus] = useState('');

  // https://stackoverflow.com/questions/60152922/proper-way-of-using-react-hooks-websockets
  const socket: any = useRef(null);

  useEffect(() => {
    if (messageEl && messageEl.current) {
      (messageEl.current as any).addEventListener('DOMNodeInserted', (event: any) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
  });

  useEffect(() => {
    socket.current = new WebSocket(url);

    socket.current.onopen = () => {
      console.log('Connected to the server');
      setStatus('Connected to the server');
      setDisabledButton(false);
    };

    socket.current.onclose = () => {
      console.log('Disconnected. Check internet or server.');
      setStatus('Disconnected. Check internet and refresh page.');
      setDisabledButton(true);
    };

    socket.current.onerror = (e: any) => {
      console.log(e.message);
      setStatus(`Error: ${e.message}`);
    };

    const wsCurrent = socket.current;

    return () => {
      console.log('Unmounting...');
      wsCurrent.close();
    };
  }, []);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.onmessage = (e: any) => {
      console.log('Receiving message');
      setStatus('Receiving message');
      setDisabledButton(false);
      const message = e.data;
      setMessages((messages: any[]) => [...messages, message]);
    };
  }, []);

  const handleKeypress = (e: any) => {
    if (!disabledButton && e.key === 'Enter') {
      sendMessage();
    }
  }

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
            {user.id !== message.id && <div className='chat__message-name'>{userName}</div>}
          </div>
        </div>
      );
    })
  }

  const sendMessage = () => {
    console.log(`Sending Message ${newMessage}`);
    if (socket.current.readyState === WebSocket.OPEN) {
      let message = { id: user.id, user: `${user.first_name} ${user.last_name}`, text: newMessage };
      socket.current.send(JSON.stringify(message) as string);
      setStatus('Sending Message');
      setDisabledButton(true);
      setNewMessage('');
    } else {
      setStatus(`Wait: ${socket.readyState} / ${socket.CONNECTING}`);
    }
  }

  return (
    <div className="chat">
      <div className='chat__title'>{t('Chat')}</div>
      <div className="chat__messages" ref={messageEl}>
        {showMessages()}
      </div>
      <div className="chat__form">
        <TextField name="id" type="text" onChange={(e: any) => setNewMessage(e.target.value)} value={newMessage} onKeyPress={handleKeypress} />
        <div className="chat__form-bottom">
          <div className="chat__status">Status: {status}</div>
          <Button disabled={disabledButton} onClick={() => sendMessage()} text={"Submit"} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
