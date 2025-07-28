import React from 'react';
import Icon from '../../../components/AppIcon';


const QuickActionCards = ({ onNewSale, onViewInventory, onViewCustomers, onViewReports }) => {
  const quickActions = [
    {
      id: 'new-sale',
      title: 'New Sale',
      description: 'Start a new transaction',
      icon: 'ShoppingCart',
      color: 'primary',
      action: onNewSale,
      primary: true
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Manage products & stock',
      icon: 'Package',
      color: 'secondary',
      action: onViewInventory
    },
    {
      id: 'customers',
      title: 'Customers',
      description: 'View customer profiles',
      icon: 'Users',
      color: 'secondary',
      action: onViewCustomers
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Sales & analytics',
      icon: 'BarChart3',
      color: 'secondary',
      action: onViewReports
    }
  ];

  const getColorClasses = (color, isPrimary) => {
    if (isPrimary) {
      return {
        bg: 'bg-primary',
        text: 'text-primary-foreground',
        hover: 'hover:bg-primary/90',
        icon: 'text-primary-foreground'
      };
    }
    
    return {
      bg: 'bg-card',
      text: 'text-foreground',
      hover: 'hover:bg-muted/50',
      icon: 'text-primary'
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActions.map((action) => {
        const colorClasses = getColorClasses(action.color, action.primary);
        
        return (
          <button
            key={action.id}
            onClick={action.action}
            className={`${colorClasses.bg} ${colorClasses.text} ${colorClasses.hover} border border-border rounded-lg p-6 text-left transition-smooth hover:shadow-elevation-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${action.primary ? 'bg-primary-foreground/10' : 'bg-primary/10'} rounded-lg flex items-center justify-center`}>
                <Icon 
                  name={action.icon} 
                  size={24} 
                  className={action.primary ? 'text-primary-foreground' : 'text-primary'} 
                />
              </div>
              {action.primary && (
                <div className="w-3 h-3 bg-primary-foreground rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className={`font-semibold mb-1 ${colorClasses.text}`}>
                {action.title}
              </h3>
              <p className={`text-sm ${action.primary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {action.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActionCards;