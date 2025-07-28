import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const LowStockAlerts = ({ products = [], onViewInventory }) => {
  const getStockLevelColor = (currentStock, minStock) => {
    const ratio = currentStock / minStock;
    if (ratio <= 0.5) return 'text-error';
    if (ratio <= 1) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getStockLevelBg = (currentStock, minStock) => {
    const ratio = currentStock / minStock;
    if (ratio <= 0.5) return 'bg-error/10';
    if (ratio <= 1) return 'bg-warning/10';
    return 'bg-muted/50';
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Low Stock Alerts</h2>
            {products.length > 0 && (
              <div className="w-6 h-6 bg-error rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{products.length}</span>
              </div>
            )}
          </div>
          <Icon name="AlertTriangle" size={20} className="text-warning" />
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">All products are well stocked</p>
            <p className="text-sm text-muted-foreground">No low stock alerts at this time</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {products.map((product) => (
              <div key={product.id} className="p-4 hover:bg-muted/50 transition-smooth">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStockLevelBg(product.currentStock, product.minStock)}`}>
                      <Icon name="Package" size={12} className={getStockLevelColor(product.currentStock, product.minStock)} />
                      <span className={getStockLevelColor(product.currentStock, product.minStock)}>
                        {product.currentStock} left
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min: {product.minStock}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {products.length > 0 && (
        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full" 
            iconName="Package"
            onClick={onViewInventory}
          >
            View Full Inventory
          </Button>
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;