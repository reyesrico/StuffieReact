import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

import Button from '../shared/Button';

const Tickets = () => {
  let progressValue = 0;
  let [ file, setFile ] = useState<File>();
  const [imageUrl, setImageUrl] = useState<string>("https://i0.wp.com/i.redd.it/a7hqgjbxn0v21.jpg");
  const [caption, setCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      Tesseract.recognize(file, 'eng', { logger: m => console.log(m) })
        .then(result);
    }
  }

  const result = (res: any) => {
    var log = document.getElementById('info') as HTMLElement;
    var result = document.getElementById('result') as HTMLElement;

    log.innerHTML = 'Finished!';
    result.innerHTML = res ? res.text : '';
  }

  /*
  // Used to be Tessearact.recognize().progress(progressUpdate).then()
  const progressUpdate = (packet: any) => {
    if ('progress' in packet) {
      var progress = document.querySelector('progress') as any;
      progress.value = packet.progress;
      progress.max = 1;
      (document.getElementById("info") as HTMLElement).innerHTML = `Analyzing file...`;
    }
  }
  */

  const testFetch = (method: string, action: string, url: string, headers: any, payload: any) => {
    fetch(`${url}/${action}`, {
      method,
      headers,
      body: method === "POST" ? JSON.stringify(payload) : null,
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);

      // TODO: Handle the response data
      const info = action === 'generate-caption' ? data.caption : data.message;
      setCaption(info);
    })
    .catch(err => console.log(err))
    .finally(() => setIsLoading(false));
  }


  const generateCaption = () => {
    // Testing variables
    const useLocal = true;
    const method = 'POST'; // 'GET' or 'POST'
    const action = 'generate-caption'; // 'test' or 'test-post' or 'generate-caption'

    const url = useLocal ? 'http://localhost:8000' : 'https://stuffie-api-server-sg9r.onrender.com';
    console.log({ url });
    const payload = {
      url: imageUrl,
    };
    const headers = {
      'Content-Type': 'application/json',
    };

    setIsLoading(true);
    testFetch(method, action, url, headers, payload);
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
      <hr />
      <div>Trying with stuffie-api-server</div>
      <div>
        <Button onClick={generateCaption} text="GenerateCaption"></Button>
        <hr />
        {isLoading && <div>Loading...</div>}
        {caption && <div>{caption}</div>}
      </div>
    </div>
  );
}

export default Tickets;
