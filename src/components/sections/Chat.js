import React, { Component } from 'react';

class Chat extends Component {

  state = {
    messageList: []
  };
 
  onMessageWasSent(message) {
    this.setState({
      messageList: [...this.state.messageList, message]
    })
  }
 
  sendMessage(text) {
    if (text.length > 0) {
      this.setState({
        messageList: [...this.state.messageList, {
          author: 'them',
          type: 'text',
          data: { text }
        }]
      })
    }
  }

  render() {
    return (
      <div>Get new Chat-Window</div>
    )
  }
};

export default Chat;
