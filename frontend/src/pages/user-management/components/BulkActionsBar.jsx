import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionsBar = ({ selectedUsers, onBulkAction, onClearSelection }) => {
  if (selectedUsers.length === 0) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="CheckSquare" size={20} className="text-primary" />
          <span className="font-medium text-foreground">
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('activate')}
            iconName="UserCheck"
            iconPosition="left"
          >
            Activate
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('deactivate')}
            iconName="UserX"
            iconPosition="left"
          >
            Deactivate
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('role_cashier')}
            iconName="User"
            iconPosition="left"
          >
            Set as Cashier
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('role_admin')}
            iconName="Shield"
            iconPosition="left"
          >
            Set as Admin
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            iconName="X"
            iconPosition="left"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;