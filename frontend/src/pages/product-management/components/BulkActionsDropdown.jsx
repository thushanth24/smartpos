import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionsDropdown = ({ 
  selectedCount, 
  onBulkEdit, 
  onBulkDelete, 
  onBulkExport, 
  onBulkUpdateCategory,
  onBulkUpdateStatus,
  categories 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const bulkActions = [
    {
      id: 'edit-category',
      label: 'Update Category',
      icon: 'Tag',
      action: onBulkUpdateCategory,
      description: 'Change category for selected products'
    },
    {
      id: 'edit-status',
      label: 'Update Status',
      icon: 'ToggleLeft',
      action: onBulkUpdateStatus,
      description: 'Change status for selected products'
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: 'Download',
      action: onBulkExport,
      description: 'Export selected products to CSV'
    },
    {
      id: 'delete',
      label: 'Archive Selected',
      icon: 'Archive',
      action: onBulkDelete,
      description: 'Archive selected products',
      variant: 'destructive'
    }
  ];

  if (selectedCount === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        iconName="ChevronDown"
        iconPosition="right"
        className="gap-2"
      >
        Bulk Actions ({selectedCount})
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-elevation-2 z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-popover-foreground border-b border-border mb-2">
                {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
              </div>
              
              {bulkActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  className={`w-full justify-start gap-3 px-3 py-2 text-sm ${
                    action.variant === 'destructive' ?'text-error hover:text-error hover:bg-error/10' :'text-popover-foreground hover:bg-muted'
                  }`}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                >
                  <Icon name={action.icon} size={16} />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkActionsDropdown;