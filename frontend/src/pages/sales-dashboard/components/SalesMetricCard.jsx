import React from 'react';
import Icon from '../../../components/AppIcon';

const SalesMetricCard = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return {
          bg: 'bg-success/10',
          icon: 'text-success',
          border: 'border-success/20'
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          icon: 'text-warning',
          border: 'border-warning/20'
        };
      case 'error':
        return {
          bg: 'bg-error/10',
          icon: 'text-error',
          border: 'border-error/20'
        };
      default:
        return {
          bg: 'bg-primary/10',
          icon: 'text-primary',
          border: 'border-primary/20'
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses.bg} ${colorClasses.border} border rounded-lg flex items-center justify-center`}>
          <Icon name={icon} size={24} className={colorClasses.icon} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            changeType === 'positive' ?'bg-success/10 text-success' 
              : changeType === 'negative' ?'bg-error/10 text-error' :'bg-muted text-muted-foreground'
          }`}>
            <Icon 
              name={changeType === 'positive' ? 'TrendingUp' : changeType === 'negative' ? 'TrendingDown' : 'Minus'} 
              size={12} 
            />
            {change}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};

export default SalesMetricCard;