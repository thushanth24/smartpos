import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox, CheckboxGroup } from '../../../components/ui/Checkbox';

const EditUserModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
    permissions: []
  });

  const [errors, setErrors] = useState({});

  const availablePermissions = [
    { id: 'pos_access', label: 'POS Terminal Access', description: 'Process sales and transactions' },
    { id: 'inventory_view', label: 'View Inventory', description: 'View product stock levels' },
    { id: 'inventory_edit', label: 'Edit Inventory', description: 'Modify product stock levels' },
    { id: 'reports_view', label: 'View Reports', description: 'Access sales and inventory reports' },
    { id: 'reports_export', label: 'Export Reports', description: 'Download reports in PDF/Excel' },
    { id: 'customer_manage', label: 'Manage Customers', description: 'Add, edit, and view customer profiles' },
    { id: 'discount_apply', label: 'Apply Discounts', description: 'Apply discounts to transactions' },
    { id: 'refund_process', label: 'Process Refunds', description: 'Handle returns and refunds' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'cashier',
        permissions: user.permissions || []
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permissionId, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({ ...user, ...formData });
      setErrors({});
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1200 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Edit User</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
              placeholder="Enter full name"
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              placeholder="Enter email address"
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              required
              placeholder="Enter phone number"
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role <span className="text-error">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Permissions</h3>
            <CheckboxGroup label="Select user permissions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <Checkbox
                    key={permission.id}
                    label={permission.label}
                    description={permission.description}
                    checked={formData.permissions.includes(permission.id)}
                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                  />
                ))}
              </div>
            </CheckboxGroup>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;