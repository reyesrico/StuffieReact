import React from 'react';
import './Chat.scss';

const Chat = () => {
  // let [ messageList, setMessageList ] = useState<any>([]);

  /*
  const onMessageWasSent = (message: any) => {
    let mList = [...messageList, message];
    setMessageList(mList);
  }

  const sendMessage = (text: string) => {
    if (text.length > 0) {
      let message = {
        author: 'them',
        type: 'text',
        data: { text }
      };
      let mList = [...messageList, message];
      setMessageList(mList);
    }
  }
  */

  return (<div className="chat">Get new Chat-Window</div>);
};

export default Chat;
