import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserCard = ({ user, onEdit, onToggleStatus, onResetPassword, onViewActivity }) => {
  const getStatusColor = (status) => {
    return status === 'active' ? 'text-success bg-success/10' : 'text-error bg-error/10';
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'text-primary bg-primary/10' : 'text-secondary bg-secondary/10';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-muted-foreground">Last Login:</span>
          <p className="font-medium text-foreground">{user.lastLogin}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Created:</span>
          <p className="font-medium text-foreground">{user.createdAt}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Shield" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {user.permissions.length} permissions
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewActivity(user)}
            className="h-8 w-8"
          >
            <Icon name="Activity" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onResetPassword(user)}
            className="h-8 w-8"
          >
            <Icon name="Key" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(user)}
            className="h-8 w-8"
          >
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStatus(user)}
            className="h-8 w-8"
          >
            <Icon name={user.status === 'active' ? 'UserX' : 'UserCheck'} size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;