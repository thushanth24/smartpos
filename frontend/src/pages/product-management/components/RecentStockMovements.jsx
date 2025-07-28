import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentStockMovements = ({ movements }) => {
  const getMovementIcon = (type) => {
    switch (type) {
      case 'in': return 'TrendingUp';
      case 'out': return 'TrendingDown';
      case 'adjustment': return 'Edit';
      default: return 'Activity';
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'in': return 'text-success';
      case 'out': return 'text-error';
      case 'adjustment': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Activity" size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Recent Stock Movements</h3>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {movements.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recent movements</p>
            <p className="text-sm text-muted-foreground mt-1">Stock movements will appear here</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {movements.map((movement) => (
              <div key={movement.id} className="p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    movement.type === 'in' ? 'bg-success/10' :
                    movement.type === 'out' ? 'bg-error/10' : 'bg-warning/10'
                  }`}>
                    <Icon 
                      name={getMovementIcon(movement.type)} 
                      size={16} 
                      className={getMovementColor(movement.type)} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {movement.productName}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          SKU: {movement.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getMovementColor(movement.type)}`}>
                          {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}
                          {movement.quantity}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(movement.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {movement.reason}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>By: {movement.user}</span>
                      <span>Stock: {movement.newStock}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentStockMovements;