
import React, { useState } from 'react';
import type { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import { User, Bot, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  const [showExtracted, setShowExtracted] = useState(false);

  if (message.isThinking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '10px' }}>
        <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={20} className="animate-pulse" style={{color: 'var(--accent-color)'}} />
          <span style={{ fontSize: '0.9em', opacity: 0.8 }}>Thinking...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (message.content) {
      return (
        <div className="markdown-content">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      );
    }
    
    // Check for error
    if (message.response?.error) {
        return (
            <div style={{color: '#ff6f61', background: 'rgba(255, 111, 97, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid #ff6f61'}}>
                <strong>Error:</strong> {message.response.error}
            </div>
        )
    }
    
    // Render structured output base on task type
    const final = message.response?.final_output;
    if (!final) return null;

    // We can have specific renders, but generic markdown render of json fields is a good fallback
    // Or we stick to the prompt requirement: Text only output. 
    // Ideally the backend *should* have populated 'message.content' if it was a clarification or simple chat.
    // But for "summarization" etc, we might want to render nicely.
    
    // Check keys
    if (final.one_line_summary) {
       return (
         <div className="markdown-content">
           <h2>One Line Summary</h2>
           <p>{final.one_line_summary}</p>
           <h2>Key Points</h2>
           <ul>
             {(final.bullet_points || []).map((bp: string, i: number) => <li key={i}>{bp}</li>)}
           </ul>
           {final.five_sentence_summary && (
             <>
               <h2>Detailed Summary</h2>
               <p>{final.five_sentence_summary}</p>
             </>
           )}
         </div>
       )
    }
    
    if (final.sentiment) { // Using my own schema "label" etc
       return (
           <div className="markdown-content">
             <h2>Sentiment Analysis</h2>
             <p><strong>Label:</strong> {final.label} ({final.confidence})</p>
             <p><strong>Justification:</strong> {final.justification}</p>
           </div>
       )
    }

    if (final.status) { // Generic fallback
        return <pre>{JSON.stringify(final, null, 2)}</pre>
    }

    if (final.message) {
        return (
            <div className="markdown-content">
                <ReactMarkdown>{final.message}</ReactMarkdown>
            </div>
        );
    }

    return <pre>{JSON.stringify(final, null, 2)}</pre>;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '10px'
    }}>
      <div 
        className={isUser ? "" : "glass-panel"} 
        style={{ 
          maxWidth: '80%', 
          padding: '15px', 
          borderRadius: '12px',
          background: isUser ? 'linear-gradient(135deg, var(--accent-color), #45a29e)' : undefined,
          color: isUser ? '#0b0c10' : undefined, /* Ensure text is readable on bright accent */
          border: isUser ? 'none' : undefined,
          boxShadow: isUser ? '0 4px 15px rgba(102, 252, 241, 0.3)' : undefined
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', opacity: 0.7, fontSize: '0.8em', color: isUser ? '#0b0c10' : 'var(--text-color)'}}>
           {isUser ? <User size={14}/> : <Bot size={14}/>}
           <span>{isUser ? 'You' : 'Agent'}</span>
        </div>

        {/* File Badge */}
        {message.file && isUser && (
           <div style={{background: 'rgba(0,0,0,0.2)', padding: '5px 10px', borderRadius: '4px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9em'}}>
              <FileText size={14} />
              {message.file.name}
           </div>
        )}

        {/* Main Content */}
        {renderContent()}

        {/* Extracted Text (Agent Only) */}
        {!isUser && message.response?.extracted_text && (
          <div style={{marginTop: '15px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px'}}>
            <button 
              onClick={() => setShowExtracted(!showExtracted)}
              style={{background: 'none', border: 'none', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85em', opacity: 0.8}}
            >
              {showExtracted ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
              Show Source Content
            </button>
            {showExtracted && (
              <div style={{background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px', marginTop: '5px', maxHeight: '200px', overflowY: 'auto', fontSize: '0.85em', whiteSpace: 'pre-wrap'}}>
                {message.response.extracted_text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
