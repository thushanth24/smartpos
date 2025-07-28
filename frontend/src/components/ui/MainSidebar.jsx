import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useNavigation } from './TopHeader';

const MainSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, sidebarCollapsed } = useNavigation();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/sales-dashboard',
      icon: 'BarChart3',
      roles: ['admin', 'cashier'],
      tooltip: 'Sales overview and quick actions'
    },
    {
      label: 'POS Terminal',
      path: '/point-of-sale-terminal',
      icon: 'ShoppingCart',
      roles: ['admin', 'cashier'],
      tooltip: 'Process transactions and sales'
    },
    {
      label: 'Products',
      path: '/product-management',
      icon: 'Package',
      roles: ['admin'],
      tooltip: 'Manage product catalog'
    },
    {
      label: 'Inventory',
      path: '/inventory-management',
      icon: 'Warehouse',
      roles: ['admin'],
      tooltip: 'Track stock levels and orders'
    },
    {
      label: 'Users',
      path: '/user-management',
      icon: 'Users',
      roles: ['admin'],
      tooltip: 'Manage staff and permissions'
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border z-900 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } hidden lg:block`}>
        <nav className="p-4 space-y-2">
          {filteredItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <div key={item.path} className="relative group">
                <Button
                  variant={active ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 px-3 py-3 h-12 transition-smooth ${
                    active 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon 
                    name={item.icon} 
                    size={20} 
                    className={active ? 'text-primary-foreground' : 'text-current'}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Button>
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-elevation-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-1100 whitespace-nowrap">
                    <div className="text-sm font-medium text-popover-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.tooltip}</div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-900 lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {filteredItems.slice(0, 4).map((item) => {
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`flex flex-col items-center gap-1 px-3 py-2 h-16 min-w-0 flex-1 ${
                  active 
                    ? 'text-primary' :'text-muted-foreground'
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon 
                  name={item.icon} 
                  size={20} 
                  className={active ? 'text-primary' : 'text-current'}
                />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Button>
            );
          })}
          
          {/* More menu for additional items */}
          {filteredItems.length > 4 && (
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 px-3 py-2 h-16 min-w-0 flex-1 text-muted-foreground"
            >
              <Icon name="MoreHorizontal" size={20} />
              <span className="text-xs font-medium">More</span>
            </Button>
          )}
        </div>
      </nav>

      {/* Tablet Icon-only Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-16 bg-card border-r border-border z-900 hidden md:block lg:hidden">
        <nav className="p-2 space-y-2">
          {filteredItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <div key={item.path} className="relative group">
                <Button
                  variant={active ? 'default' : 'ghost'}
                  size="icon"
                  className={`w-12 h-12 ${
                    active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon 
                    name={item.icon} 
                    size={20} 
                    className={active ? 'text-primary-foreground' : 'text-current'}
                  />
                </Button>
                
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-elevation-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-1100 whitespace-nowrap">
                  <div className="text-sm font-medium text-popover-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.tooltip}</div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default MainSidebar;