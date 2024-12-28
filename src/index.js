import React from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './i18n/config';

// Remove loading spinner once app is loaded
const removeLoading = () => {
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);

// Remove loading spinner after render
removeLoading();
