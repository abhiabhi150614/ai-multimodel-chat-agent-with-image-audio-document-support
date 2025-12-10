
import React, { useState } from 'react';
import type { Message, PlanStep, LogEntry } from '../types';
import { CheckCircle, Circle, XCircle, Clock, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  message?: Message;
}

const PlanAndLogsPanel: React.FC<Props> = ({ message }) => {
  const [logsExpanded, setLogsExpanded] = useState(false);
  
  if (!message || !message.response) {
    return (
      <div style={{padding: '20px', opacity: 0.5, textAlign: 'center'}}>
        <Activity size={40} style={{marginBottom: '10px'}}/>
        <p>Execution details will appear here.</p>
      </div>
    );
  }

  const { plan = [], logs = [], cost_estimate } = message.response || {};

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto', gap: '15px'}}>
      {/* Plan Section */}
      <div>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Activity size={18} />
          Execution Plan
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {plan && plan.length > 0 ? plan.map((step: PlanStep, idx: number) => {
                const log = logs.find(l => l.step_name === step.name);
                const status = log ? log.status : step.status;
                
                let Icon = Circle;
                let color = '#666';
                let bgColor = 'rgba(102, 102, 102, 0.1)';
                
                if (status === 'completed' || status === 'success') { 
                  Icon = CheckCircle; 
                  color = '#66fcf1';
                  bgColor = 'rgba(102, 252, 241, 0.1)';
                }
                else if (status === 'failed' || status === 'error') { 
                  Icon = XCircle; 
                  color = '#ff6f61';
                  bgColor = 'rgba(255, 111, 97, 0.1)';
                }
                else if (status === 'running') { 
                  Icon = Clock; 
                  color = '#ff9a8b';
                  bgColor = 'rgba(255, 154, 139, 0.1)';
                }

                return (
                    <div key={idx} style={{
                      background: bgColor,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85em',
                      border: `1px solid ${color}20`,
                      transition: 'all 0.2s'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: color}}>
                            <Icon size={14} />
                            <span>{step.name.replace(/_/g, ' ')}</span>
                        </div>
                        <div style={{paddingLeft: '22px', opacity: 0.7, fontSize: '0.95em', marginTop: '4px'}}>
                          {step.description}
                        </div>
                    </div>
                )
            }) : <div style={{opacity: 0.5, fontSize: '0.9em', textAlign: 'center', padding: '20px'}}>No plan steps</div>}
        </div>
      </div>

      {/* Logs Section - Collapsible */}
      {logs && logs.length > 0 && (
        <div style={{marginTop: 'auto'}}>
          <button
            onClick={() => setLogsExpanded(!logsExpanded)}
            style={{
              width: '100%',
              background: 'rgba(255, 111, 97, 0.1)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '10px',
              color: 'var(--text-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}
          >
            <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Activity size={16} color="var(--primary-color)" />
              Execution Logs ({logs.length})
            </span>
            {logsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {logsExpanded && (
            <div style={{
              marginTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '250px',
              overflowY: 'auto'
            }}>
              {logs.map((log: LogEntry, idx: number) => (
                <div key={idx} style={{
                  fontSize: '0.8em',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${log.status === 'completed' ? '#66fcf1' : log.status === 'failed' ? '#ff6f61' : '#666'}`
                }}>
                  <div style={{fontWeight: 'bold', marginBottom: '4px', fontSize: '0.95em'}}>{log.step_name}</div>
                  <div style={{opacity: 0.7, fontSize: '0.9em'}}>→ {log.output_summary}</div>
                  <div style={{opacity: 0.5, fontSize: '0.85em', marginTop: '2px'}}>{log.duration_ms.toFixed(0)}ms</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Cost Estimate */}
      {cost_estimate !== undefined && cost_estimate !== null && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: 'rgba(102, 252, 241, 0.1)',
            border: '1px solid var(--accent-color)',
            borderRadius: '8px',
            fontSize: '0.85em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
              <Activity size={14} color="var(--accent-color)"/>
              <span>Cost: <strong style={{color: 'var(--accent-color)'}}>${cost_estimate.toFixed(4)}</strong></span>
          </div>
      )}
    </div>
  );
};

export default PlanAndLogsPanel;
