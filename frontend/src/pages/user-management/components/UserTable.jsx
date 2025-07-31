import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserTable = ({ users, onEdit, onToggleStatus, onResetPassword, onViewActivity, sortConfig, onSort }) => {
  const getStatusColor = (status) => {
    return status === 'active' ? 'text-success bg-success/10' : 'text-error bg-error/10';
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'text-primary bg-primary/10' : 'text-secondary bg-secondary/10';
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return 'ArrowUpDown';
    return sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const handleSort = (column) => {
    onSort(column);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="font-semibold text-foreground hover:bg-transparent p-0 h-auto gap-2"
                >
                  User
                  <Icon name={getSortIcon('name')} size={16} />
                </Button>
              </th>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('role')}
                  className="font-semibold text-foreground hover:bg-transparent p-0 h-auto gap-2"
                >
                  Role
                  <Icon name={getSortIcon('role')} size={16} />
                </Button>
              </th>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('status')}
                  className="font-semibold text-foreground hover:bg-transparent p-0 h-auto gap-2"
                >
                  Status
                  <Icon name={getSortIcon('status')} size={16} />
                </Button>
              </th>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('lastLogin')}
                  className="font-semibold text-foreground hover:bg-transparent p-0 h-auto gap-2"
                >
                  Last Login
                  <Icon name={getSortIcon('lastLogin')} size={16} />
                </Button>
              </th>
              <th className="text-left p-4">
                <span className="font-semibold text-foreground">Permissions</span>
              </th>
              <th className="text-right p-4">
                <span className="font-semibold text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="User" size={16} className="text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm text-foreground">{user.lastLogin}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Shield" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{Array.isArray(user.permissions) ? user.permissions.length : 0}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;