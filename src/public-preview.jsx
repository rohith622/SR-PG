
import React from 'react';
import { createRoot } from 'react-dom/client';
import PublicWebsite from './PublicWebsite';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PublicWebsite />
  </React.StrictMode>
);
