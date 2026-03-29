import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { useTranslation } from 'react-i18next';

import Button from '../shared/Button';
import './Tickets.scss';

const Tickets = () => {
  const progressValue = 0;
  const [ file, setFile ] = useState<File>();
  const [imageUrl] = useState<string>("https://i0.wp.com/i.redd.it/a7hqgjbxn0v21.jpg");
  const [caption, setCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useTranslation();

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
      Tesseract.recognize(file, 'eng', {})
        .then(result);
    }
  }

  const result = (res: any) => {
    const log = document.getElementById('info') as HTMLElement;
    const resultEl = document.getElementById('result') as HTMLElement;

    log.innerHTML = 'Finished!';
    resultEl.innerHTML = res ? res.text : '';
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
      // TODO: Handle the response data
      const info = action === 'generate-caption' ? data.caption : data.message;
      setCaption(info);
    })
    .catch(() => {})
    .finally(() => setIsLoading(false));
  }


  const generateCaption = () => {
    // Testing variables
    const useLocal = true;
    const method = 'POST'; // 'GET' or 'POST'
    const action = 'generate-caption'; // 'test' or 'test-post' or 'generate-caption'

    const url = useLocal ? 'http://localhost:8000' : 'https://stuffie-api-server-sg9r.onrender.com';
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
      <div className="tickets__header">
        <h2 className="tickets__title">{t('apps.tickets')}</h2>
      </div>
      <div className="tickets__section">
        <div className="tickets__form">
          <form onSubmit={event => handleSubmit(event)}>
            <input type='file' id='fileId' name='fileName'
              onChange={event => handleChange(event)} />
            <hr />
            <input type="submit" value="Analyze" disabled={!file} />
          </form>
        </div>
        <div className="tickets__status">
          <progress value={progressValue} max="100" />
          <span id="statusInfo">Status: <span id="info" /></span>
        </div>
        <div id="result" className="tickets__result" />
      </div>
      <div className="tickets__ai-section">
        <Button onClick={generateCaption} text="Generate Caption" />
        {isLoading && <div>{t('chat.loading')}</div>}
        {caption && <div className="tickets__result">{caption}</div>}
      </div>
    </div>
  );
}

export default Tickets;
