import React, { Component } from 'react';
import Tesseract from 'tesseract.js';

class Tickets extends Component {
    state = {
      fileName: null,
      progressValue: 0,
      textFromImage: ''
    }

  handleChange(event) {
    this.setState({ fileName: event.target.files[0] });
  }

  handleSubmit(event) {
    event.stopPropagation();
    event.preventDefault();

    Tesseract.recognize(this.state.fileName, 'eng')
      .progress(this.progressUpdate)
      .then(this.result)
  }

  result(res) {
    console.log('result was:', res)
    this.progressUpdate({ status: 'done', data: res });
  }


  progressUpdate(packet) {
    var log = document.getElementById('log');
    var line = document.createElement('div');
    // var statusInfo = document.getElementById('statusInfo');
    var span = document.getElementById('info');

    if ('progress' in packet) {
      var progress = document.querySelector('progress');
      progress.value = packet.progress;
      progress.max = 1;
      span.innerHTML = `Analyzing file: ${this.state.fileName.name}...`;
    }


    if (packet.status === 'done') {
      if (line.hasChildNodes()) {
        line.removeChild(line.firstChild);
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
          <form onSubmit={this.handleSubmit}>
            <input
              type='file'
              id='fileId'
              name='fileName'
              onChange={this.handleChange} />
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
