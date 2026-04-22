import React, { useState, useEffect } from 'react';

export default function FileExplorer({ activeFileId, onSelectFile, jwt }) {
  const [files, setFiles] = useState([]);
  const [newFilename, setNewFilename] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/files`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (e) {
      console.error("Failed to fetch files", e);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = async (e, id, filename) => {
    e.stopPropagation(); // Prevent the file from being selected/opened
    try {
      const response = await fetch(`${API_BASE}/api/files/${id}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      if (response.ok) {
        const fileData = await response.json();
        const content = fileData.content || '';
        
        // Create Blob dynamically and trigger browser download
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Failed to download file", e);
    }
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFilename.trim()) return;
    
    // Auto detect language
    let lang = 'java';
    if (newFilename.endsWith('.js') || newFilename.endsWith('.jsx')) lang = 'javascript';
    if (newFilename.endsWith('.py')) lang = 'python';
    if (newFilename.endsWith('.html')) lang = 'html';
    if (newFilename.endsWith('.css')) lang = 'css';
    if (newFilename.endsWith('.md')) lang = 'markdown'; // markdown preview support

    try {
      const response = await fetch(`${API_BASE}/api/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: newFilename, language: lang, content: '' })
      });
      if (response.ok) {
        const file = await response.json();
        setFiles([...files, file]);
        setNewFilename('');
        setIsCreating(false);
        onSelectFile(file.id);
      }
    } catch (e) {
      console.error("Failed to create file", e);
    }
  };

  return (
    <div className="file-explorer glass">
      <div className="explorer-header">
        <h3>WORKSPACE</h3>
        <button className="add-file-btn" onClick={() => setIsCreating(!isCreating)}>+</button>
      </div>
      
      {isCreating && (
        <form onSubmit={handleCreateFile} className="new-file-form">
          <input 
            autoFocus
            type="text" 
            placeholder="filename.js" 
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            onBlur={() => setIsCreating(false)}
          />
        </form>
      )}

      <div className="file-list">
        {files.map(f => (
          <div 
            key={f.id} 
            className={`file-item ${activeFileId === f.id ? 'active' : ''}`}
            onClick={() => onSelectFile(f.id)}
          >
            <span className="file-icon">📄</span>
            <span className="file-name" style={{ flex: 1 }}>{f.filename}</span>
            <button 
              className="download-btn"
              onClick={(e) => handleDownload(e, f.id, f.filename)}
              title="Download File"
            >
              📥
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
