import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/use-toast';
import Routes from './Routes';
import offlineService from './utils/offlineService';

function App() {
  useEffect(() => {
    // Set up offline sync capabilities
    if (offlineService.isSupported()) {
      offlineService.setupAutoSync();
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;