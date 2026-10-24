
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
