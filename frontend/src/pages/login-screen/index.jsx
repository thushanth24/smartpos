import React from 'react';
import BrandingHeader from './components/BrandingHeader';
import LoginForm from './components/LoginForm';
import NetworkStatus from './components/NetworkStatus';

const LoginScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Network Status Indicator */}
      <NetworkStatus />
      
      {/* Main Login Container */}
      <div className="w-full max-w-lg">
        {/* Branding Header */}
        <BrandingHeader />
        
        {/* Login Form */}
        <LoginForm />

        
        
        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ModernPOS. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <span className="text-muted-foreground">•</span>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </button>
            <span className="text-muted-foreground">•</span>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;