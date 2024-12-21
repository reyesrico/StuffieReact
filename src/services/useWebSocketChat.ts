import React, { useEffect, useRef, useState } from "react";
import User from "../components/types/User";

export type Status = "Connected" | "Disconnected" | "Error" | "Sending" | "Receiving" | "Wait";

export const useWebSocketChat = ({ dev } : { dev: boolean }) => {
  // https://stackoverflow.com/questions/60152922/proper-way-of-using-react-hooks-websockets
  const socket: any = useRef(null);
	const url = dev ? 'ws://localhost:8080/' : 'wss://stuffie-server.herokuapp.com';

  let [messages, setMessages] = useState<any>([]);
  let [status, setStatus] = useState<Status>("Wait");

  useEffect(() => {
    socket.current = new WebSocket(url);

    socket.current.onopen = () => {
      setStatus("Connected");
    };

    socket.current.onclose = () => {
			setStatus("Disconnected");
    };

    socket.current.onerror = (e: any) => {
      console.log(`Error: ${e.message}`);
			setStatus("Error");
    };

    const wsCurrent = socket.current;

    return () => {
      console.log('Unmounting...');
      wsCurrent.close();
    };
  }, []);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.onmessage = (e: any) => {
      setStatus("Receiving");
      const message = e.data;
      setMessages((messages: any[]) => [...messages, message]);
    };
  }, []);

  const sendMessage = (user: User, messageText: string) => {
    if (socket.current.readyState === WebSocket.OPEN) {
      let message = { id: user.id, user: `${user.first_name} ${user.last_name}`, text: messageText };
      socket.current.send(JSON.stringify(message) as string);
			setStatus("Sending");
    } else {
			setStatus("Wait");
      console.log(`Wait: ${socket.readyState} / ${socket.CONNECTING}`);
    }
  }

  return {
    messages,
    sendMessage,
		status
  }

};
