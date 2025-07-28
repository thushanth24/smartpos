import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const StockHistoryModal = ({ isOpen, onClose, product, history }) => {
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const typeOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'in', label: 'Stock In' },
    { value: 'out', label: 'Stock Out' },
    { value: 'adjustment', label: 'Adjustments' },
    { value: 'sale', label: 'Sales' }
  ];

  const sortOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' }
  ];

  const filteredHistory = history
    .filter(item => filterType === 'all' || item.type === filterType)
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'in':
        return { name: 'Plus', className: 'text-success' };
      case 'out':
        return { name: 'Minus', className: 'text-warning' };
      case 'sale':
        return { name: 'ShoppingCart', className: 'text-primary' };
      case 'adjustment':
        return { name: 'Edit', className: 'text-muted-foreground' };
      default:
        return { name: 'Activity', className: 'text-muted-foreground' };
    }
  };

  const getTransactionBadge = (type) => {
    switch (type) {
      case 'in':
        return 'bg-success/10 text-success border-success/20';
      case 'out':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'sale':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'adjustment':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Stock Movement History</h2>
            <p className="text-sm text-muted-foreground">
              {product?.name} ({product?.sku})
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              label="Filter by Type"
              options={typeOptions}
              value={filterType}
              onChange={setFilterType}
              className="flex-1"
            />
            <Select
              label="Sort Order"
              options={sortOptions}
              value={sortOrder}
              onChange={setSortOrder}
              className="flex-1"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="History" size={48} className="text-muted-foreground mx-auto mb-4" />
              <div className="text-lg font-medium text-foreground mb-2">No history found</div>
              <div className="text-muted-foreground">No transactions match your filter criteria</div>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredHistory.map((transaction, index) => {
                const iconConfig = getTransactionIcon(transaction.type);
                
                return (
                  <div key={index} className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mt-1">
                        <Icon name={iconConfig.name} size={20} className={iconConfig.className} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTransactionBadge(transaction.type)}`}>
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleDateString()} at {new Date(transaction.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Quantity</div>
                            <div className={`font-medium ${
                              transaction.type === 'in' ? 'text-success' : 
                              transaction.type === 'out'|| transaction.type === 'sale' ? 'text-warning' : 'text-foreground'
                            }`}>
                              {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Reason</div>
                            <div className="text-foreground capitalize">{transaction.reason}</div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">User</div>
                            <div className="text-foreground">{transaction.user}</div>
                          </div>
                        </div>
                        
                        {transaction.notes && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1">Notes</div>
                            <div className="text-sm text-muted-foreground">{transaction.notes}</div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-muted-foreground">
                            Location: {transaction.location}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Balance: {transaction.balanceAfter}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredHistory.length} of {history.length} transactions
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryModal;