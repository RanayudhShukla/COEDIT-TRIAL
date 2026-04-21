import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { toByteArray, fromByteArray } from 'base64-js';
import * as awarenessProtocol from 'y-protocols/awareness';
import ChatSidebar from './ChatSidebar';

const COLORS = ['#ff75c3', '#ffa657', '#ffee33', '#9aec5c', '#5cecc6', '#5c8dec', '#c45cec'];
const myColor = COLORS[Math.floor(Math.random() * COLORS.length)];

export default function EditorView({ username, jwt, activeFileId }) {
  const { connected, editorMessages, chatHistory, sendUpdate, sendSync, sendSave, sendAwareness, sendChat, clearEditorMessages } = useWebSocket(username, jwt, activeFileId);
  const [language, setLanguage] = useState('java');
  const editorRef = useRef(null);
  const ydocRef = useRef(new Y.Doc());
  const awarenessRef = useRef(new awarenessProtocol.Awareness(ydocRef.current));
  const bindingRef = useRef(null);
  
  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Bind Yjs to the underlying Monaco model, including Awareness
    const ytext = ydocRef.current.getText('monaco');
    const model = editor.getModel();
    bindingRef.current = new MonacoBinding(ytext, model, new Set([editor]), awarenessRef.current);
    
    // Set our initial presence identity for other users
    awarenessRef.current.setLocalStateField('user', {
      name: username,
      color: myColor
    });
  };

  // Hook 1: Listen to local typing events (from Yjs) and broadcast them
  useEffect(() => {
    const handleUpdate = (update, origin) => {
      // If the change came from the user typing, we broadcast it
      if (origin !== 'external_websocket') {
        const base64Update = fromByteArray(update);
        sendUpdate(base64Update);
      }
    };
    
    ydocRef.current.on('update', handleUpdate);
    
    // Awareness broadcaster
    const handleAwarenessUpdate = ({ added, updated, removed }) => {
      const changedClients = added.concat(updated, removed);
      const encodedAwareness = awarenessProtocol.encodeAwarenessUpdate(awarenessRef.current, changedClients);
      sendAwareness(fromByteArray(encodedAwareness));
    };
    awarenessRef.current.on('update', handleAwarenessUpdate);

    return () => {
      ydocRef.current.off('update', handleUpdate);
      awarenessRef.current.off('update', handleAwarenessUpdate);
    }
  }, [sendUpdate, sendAwareness]);

  // Hook 2: Apply incoming websocket messages
  useEffect(() => {
    if (editorMessages.length > 0) {
      const latestMessage = editorMessages[editorMessages.length - 1];
      
      if (latestMessage.type === 'JOIN') {
        console.log(`${latestMessage.sender} joined. Synchronizing state...`);
        // If someone joins, we send them the FULL current CRDT state snapshot
        if (latestMessage.sender !== username) {
          const fullState = Y.encodeStateAsUpdate(ydocRef.current);
          sendSync(fromByteArray(fullState));
        } else if (latestMessage.sender === username && latestMessage.content) {
          // If WE just joined and the server fed us the persisted snapshot file, apply it!
          try {
             console.log("Loading persisted snapshot from backend...");
             const snapshotArray = toByteArray(latestMessage.content);
             Y.applyUpdate(ydocRef.current, snapshotArray, 'external_websocket');
          } catch(e) {
             console.warn("Failed to load snapshot", e);
          }
        }
      } else if (latestMessage.type === 'UPDATE') {
        // We received either a small keystroke diff or a massive FULL sync state.
        // Y.applyUpdate intelligently merges both mathematically without squashing local un-synced keystrokes!
        if (latestMessage.sender !== username && latestMessage.content) {
          try {
             const updateArray = toByteArray(latestMessage.content);
             Y.applyUpdate(ydocRef.current, updateArray, 'external_websocket');
          } catch(e) {
             console.warn("Could not apply CRDT update", e);
          }
        }
      } else if (latestMessage.type === 'AWARENESS') {
        // AWARENESS messages contain the binary Awareness data
        if (latestMessage.sender !== username && latestMessage.content) {
          try {
             const awarenessArray = toByteArray(latestMessage.content);
             awarenessProtocol.applyAwarenessUpdate(awarenessRef.current, awarenessArray, 'external_websocket');
          } catch(e) {
             console.warn("Could not apply Awareness update", e);
          }
        }
      }
      
      clearEditorMessages();
    }
  }, [editorMessages, username, clearEditorMessages, sendSync]);

  // Hook 3: Periodic Auto-Save to Backend
  useEffect(() => {
    if (!connected) return;
    
    const saveInterval = setInterval(() => {
      // Create a full state snapshot and bounce it to the /app/editor.save endpoint
      const fullState = Y.encodeStateAsUpdate(ydocRef.current);
      sendSave(fromByteArray(fullState));
    }, 5000); // 5 seconds
    
    return () => clearInterval(saveInterval);
  }, [connected, sendSave]);

  return (
    <div style={{ display: 'flex', flex: 1, gap: '1rem', width: '100%', minWidth: 0 }}>
      <div className="editor-container glass">
        <div className="editor-header">
          <div className="status-indicator">
          <span className={`dot ${connected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">{connected ? 'Connected' : 'Connecting...'}</span>
        </div>
        
        {/* Editor Toolbar */}
        <div className="editor-toolbar">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>

        <div className="user-info" style={{ borderColor: myColor, color: myColor }}>
          <span>{username}</span>
        </div>
      </div>
      
      <div className="editor-body" style={{ padding: 0, display: 'block', height: '600px', width: '100%', position: 'relative' }}>
        <Editor
          height="600px"
          language={language}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            padding: { top: 16 }
          }}
          loading={<div style={{ padding: '20px', color: '#fff' }}>Loading Monaco Editor engine...</div>}
        />
      </div>
      </div>
      <ChatSidebar chatHistory={chatHistory} sendChat={sendChat} username={username} />
    </div>
  );
}
