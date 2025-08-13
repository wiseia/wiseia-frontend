// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import App from './App.tsx';

import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);