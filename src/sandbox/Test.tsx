import React from 'react';

import Button from '../components/shared/Button';

const Test = () => {
  const [t, setT] = React.useState('');

  const sendInfo2 = async () => {
    const p: Promise<string> = new Promise((resolve) => setTimeout(() => resolve('done'), 1000));
    const a = await p;
    setT(a);
  };

  return (
    <div>
      <h1>Test</h1>
      <span>{t}</span>
      <hr />
      <Button text="Click me" onClick={() => sendInfo2()} />
    </div>
  );
};

export default Test;
