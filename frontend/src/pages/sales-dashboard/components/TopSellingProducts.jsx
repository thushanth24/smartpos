import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TopSellingProducts = ({ products = [] }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Top Selling Products</h2>
          <Icon name="TrendingUp" size={20} className="text-success" />
        </div>
      </div>
      <div className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sales data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{product.name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{product.soldQuantity} sold</span>
                    <span>•</span>
                    <span>{formatCurrency(product.price)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(product.revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopSellingProducts;