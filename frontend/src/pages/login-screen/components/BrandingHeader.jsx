import React from 'react';
import Icon from '../../../components/AppIcon';

const BrandingHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-elevation-1">
          <Icon name="Store" size={28} className="text-primary-foreground" />
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-bold text-foreground">ModernPOS</h1>
          <p className="text-sm text-muted-foreground">Point of Sale System</p>
        </div>
      </div>

     
    </div>
  );
};

export default BrandingHeader;