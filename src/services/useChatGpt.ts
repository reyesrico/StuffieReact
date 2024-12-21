import React from "react";

import OpenAI from "openai";

export const useChatGpt = () => {
  const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY || '' });
  const [messages, setMessages] = React.useState<string[]>([]);

  const sendMessage = async (text: string) => {
    console.log({env: process.env, key: process.env.REACT_APP_OPENAI_API_KEY});
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: text },
      ],
    });
    setMessages([
      ...messages,
      completion.choices[0].message.content || ""
    ]);
  }

  return {
    messages,
    sendMessage,
  }
}
