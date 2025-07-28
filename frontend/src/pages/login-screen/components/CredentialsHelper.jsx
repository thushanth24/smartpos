import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CredentialsHelper = () => {
  const [showCredentials, setShowCredentials] = useState(false);

  const credentials = [
    {
      role: 'Administrator',
      email: 'admin@modernpos.com',
      password: 'admin123',
      description: 'Full system access including user management, reports, and settings'
    },
    {
      role: 'Cashier',
      email: 'cashier@modernpos.com',
      password: 'cashier123',
      description: 'POS terminal access for processing sales and basic inventory viewing'
    }
  ];

  return (
    <div className="mt-6">
      <Button
        variant="ghost"
        onClick={() => setShowCredentials(!showCredentials)}
        className="w-full justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon name="HelpCircle" size={16} />
        Demo Credentials
        <Icon name={showCredentials ? 'ChevronUp' : 'ChevronDown'} size={16} />
      </Button>

      {showCredentials && (
        <div className="mt-4 space-y-3">
          {credentials.map((cred, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="User" size={16} className="text-primary" />
                <span className="font-medium text-foreground">{cred.role}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={14} className="text-muted-foreground" />
                  <span className="font-mono text-foreground">{cred.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Key" size={14} className="text-muted-foreground" />
                  <span className="font-mono text-foreground">{cred.password}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {cred.description}
                </p>
              </div>
            </div>
          ))}
          
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
              <div className="text-xs text-warning">
                <span className="font-medium">Demo Environment:</span> These are test credentials for demonstration purposes only.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialsHelper;