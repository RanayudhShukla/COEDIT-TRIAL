import React, { useState, useEffect } from 'react';
import EditorView from './components/EditorView';
import AuthView from './components/AuthView';
import FileExplorer from './components/FileExplorer';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [jwt, setJwt] = useState('');
  const [activeFileId, setActiveFileId] = useState(null);

  // On mount, check if there's a token stored
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const user = localStorage.getItem('jwt_username');
    if (token && user) {
      setJwt(token);
      setUsername(user);
    }
  }, []);

  const handleLogin = (token, username) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('jwt_username', username);
    setJwt(token);
    setUsername(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_username');
    setJwt('');
    setUsername('');
    setActiveFileId(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CoEdit <span>Studio</span></h1>
        {jwt && (
          <button 
            onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            Logout
          </button>
        )}
      </header>
      
      <main className="main-content">
        {!jwt ? (
          <AuthView onLogin={handleLogin} />
        ) : (
          <>
            <FileExplorer 
              activeFileId={activeFileId} 
              onSelectFile={setActiveFileId} 
              jwt={jwt} 
            />
            {activeFileId ? (
              <EditorView 
                key={activeFileId} 
                username={username} 
                jwt={jwt} 
                activeFileId={activeFileId} 
              />
            ) : (
              <div className="empty-state glass" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px'}}>
                <h2 style={{color: 'var(--text-muted)'}}>Select or Create a file to start coding!</h2>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="app-footer">
        Powered by Spring Boot & React
      </footer>
    </div>
  );
}

export default App;
