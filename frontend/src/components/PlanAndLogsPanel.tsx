
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

      {/* Logs Section - Always Visible */}
      <div style={{marginTop: '15px'}}>
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
          Execution Logs {logs && logs.length > 0 && `(${logs.length})`}
        </h3>
        
        {logs && logs.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '5px'
          }}>
            {logs.map((log: LogEntry, idx: number) => {
              const statusColor = log.status === 'completed' ? '#66fcf1' : 
                                log.status === 'failed' ? '#ff6f61' : 
                                log.status === 'running' ? '#ff9a8b' : '#666';
              
              return (
                <div key={idx} style={{
                  background: `${statusColor}15`,
                  border: `1px solid ${statusColor}40`,
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.85em'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontWeight: 'bold',
                      color: statusColor,
                      fontSize: '0.95em'
                    }}>
                      {log.step_name.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '0.8em',
                      opacity: 0.7,
                      background: 'rgba(0,0,0,0.2)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {log.duration_ms.toFixed(0)}ms
                    </span>
                  </div>
                  
                  {log.input_summary && (
                    <div style={{
                      fontSize: '0.85em',
                      opacity: 0.8,
                      marginBottom: '4px',
                      fontStyle: 'italic'
                    }}>
                      📥 {log.input_summary}
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: '0.9em',
                    opacity: 0.9
                  }}>
                    📤 {log.output_summary || 'Processing...'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            opacity: 0.5,
            fontSize: '0.9em',
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '8px',
            border: '1px dashed rgba(255,255,255,0.2)'
          }}>
            No execution logs yet
          </div>
        )}
      </div>
      
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
