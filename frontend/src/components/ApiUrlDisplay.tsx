import React from 'react';
import { appRuntimeMode, runtimeDescription } from '../config/runtime';

const ApiUrlDisplay: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #dee2e6',
      padding: '8px 16px',
      fontSize: '12px',
      color: '#6c757d',
      textAlign: 'center',
      zIndex: 1000
    }}>
      Runtime mode: {appRuntimeMode} | {runtimeDescription}
    </div>
  );
};

export default ApiUrlDisplay;
