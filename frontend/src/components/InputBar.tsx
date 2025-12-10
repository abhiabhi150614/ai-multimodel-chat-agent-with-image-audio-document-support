
import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface Props {
  onSend: (text: string, file: File | null) => void;
  isLoading: boolean;
}

const InputBar: React.FC<Props> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !file) || isLoading) return;
    onSend(text, file);
    setText('');
    setFile(null);
  };

  const handleDisplayFileClick = () => {
      fileInputRef.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
      }
  }

  return (
    <div className="glass-panel" style={{padding: '15px', borderRadius: '12px 12px 0 0', marginTop: 'auto'}}>
       {file && (
           <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '6px', width: 'fit-content'}}>
               <span style={{fontSize: '0.9em'}}>{file.name}</span>
               <button onClick={() => setFile(null)} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex'}}><X size={14}/></button>
           </div>
       )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{display: 'none'}} 
            accept=".jpg,.jpeg,.png,.pdf,.mp3,.wav,.m4a"
        />
        <button 
            type="button" 
            onClick={handleDisplayFileClick}
            className="glass-button" 
            style={{padding: '10px', background: 'rgba(255,255,255,0.1)'}}
            title="Attach File"
        >
            <Paperclip size={20} />
        </button>
        
        <input
          type="text"
          className="glass-input"
          placeholder="Ask something or describe task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        
        <button 
            type="submit" 
            className="glass-button" 
            disabled={isLoading || (!text.trim() && !file)}
            style={{display: 'flex', alignItems: 'center', gap: '5px'}}
        >
          <Send size={18} />
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default InputBar;
