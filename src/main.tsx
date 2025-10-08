import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Run diagnostics
import './test-supabase-connection';
import './test-profile-table';
import './diagnose-auth-flow';
import './diagnose-complete';
import './test-env-variables';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);