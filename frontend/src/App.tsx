
import React from 'react';
import ChatLayout from './components/ChatLayout';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <header style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h1 style={{fontSize: '1.8rem', fontWeight: 'bold', background: 'linear-gradient(to right, var(--accent-color), var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.05em'}}>
          AGNT.AI
        </h1>
        <div style={{fontSize: '0.8rem', opacity: 0.7, color: 'var(--accent-color)', border: '1px solid var(--glass-border)', padding: '5px 10px', borderRadius: '20px'}}>
            Environment: Obsidian
        </div>
      </header>
      <ChatLayout />
    </div>
  );
}

export default App;
