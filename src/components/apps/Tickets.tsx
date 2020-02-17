import React, { Component } from 'react';
import Tesseract from 'tesseract.js';
import TicketsState from './types';

class Tickets extends Component<any, TicketsState> {
  state = {
    file: '',
    progressValue: 0
  }

  handleChange(event: any) {
    if (event && event.target && event.target.files) {
      const file = event.target.files[0] as File;
      this.setState({ file });
    }
  }

  handleSubmit(event: any) {
    event.stopPropagation();
    event.preventDefault();

    Tesseract.recognize(this.state.file, 'eng')
      .progress(this.progressUpdate)
      .then(this.result)
  }

  result(res: any) {
    var log = document.getElementById('info') as HTMLElement;
    var result = document.getElementById('result') as HTMLElement;

    log.innerHTML = 'Finished!';
    result.innerHTML = res ? res.text : '';
  }

  progressUpdate(packet: any) {
    if ('progress' in packet) {
      var progress = document.querySelector('progress') as any;
      progress.value = packet.progress;
      progress.max = 1;
      (document.getElementById("info") as HTMLElement).innerHTML = `Analyzing file...`;
    }
  }

  render() {
    return (
      <div className="tickets">
        <h3>Tickets</h3>
        <div className="ticketsForm">
          <form onSubmit={event => this.handleSubmit(event)}>
            <input type='file' id='fileId' name='fileName'
              onChange={event => this.handleChange(event)} />
            <hr />
            <input type="submit" value="Analyze" disabled={!this.state.file} />
          </form>
        </div>
        <hr />
        <div id="status" className="ticketsStatus">
          <progress value={this.state.progressValue} max="100"></progress>
          <span id="statusInfo" className="statusInfo">
            Status: <span id="info" />
          </span>
        </div>
        <hr />
        <div id="result"></div>
      </div>
    );
  }
}

export default Tickets;
