import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InventoryAlerts = ({ alerts, onViewProduct, onRestock }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'out-of-stock': return 'AlertTriangle';
      case 'low-stock': return 'AlertCircle';
      case 'overstock': return 'TrendingUp';
      default: return 'Info';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'out-of-stock': return 'text-error';
      case 'low-stock': return 'text-warning';
      case 'overstock': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertBg = (type) => {
    switch (type) {
      case 'out-of-stock': return 'bg-error/10';
      case 'low-stock': return 'bg-warning/10';
      case 'overstock': return 'bg-primary/10';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Bell" size={20} className="text-warning" />
          <h3 className="font-semibold text-foreground">Inventory Alerts</h3>
          <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-medium">
            {alerts.length}
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-3" />
            <p className="text-muted-foreground">No inventory alerts</p>
            <p className="text-sm text-muted-foreground mt-1">All products are well stocked</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border ${getAlertBg(alert.type)} border-border`}
              >
                <div className="flex items-start gap-3">
                  <Icon 
                    name={getAlertIcon(alert.type)} 
                    size={20} 
                    className={`flex-shrink-0 mt-0.5 ${getAlertColor(alert.type)}`} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {alert.productName}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          SKU: {alert.sku}
                        </p>
                      </div>
                      <span className={`text-xs font-medium ${getAlertColor(alert.type)}`}>
                        {alert.currentStock} units
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onViewProduct(alert.productId)}
                        iconName="Eye"
                        iconPosition="left"
                      >
                        View
                      </Button>
                      {alert.type !== 'overstock' && (
                        <Button
                          variant="default"
                          size="xs"
                          onClick={() => onRestock(alert.productId)}
                          iconName="Plus"
                          iconPosition="left"
                        >
                          Restock
                        </Button>
                      )}
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

export default InventoryAlerts;