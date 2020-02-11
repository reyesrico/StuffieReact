import React, { Component } from 'react';
import Tesseract from 'tesseract.js';
import TicketsState from './types';

class Tickets extends Component<any, TicketsState> {
  state = {
    fileName: '',
    progressValue: 0,
    textFromImage: ''
  }

  handleChange(event: any) {
    console.log(event);
    if (event && event.target && event.target.files) {
      const file = event.target.files[0] as File;
      this.setState({ fileName: file.name });
    }
  }

  handleSubmit(event: any) {
    event.stopPropagation();
    event.preventDefault();

    Tesseract.recognize(this.state.fileName, 'eng')
      .progress(this.progressUpdate)
      .then(this.result)
  }

  result(res: any) {
    console.log('result was:', res)
    this.progressUpdate({ status: 'done', data: res });
  }


  progressUpdate(packet: any) {
    console.log('entra');
    console.log(packet);
    var log = document.getElementById('log') as HTMLElement;
    var line = document.createElement('div') as HTMLElement;
    // var statusInfo = document.getElementById('statusInfo');
    var span = document.getElementById('info') as HTMLElement;

    if ('progress' in packet) {
      console.log('progress');
      var progress = document.querySelector('progress') as any;
      progress.value = packet.progress;
      progress.max = 1;
      span.innerHTML = `Analyzing file: ${this.state.fileName}...`;
    }


    if (packet.status === 'done') {
      if (line.hasChildNodes()) {
        line.removeChild(line.firstChild as Node);
      }
      var pre = document.createElement('pre');
      this.setState({ textFromImage: packet.data.text });

      pre.appendChild(document.createTextNode(packet.data.text));
      line.innerHTML = '';
      line.appendChild(pre);

      span.innerHTML = 'Finished!'
    }

    log.insertBefore(line, log.firstChild);
  }

  render() {
    return (
      <div className="tickets">
        <h1>Tickets</h1>
        <div className="ticketsForm">
          <form onSubmit={event => this.handleSubmit(event)}>
            <input
              type='file'
              id='fileId'
              name='fileName'
              onChange={event => this.handleChange(event)} />
            <hr />
            <input type="submit" value="Analyze" disabled={!this.state.fileName} accept=".jpg, .jpeg, .png" />
          </form>
        </div>
        <hr />
        <div id="status" className="ticketsStatus">
          <progress value={this.state.progressValue} max="100"></progress>
          <div id="statusInfo" className="statusInfo">
            Status: <span id="info" />
          </div>
          <div id="log" />
        </div>
      </div>
    );
  }
}

export default Tickets;
