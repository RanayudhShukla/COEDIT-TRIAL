import React, { useState } from 'react';

export default function AuthView({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      const data = await response.json();
      onLogin(data.token, data.username);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0f0f13' }}>
      <div className="glass" style={{ width: '350px', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', marginBottom: '1.5rem', fontWeight: 600 }}>
           {isLogin ? 'Login' : 'Register'}
        </h2>
        
        {error && <div style={{ color: '#ff75c3', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
            required
          />
          <button type="submit" style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: '#5c8dec', color: 'white', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
             {isLogin ? 'Enter Workspace' : 'Create Account'}
          </button>
        </form>

        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1.5rem', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}
