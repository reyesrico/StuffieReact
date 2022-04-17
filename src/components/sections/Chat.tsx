import React, { useEffect, useState } from 'react';
import Button from '../shared/Button';
import TextField from '../shared/TextField';
import { map } from 'lodash';
import './Chat.scss';

const Chat = () => {
  let [messages, setMessages] = useState<any>([]);
  let [newMessage, setNewMessage] = useState('');
  let [disabledButton, setDisabledButton] = useState(true);
  let socket = new WebSocket('ws://localhost:8080/');

  useEffect(() => {
    console.log('entereing useEffect');
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
      const m = e.data;
      console.log({messages});
      let ms = [...messages, m];
      console.log({ms});
      setMessages(ms);
    };
  }, []);

  const showMessages = () => {
    console.log('showing messages');
    return map(messages, (message, index) => {
      return (
        <div key={index}>{message}</div>
      );
    })
  }

  const sendMessage = () => {
    console.log(`send Message ${newMessage}`);
    console.log(`${typeof newMessage}`);
    socket.send(newMessage as string);
    setNewMessage('');
  }

  return (
    <div className="chat">
      {showMessages()}
      <div className="chat__">
        <TextField name="id" type="text" onChange={(message: string) => setNewMessage(message)} value={newMessage}/>
        <Button disabled={disabledButton} onClick={() => sendMessage()} text={"Submit"} />
      </div>
    </div>
  );
};

export default Chat;
