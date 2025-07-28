import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const PermissionMatrix = ({ users, permissions, onPermissionChange }) => {
  const permissionCategories = {
    'POS Operations': ['pos_access', 'discount_apply', 'refund_process'],
    'Inventory Management': ['inventory_view', 'inventory_edit'],
    'Customer Management': ['customer_manage'],
    'Reports & Analytics': ['reports_view', 'reports_export']
  };

  const getPermissionLabel = (permissionId) => {
    const permissionMap = {
      'pos_access': 'POS Access',
      'inventory_view': 'View Inventory',
      'inventory_edit': 'Edit Inventory',
      'reports_view': 'View Reports',
      'reports_export': 'Export Reports',
      'customer_manage': 'Manage Customers',
      'discount_apply': 'Apply Discounts',
      'refund_process': 'Process Refunds'
    };
    return permissionMap[permissionId] || permissionId;
  };

  const hasPermission = (user, permissionId) => {
    return user.permissions.includes(permissionId);
  };

  const handlePermissionToggle = (userId, permissionId, checked) => {
    onPermissionChange(userId, permissionId, checked);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Shield" size={20} />
          Permission Matrix
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage user permissions across different system areas
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground min-w-[200px]">
                User / Permission
              </th>
              {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
                <th key={category} className="text-center p-2 border-l border-border">
                  <div className="font-semibold text-foreground text-sm">{category}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {categoryPermissions.length} permissions
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="User" size={14} className="text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                    </div>
                  </div>
                </td>
                {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
                  <td key={category} className="p-2 border-l border-border">
                    <div className="space-y-2">
                      {categoryPermissions.map((permissionId) => (
                        <div key={permissionId} className="flex items-center justify-center">
                          <Checkbox
                            checked={hasPermission(user, permissionId)}
                            onChange={(e) => handlePermissionToggle(user.id, permissionId, e.target.checked)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-muted/30 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
            <div key={category}>
              <h4 className="font-medium text-foreground mb-2">{category}</h4>
              <ul className="space-y-1">
                {categoryPermissions.map((permissionId) => (
                  <li key={permissionId} className="text-muted-foreground">
                    • {getPermissionLabel(permissionId)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix;