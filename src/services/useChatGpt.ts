import React from "react";

import OpenAI from "openai";

export const useChatGpt = () => {
  const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY || '', dangerouslyAllowBrowser: true });
  const [messages, setMessages] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const sendMessage = async (text: string) => {
    setIsLoading(true);
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
    setIsLoading(false);
  }

  return {
    messages,
    sendMessage,
    isLoading,
  }
}
