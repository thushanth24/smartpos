import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivityPanel = ({ selectedUser, activities, onClose }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return 'LogIn';
      case 'logout': return 'LogOut';
      case 'sale': return 'ShoppingCart';
      case 'refund': return 'RotateCcw';
      case 'inventory': return 'Package';
      case 'user_edit': return 'UserCog';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'login': return 'text-success';
      case 'logout': return 'text-muted-foreground';
      case 'sale': return 'text-primary';
      case 'refund': return 'text-warning';
      case 'inventory': return 'text-accent';
      case 'user_edit': return 'text-secondary';
      default: return 'text-foreground';
    }
  };

  if (!selectedUser) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-12">
          <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No User Selected</h3>
          <p className="text-muted-foreground">Select a user to view their activity logs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={16} className="text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{selectedUser.name}</h3>
            <p className="text-sm text-muted-foreground">Activity Log</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={16} />
        </Button>
      </div>

      <div className="p-4">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className={`p-2 rounded-full bg-background ${getActivityColor(activity.type)}`}>
                <Icon name={getActivityIcon(activity.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground">{activity.action}</h4>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                {activity.details && (
                  <div className="mt-2 text-xs text-muted-foreground bg-background p-2 rounded">
                    {activity.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Clock" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;