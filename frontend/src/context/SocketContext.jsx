import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children, userId }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (userId) {
      socketRef.current = io(import.meta.env.VITE_API_URL);
      
      socketRef.current.on('connect', () => {
        socketRef.current.emit('user_connected', userId);
      });

      window.addEventListener('beforeunload', () => {
        if (socketRef.current) {
          socketRef.current.emit('user_disconnect', { userId });
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('user_disconnect', { userId });
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
