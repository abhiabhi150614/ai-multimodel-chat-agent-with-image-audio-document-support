
import React from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';

interface Props {
  messages: Message[];
}

const MessageList: React.FC<Props> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.length === 0 && (
        <div style={{textAlign: 'center', marginTop: '50px', opacity: 0.5}}>
          <p>Welcome to Agentic AI Workspace.</p>
          <p>Ask a question or upload a file to start.</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
};

export default MessageList;
