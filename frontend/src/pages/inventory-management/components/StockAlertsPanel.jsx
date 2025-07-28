import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StockAlertsPanel = ({ alerts, onReorder, onDismiss }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'out_of_stock':
        return { name: 'AlertTriangle', className: 'text-error' };
      case 'low_stock':
        return { name: 'AlertCircle', className: 'text-warning' };
      case 'reorder_suggested':
        return { name: 'ShoppingCart', className: 'text-primary' };
      default:
        return { name: 'Info', className: 'text-muted-foreground' };
    }
  };

  const getAlertBadge = (type) => {
    switch (type) {
      case 'out_of_stock':
        return 'bg-error/10 text-error border-error/20';
      case 'low_stock':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'reorder_suggested':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getAlertTitle = (type) => {
    switch (type) {
      case 'out_of_stock':
        return 'Out of Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'reorder_suggested':
        return 'Reorder Suggested';
      default:
        return 'Alert';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="CheckCircle" size={20} className="text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Stock Alerts</h3>
        </div>
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
          <div className="text-lg font-medium text-foreground mb-2">All Good!</div>
          <div className="text-muted-foreground">No stock alerts at the moment</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Stock Alerts</h3>
          <span className="px-2 py-1 bg-error/10 text-error rounded-full text-xs font-medium">
            {alerts.length}
          </span>
        </div>
        <Button variant="ghost" size="sm">
          <Icon name="Settings" size={16} />
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {alerts.map((alert) => {
          const iconConfig = getAlertIcon(alert.type);
          
          return (
            <div key={alert.id} className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Icon name={iconConfig.name} size={20} className={iconConfig.className} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertBadge(alert.type)}`}>
                      {getAlertTitle(alert.type)}
                    </span>
                  </div>
                  
                  <div className="font-medium text-foreground mb-1">{alert.productName}</div>
                  <div className="text-sm text-muted-foreground mb-2">{alert.message}</div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {alert.location} • {alert.timestamp}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {alert.type === 'reorder_suggested' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReorder(alert)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Icon name="ShoppingCart" size={14} className="mr-1" />
                          Reorder
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismiss(alert.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <Button variant="outline" className="w-full">
          <Icon name="Settings" size={16} className="mr-2" />
          Configure Alert Settings
        </Button>
      </div>
    </div>
  );
};

export default StockAlertsPanel;