import React from 'react';

import Button from '../shared/Button';
import OpenAI from "openai";

import { useTest } from '../../services/useTest';

const Test = () => {
  const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY || '', dangerouslyAllowBrowser: true });
  const [message, setMessage] = React.useState('');
  const [t, setT] = React.useState('');
  const { getStuff, reverseStuff, dom, orderArray, debug } = useTest();

  const sendInfo = async () => {
    console.log({env: process.env, key: process.env.REACT_APP_OPENAI_API_KEY});
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
              role: "user",
              content: "Write a haiku about recursion in programming.",
          },
      ],
    });
    setMessage(completion.choices[0].message.content || '');
    console.log(completion.choices[0].message.content);
  }

  const sendInfo2 = async () => {
    const p: Promise<string> = new Promise((resolve) => setTimeout(() => resolve('done'), 1000));
    const a = await p;
    setT(a);
    console.log(a);
  };

  return (
    <div>
      <h1>Test</h1>
      <span>{t}</span>
      <hr />
      <Button text="Click me" onClick={() => sendInfo2()} />
    </div>
  );
}

export default Test;
