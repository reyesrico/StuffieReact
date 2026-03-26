import { useEffect, useRef, useState } from "react";
import User from "../components/types/User";

export type Status = "Connected" | "Disconnected" | "Error" | "Sending" | "Receiving" | "Wait";

export const useWebSocketChat = ({ dev } : { dev: boolean }) => {
  // https://stackoverflow.com/questions/60152922/proper-way-of-using-react-hooks-websockets
  const socket: any = useRef(null);
	const url = dev ? 'ws://localhost:8080/' : 'wss://stuffie-server.herokuapp.com';

  const [messages, setMessages] = useState<any>([]);
  const [status, setStatus] = useState<Status>("Wait");

  useEffect(() => {
    socket.current = new WebSocket(url);

    socket.current.onopen = () => {
      setStatus("Connected");
    };

    socket.current.onclose = () => {
			setStatus("Disconnected");
    };

    socket.current.onerror = (e: any) => {
      // Error logged for debugging WebSocket issues
      if (import.meta.env.DEV) {
        console.error(`WebSocket Error: ${e.message}`);
      }
			setStatus("Error");
    };

    const wsCurrent = socket.current;

    return () => {
      wsCurrent.close();
    };
  }, [url]);

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
      const message = { id: user.id, user: `${user.first_name} ${user.last_name}`, text: messageText };
      socket.current.send(JSON.stringify(message) as string);
			setStatus("Sending");
    } else {
			setStatus("Wait");
    }
  }

  return {
    messages,
    sendMessage,
		status
  }

};
