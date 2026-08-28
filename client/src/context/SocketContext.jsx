import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [latestRequestUpdate, setLatestRequestUpdate] = useState(null);
  const [latestPrintUpdate, setLatestPrintUpdate] = useState(null);

  useEffect(() => {
    const newSocket = io(SERVER_BASE || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'), {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected to backend:', newSocket.id);
    });

    newSocket.on('notification', (notif) => {
      setNotifications(prev => [
        { ...notif, id: Date.now() + Math.random(), time: new Date() },
        ...prev.slice(0, 9)
      ]);
    });

    newSocket.on('request_updated', (req) => {
      setLatestRequestUpdate(req);
    });

    newSocket.on('print_job_updated', (job) => {
      setLatestPrintUpdate(job);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      clearNotifications,
      latestRequestUpdate,
      latestPrintUpdate
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
