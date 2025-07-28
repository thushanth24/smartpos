import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const NavigationContext = React.createContext();

export const NavigationProvider = ({ children, userRole = 'admin', user = null }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [syncStatus, setSyncStatus] = useState('online'); // online, offline, syncing

  const value = {
    userRole,
    user: user || { name: 'John Doe', email: 'john@modernpos.com', role: userRole },
    sidebarCollapsed,
    setSidebarCollapsed,
    syncStatus,
    setSyncStatus,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

const SyncStatusIndicator = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: 'Wifi',
          color: 'text-success',
          bgColor: 'bg-success/10',
          label: 'Online',
        };
      case 'offline':
        return {
          icon: 'WifiOff',
          color: 'text-error',
          bgColor: 'bg-error/10',
          label: 'Offline',
        };
      case 'syncing':
        return {
          icon: 'RefreshCw',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          label: 'Syncing',
        };
      default:
        return {
          icon: 'Wifi',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
      <Icon 
        name={config.icon} 
        size={16} 
        className={`${config.color} ${status === 'syncing' ? 'animate-spin' : ''}`}
      />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

const TopHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sidebarCollapsed, setSidebarCollapsed, syncStatus } = useNavigation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/login-screen');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-1000">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section - Logo and Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Store" size={20} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">ModernPOS</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Icon name="Menu" size={20} />
          </Button>
        </div>

        {/* Right Section - Sync Status and User Menu */}
        <div className="flex items-center gap-4">
          <SyncStatusIndicator status={syncStatus} />
          
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-muted"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} className="text-primary-foreground" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
              </div>
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-elevation-2 z-1100">
                <div className="p-3 border-b border-border">
                  <div className="text-sm font-medium text-popover-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
                <div className="p-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-2 text-sm"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/user-management');
                    }}
                  >
                    <Icon name="Settings" size={16} />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-2 text-sm"
                    onClick={() => {
                      setUserMenuOpen(false);
                    }}
                  >
                    <Icon name="HelpCircle" size={16} />
                    Help & Support
                  </Button>
                  <div className="border-t border-border my-1"></div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-2 text-sm text-error hover:text-error hover:bg-error/10"
                    onClick={handleLogout}
                  >
                    <Icon name="LogOut" size={16} />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;