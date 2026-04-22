import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export function useWebSocket(username, jwt, fileId) {
  const [connected, setConnected] = useState(false);
  const [editorMessages, setEditorMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const stompClient = useRef(null);

  useEffect(() => {
    if (!username || !jwt || !fileId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws-coedit';

    stompClient.current = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: 'Bearer ' + jwt
      },
      debug: (str) => {
        // console.log(str);
      },
      heartbeatOutgoing: 4000,
    });

    stompClient.current.onConnect = () => {
      setConnected(true);

      // Subscribe to individual file topic
      stompClient.current.subscribe(`/topic/file/${fileId}`, (payload) => {
        const message = JSON.parse(payload.body);
        if (message.type === 'CHAT') {
          // Standard text chat message route
          setChatHistory((prev) => [...prev, message]);
        } else {
          // AWARENESS, UPDATE, JOIN go to the CRDT logic
          setEditorMessages((prev) => [...prev, message]);
        }
      });

      // Send join message to this file
      stompClient.current.publish({
        destination: `/app/editor/${fileId}.addUser`,
        body: JSON.stringify({ sender: username, type: 'JOIN' }),
      });
    };

    stompClient.current.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    stompClient.current.onWebSocketClose = () => {
      setConnected(false);
    };

    // Activate the connection
    stompClient.current.activate();

    // Cleanup on unmount
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [username, jwt, fileId]);

  const sendUpdate = useCallback(
    (crdtPayload) => {
      if (stompClient.current && connected && fileId) {
        stompClient.current.publish({
          destination: `/app/editor/${fileId}.sendUpdate`,
          body: JSON.stringify({
            sender: username,
            content: crdtPayload,
            cursorPosition: 0,
            type: 'UPDATE',
          }),
        });
      }
    },
    [connected, username, fileId]
  );

  const sendSync = useCallback(
    (crdtPayload) => {
      // Repurpose UPDATE for the full sync state since backend just broadcasts it
      if (stompClient.current && connected && fileId) {
        stompClient.current.publish({
          destination: `/app/editor/${fileId}.sendUpdate`,
          body: JSON.stringify({
            sender: username,
            content: crdtPayload,
            cursorPosition: 0,
            type: 'UPDATE',
          }),
        });
      }
    },
    [connected, username, fileId]
  );

  const sendSave = useCallback(
    (crdtPayload) => {
      if (stompClient.current && connected && fileId) {
        stompClient.current.publish({
          destination: `/app/editor/${fileId}.save`,
          body: JSON.stringify({
            sender: username,
            content: crdtPayload,
            cursorPosition: 0,
            type: 'UPDATE', // payload type doesn't matter for save endpoint
          }),
        });
      }
    },
    [connected, username, fileId]
  );
  
  const sendAwareness = useCallback(
    (awarenessPayload) => {
      if (stompClient.current && connected && fileId) {
        stompClient.current.publish({
          destination: `/app/editor/${fileId}.sendUpdate`,
          body: JSON.stringify({
            sender: username,
            content: awarenessPayload,
            cursorPosition: 0,
            type: 'AWARENESS', 
          }),
        });
      }
    },
    [connected, username, fileId]
  );

  const sendChat = useCallback((text) => {
      if (stompClient.current && connected && fileId) {
        stompClient.current.publish({
          destination: `/app/editor/${fileId}.sendUpdate`,
          body: JSON.stringify({
            sender: username,
            content: text,
            cursorPosition: 0,
            type: 'CHAT', 
          }),
        });
      }
  }, [connected, username, fileId]);

  const clearEditorMessages = useCallback(() => setEditorMessages([]), []);

  return { connected, editorMessages, chatHistory, sendUpdate, sendSync, sendSave, sendAwareness, sendChat, clearEditorMessages };
}
