
import React, { useState, useRef, useEffect } from 'react';
import type { Message, AgentResponse } from '../types';
import MessageList from './MessageList';
import InputBar from './InputBar';
import PlanAndLogsPanel from './PlanAndLogsPanel';
import { Play, Loader2 } from 'lucide-react';

const ChatLayout: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(crypto.randomUUID());
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, file: File | null) => {
    if (!text && !file) return;

    // Add User Message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      file: file || undefined
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Initial "Thinking" Message
    const agentMsgId = crypto.randomUUID();
    const thinkingMsg: Message = {
      id: agentMsgId,
      role: 'agent',
      isThinking: true
    };
    setMessages(prev => [...prev, thinkingMsg]);

    try {
      const formData = new FormData();
      if (text) formData.append('text', text);
      if (file) formData.append('file', file);
      formData.append('conversation_id', conversationId);

      // Check if replying to clarification
      const lastAgentMsg = messages.filter(m => m.role === 'agent').pop();
      if (lastAgentMsg?.response?.status === 'needs_clarification') {
          formData.append('clarification_answer', text);
      }

      // API Call
      const res = await fetch('http://localhost:8000/api/v1/agent/run', {
        method: 'POST',
        body: formData,
      });

      const data: AgentResponse = await res.json();

      // Update Agent Message
      setMessages(prev => prev.map(m => {
        if (m.id === agentMsgId) {
          return {
            ...m,
            isThinking: false,
            response: data,
            content: data.status === 'needs_clarification' ? data.clarification_question : undefined
          };
        }
        return m;
      }));

    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m => {
        if (m.id === agentMsgId) {
          return {
            ...m,
            isThinking: false,
            content: "Sorry, something went wrong. Check console for details."
          };
        }
        return m;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMessage = messages.find(m => m.role === 'agent' && m.response);

  return (
    <div style={{display: 'flex', gap: '20px', height: '100%', overflow: 'hidden'}}>
      {/* Main Chat Area */}
      <div className="glass-panel chat-container">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
        <InputBar onSend={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Side Panel (Plan & Logs) */}
      <div className="glass-panel" style={{width: '350px', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <PlanAndLogsPanel message={selectedMessage} />
      </div>
    </div>
  );
};

export default ChatLayout;
