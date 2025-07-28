import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TopHeader, { NavigationProvider } from '../../components/ui/TopHeader';
import MainSidebar from '../../components/ui/MainSidebar';
import UserCard from './components/UserCard';
import UserTable from './components/UserTable';
import AddUserModal from './components/AddUserModal';
import EditUserModal from './components/EditUserModal';
import ActivityPanel from './components/ActivityPanel';
import BulkActionsBar from './components/BulkActionsBar';
import PermissionMatrix from './components/PermissionMatrix';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table, cards, permissions
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Mock data
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.johnson@modernpos.com",
        phone: "+1 (555) 123-4567",
        role: "admin",
        status: "active",
        lastLogin: "2025-01-28 14:30",
        createdAt: "2024-12-15",
        permissions: ["pos_access", "inventory_view", "inventory_edit", "reports_view", "reports_export", "customer_manage", "discount_apply", "refund_process"]
      },
      {
        id: 2,
        name: "Michael Chen",
        email: "michael.chen@modernpos.com",
        phone: "+1 (555) 234-5678",
        role: "cashier",
        status: "active",
        lastLogin: "2025-01-28 16:15",
        createdAt: "2025-01-10",
        permissions: ["pos_access", "inventory_view", "customer_manage", "discount_apply"]
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        email: "emily.rodriguez@modernpos.com",
        phone: "+1 (555) 345-6789",
        role: "cashier",
        status: "active",
        lastLogin: "2025-01-28 12:45",
        createdAt: "2025-01-05",
        permissions: ["pos_access", "inventory_view", "customer_manage"]
      },
      {
        id: 4,
        name: "David Thompson",
        email: "david.thompson@modernpos.com",
        phone: "+1 (555) 456-7890",
        role: "admin",
        status: "inactive",
        lastLogin: "2025-01-25 09:20",
        createdAt: "2024-11-20",
        permissions: ["pos_access", "inventory_view", "inventory_edit", "reports_view", "customer_manage", "discount_apply", "refund_process"]
      },
      {
        id: 5,
        name: "Lisa Wang",
        email: "lisa.wang@modernpos.com",
        phone: "+1 (555) 567-8901",
        role: "cashier",
        status: "active",
        lastLogin: "2025-01-28 15:10",
        createdAt: "2025-01-15",
        permissions: ["pos_access", "inventory_view", "discount_apply"]
      }
    ];

    const mockActivities = [
      {
        id: 1,
        userId: 2,
        type: "login",
        action: "User Login",
        description: "Logged into POS terminal",
        timestamp: "2025-01-28 16:15",
        details: "IP: 192.168.1.100, Device: Chrome/Windows"
      },
      {
        id: 2,
        userId: 2,
        type: "sale",
        action: "Sale Transaction",
        description: "Processed sale #TXN-2025-0128-001",
        timestamp: "2025-01-28 16:10",
        details: "Amount: $45.99, Items: 3, Payment: Card"
      },
      {
        id: 3,
        userId: 2,
        type: "inventory",
        action: "Inventory Check",
        description: "Checked stock levels for Coffee Beans",
        timestamp: "2025-01-28 15:45",
        details: "Product: Premium Coffee Beans, Current Stock: 25 units"
      },
      {
        id: 4,
        userId: 2,
        type: "refund",
        action: "Refund Processed",
        description: "Processed refund for order #ORD-001234",
        timestamp: "2025-01-28 14:30",
        details: "Amount: $12.50, Reason: Defective item"
      },
      {
        id: 5,
        userId: 2,
        type: "logout",
        action: "User Logout",
        description: "Logged out from POS terminal",
        timestamp: "2025-01-28 13:00",
        details: "Session duration: 4h 15m"
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setActivities(mockActivities);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAddUser = (userData) => {
    const newUser = {
      ...userData,
      id: users.length + 1,
      status: 'active',
      lastLogin: 'Never',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    setShowAddModal(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleToggleStatus = (user) => {
    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
  };

  const handleResetPassword = (user) => {
    // Mock password reset
    alert(`Password reset link sent to ${user.email}`);
  };

  const handleViewActivity = (user) => {
    setSelectedUser(user);
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'activate':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'active' } : user
        ));
        break;
      case 'deactivate':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'inactive' } : user
        ));
        break;
      case 'role_cashier':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, role: 'cashier' } : user
        ));
        break;
      case 'role_admin':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, role: 'admin' } : user
        ));
        break;
    }
    setSelectedUsers([]);
  };

  const handlePermissionChange = (userId, permissionId, checked) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const permissions = checked 
          ? [...user.permissions, permissionId]
          : user.permissions.filter(p => p !== permissionId);
        return { ...user, permissions };
      }
      return user;
    }));
  };

  const userActivities = activities.filter(activity => 
    selectedUser ? activity.userId === selectedUser.id : false
  );

  return (
    <NavigationProvider userRole="admin">
      <div className="min-h-screen bg-background">
        <TopHeader />
        <MainSidebar />
        
        <main className="lg:ml-64 md:ml-16 pt-16 pb-20 lg:pb-4">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                  <p className="text-muted-foreground">Manage staff accounts, roles, and permissions</p>
                </div>
                <Button
                  onClick={() => setShowAddModal(true)}
                  iconName="UserPlus"
                  iconPosition="left"
                >
                  Add User
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="Users" size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{users.length}</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Icon name="UserCheck" size={20} className="text-success" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {users.filter(u => u.status === 'active').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon name="Shield" size={20} className="text-accent" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {users.filter(u => u.role === 'admin').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Administrators</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Icon name="User" size={20} className="text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {users.filter(u => u.role === 'cashier').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Cashiers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="flex-1 max-w-md">
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="cashier">Cashier</option>
                    </select>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    iconName="Table"
                  >
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    iconName="Grid3X3"
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'permissions' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('permissions')}
                    iconName="Shield"
                  >
                    Permissions
                  </Button>
                </div>
              </div>
            </div>

            <BulkActionsBar
              selectedUsers={selectedUsers}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedUsers([])}
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="xl:col-span-3">
                {viewMode === 'table' && (
                  <UserTable
                    users={filteredUsers}
                    onEdit={handleEditUser}
                    onToggleStatus={handleToggleStatus}
                    onResetPassword={handleResetPassword}
                    onViewActivity={handleViewActivity}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                )}

                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onEdit={handleEditUser}
                        onToggleStatus={handleToggleStatus}
                        onResetPassword={handleResetPassword}
                        onViewActivity={handleViewActivity}
                      />
                    ))}
                  </div>
                )}

                {viewMode === 'permissions' && (
                  <PermissionMatrix
                    users={filteredUsers}
                    onPermissionChange={handlePermissionChange}
                  />
                )}
              </div>

              {/* Activity Panel */}
              <div className="xl:col-span-1">
                <ActivityPanel
                  selectedUser={selectedUser}
                  activities={userActivities}
                  onClose={() => setSelectedUser(null)}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddUser}
        />

        <EditUserModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveUser}
          user={editingUser}
        />
      </div>
    </NavigationProvider>
  );
};

export default UserManagement;