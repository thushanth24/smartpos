import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentTransactionsList = ({ transactions = [] }) => {
  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'Banknote';
      case 'card':
        return 'CreditCard';
      case 'digital':
        return 'Smartphone';
      default:
        return 'DollarSign';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Live Feed
          </div>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions yet today</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-muted/50 transition-smooth">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon 
                        name={getPaymentMethodIcon(transaction.paymentMethod)} 
                        size={16} 
                        className="text-primary" 
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.customerName || 'Walk-in Customer'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatTime(transaction.timestamp)}</span>
                        <span>•</span>
                        <span className="capitalize">{transaction.paymentMethod}</span>
                        <span>•</span>
                        <span>{transaction.itemCount} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatAmount(transaction.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      #{transaction.receiptNumber}
                    </p>
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

export default RecentTransactionsList;