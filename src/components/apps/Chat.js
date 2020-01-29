import React, { Component } from 'react';
import { Launcher } from 'react-chat-window';

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
      <Launcher
        agentProfile={{
          teamName: 'react-chat-window',
          imageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png'
        }}
        onMessageWasSent={this.onMessageWasSent.bind(this)}
        messageList={this.state.messageList}
        showEmoji
      />
    )
  }
};

export default Chat;
