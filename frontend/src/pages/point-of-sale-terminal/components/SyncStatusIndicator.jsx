import React from 'react';
import Icon from '../../../components/AppIcon';

const SyncStatusIndicator = ({ status, lastSync, pendingTransactions = 0 }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: 'Wifi',
          color: 'text-success',
          bgColor: 'bg-success/10',
          label: 'Online',
          description: 'All data synced'
        };
      case 'offline':
        return {
          icon: 'WifiOff',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          label: 'Offline Mode',
          description: `${pendingTransactions} transactions pending`
        };
      case 'syncing':
        return {
          icon: 'RefreshCw',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          label: 'Syncing',
          description: 'Updating data...'
        };
      case 'error':
        return {
          icon: 'AlertTriangle',
          color: 'text-error',
          bgColor: 'bg-error/10',
          label: 'Sync Error',
          description: 'Connection failed'
        };
      default:
        return {
          icon: 'Wifi',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig();

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    const now = new Date();
    const syncTime = new Date(lastSync);
    const diffMinutes = Math.floor((now - syncTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return syncTime.toLocaleDateString();
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${config.bgColor} border border-border/50`}>
      <Icon 
        name={config.icon} 
        size={16} 
        className={`${config.color} ${status === 'syncing' ? 'animate-spin' : ''}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
          {pendingTransactions > 0 && status === 'offline' && (
            <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full">
              {pendingTransactions}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {config.description} • Last sync: {formatLastSync()}
        </p>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;