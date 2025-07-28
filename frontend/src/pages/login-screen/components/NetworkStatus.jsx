import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('online');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      // Simulate sync process
      setTimeout(() => setSyncStatus('online'), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: 'WifiOff',
        color: 'text-error',
        bgColor: 'bg-error/10',
        borderColor: 'border-error/20',
        label: 'Offline Mode',
        description: 'Data will sync when connection is restored'
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: 'RefreshCw',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          label: 'Syncing...',
          description: 'Updating data from server'
        };
      default:
        return {
          icon: 'Wifi',
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          label: 'Online',
          description: 'All systems operational'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} shadow-elevation-1`}>
        <Icon 
          name={config.icon} 
          size={18} 
          className={`${config.color} ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
        />
        <div className="hidden sm:block">
          <div className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {config.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;