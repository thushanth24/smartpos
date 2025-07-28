import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
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
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;