import React, { useState, useRef, useEffect } from 'react';

export default function ChatSidebar({ chatHistory, sendChat, username }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendChat(text);
      setText('');
    }
  };

  return (
    <div className="chat-sidebar glass">
      <div className="chat-header">
        <h3>Project Chat</h3>
      </div>
      <div className="chat-messages">
        {chatHistory.length === 0 ? (
          <div className="empty-chat">No messages yet.</div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender === username ? 'self' : 'other'}`}>
              <div className="sender">{msg.sender}</div>
              <div className="text">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">→</button>
      </form>
    </div>
  );
}
