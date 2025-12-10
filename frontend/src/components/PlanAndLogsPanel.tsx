
import React from 'react';
import type { Message, PlanStep, LogEntry } from '../types';
import { CheckCircle, Circle, XCircle, Clock, Activity } from 'lucide-react';

interface Props {
  message?: Message;
}

const PlanAndLogsPanel: React.FC<Props> = ({ message }) => {
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
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', overflowY: 'auto'}}>
      {/* Plan Section */}
      <div>
        <h3 style={{borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)'}}>
            Plan
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {plan && plan.length > 0 ? plan.map((step: PlanStep, idx: number) => {
                const log = logs.find(l => l.step_name === step.name);
                const status = log ? log.status : step.status;
                
                let Icon = Circle;
                let color = 'gray';
                
                if (status === 'completed' || status === 'success') { Icon = CheckCircle; color = '#66fcf1'; /* Accent */ }
                else if (status === 'failed' || status === 'error') { Icon = XCircle; color = '#ff6f61'; /* Primary/Error */ }
                else if (status === 'running') { Icon = Clock; color = '#ff9a8b'; /* Light Salmon */ }

                return (
                    <div key={idx} style={{background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', fontSize: '0.9em', border: status === 'running' ? '1px solid var(--primary-color)' : 'none'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: color}}>
                            <Icon size={16} />
                            <span>{step.name}</span>
                        </div>
                        <div style={{paddingLeft: '24px', opacity: 0.7, fontSize: '0.9em'}}>{step.description}</div>
                    </div>
                )
            }) : <div style={{opacity: 0.5, fontSize: '0.9em'}}>No plan steps available</div>}
        </div>
      </div>

      {/* Logs Section */}
      <div style={{marginTop: 'auto'}}>
         <h3 style={{borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginBottom: '10px', color: 'var(--primary-color)'}}>Logs</h3>
         <div style={{display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto'}}>
             {logs && logs.length > 0 ? logs.map((log: LogEntry, idx: number) => (
                 <div key={idx} style={{fontSize: '0.85em', background: 'rgba(0,0,0,0.1)', padding: '8px', borderRadius: '6px'}}>
                     <div style={{fontWeight: 'bold', marginBottom: '2px'}}>{log.step_name}</div>
                     <div style={{opacity: 0.8}}>Input: {log.input_summary}</div>
                     <div style={{opacity: 0.8}}>Output: {log.output_summary}</div>
                     <div style={{opacity: 0.6, fontSize: '0.8em', marginTop: '2px'}}>{log.duration_ms.toFixed(0)}ms</div>
                 </div>
             )) : <div style={{opacity: 0.5, fontSize: '0.9em'}}>No logs available</div>}
         </div>
      </div>
      
      {/* Cost Estimate */}
      {cost_estimate !== undefined && cost_estimate !== null && (
          <div style={{marginTop: '10px', padding: '10px', background: 'rgba(255, 111, 97, 0.1)', border: '1px solid var(--primary-color)', borderRadius: '8px', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Activity size={16} color="var(--primary-color)"/>
              <span>Estimated Cost: <strong style={{color: 'var(--primary-color)'}}>{cost_estimate.toFixed(4)} USD</strong></span>
          </div>
      )}
    </div>
  );
};

export default PlanAndLogsPanel;
