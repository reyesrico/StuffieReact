import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const Tickets = () => {
  let progressValue = 0;
  let [ file, setFile ] = useState<File>();

  const handleChange = (event: any) => {
    if (event && event.target && event.target.files) {
      const fileT = event.target.files[0] as File;
      setFile(fileT);
    }
  }

  const handleSubmit = (event: any) => {
    event.stopPropagation();
    event.preventDefault();

    if (file) {
      Tesseract.recognize(file, 'eng')
        .progress(progressUpdate)
        .then(result);
    }
  }

  const result = (res: any) => {
    var log = document.getElementById('info') as HTMLElement;
    var result = document.getElementById('result') as HTMLElement;

    log.innerHTML = 'Finished!';
    result.innerHTML = res ? res.text : '';
  }

  const progressUpdate = (packet: any) => {
    if ('progress' in packet) {
      var progress = document.querySelector('progress') as any;
      progress.value = packet.progress;
      progress.max = 1;
      (document.getElementById("info") as HTMLElement).innerHTML = `Analyzing file...`;
    }
  }

  return (
    <div className="tickets">
      <h3>Tickets</h3>
      <div className="ticketsForm">
        <form onSubmit={event => handleSubmit(event)}>
          <input type='file' id='fileId' name='fileName'
            onChange={event => handleChange(event)} />
          <hr />
          <input type="submit" value="Analyze" disabled={!file} />
        </form>
      </div>
      <hr />
      <div id="status" className="ticketsStatus">
        <progress value={progressValue} max="100"></progress>
        <span id="statusInfo" className="statusInfo">
          Status: <span id="info" />
        </span>
      </div>
      <hr />
      <div id="result"></div>
    </div>
  );
}

export default Tickets;
