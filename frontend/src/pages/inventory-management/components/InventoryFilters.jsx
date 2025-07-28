import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const InventoryFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  locationFilter,
  onLocationChange,
  onStockIn,
  onStockOut,
  onBulkImport,
  onExport,
  syncStatus
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'books', label: 'Books' },
    { value: 'home', label: 'Home & Garden' }
  ];

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'main', label: 'Main Store' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'branch1', label: 'Branch 1' },
    { value: 'branch2', label: 'Branch 2' }
  ];

  const getSyncStatusIndicator = () => {
    switch (syncStatus) {
      case 'online':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full">
            <Icon name="Wifi" size={14} />
            <span className="text-xs font-medium">Online</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error rounded-full">
            <Icon name="WifiOff" size={14} />
            <span className="text-xs font-medium">Offline</span>
          </div>
        );
      case 'syncing':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-full">
            <Icon name="RefreshCw" size={14} className="animate-spin" />
            <span className="text-xs font-medium">Syncing</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      {/* Top Row - Search and Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {getSyncStatusIndicator()}
          
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={onStockIn}
              className="bg-success hover:bg-success/90 text-white"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              <span className="hidden sm:inline">Stock In</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={onStockOut}
              className="border-warning text-warning hover:bg-warning/10"
            >
              <Icon name="Minus" size={16} className="mr-2" />
              <span className="hidden sm:inline">Stock Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Select
          label="Status"
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusChange}
        />
        
        <Select
          label="Category"
          options={categoryOptions}
          value={categoryFilter}
          onChange={onCategoryChange}
        />
        
        <Select
          label="Location"
          options={locationOptions}
          value={locationFilter}
          onChange={onLocationChange}
        />
        
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            onClick={onBulkImport}
            className="flex-1"
          >
            <Icon name="Upload" size={16} className="mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onExport}
            className="flex-1"
          >
            <Icon name="Download" size={16} className="mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">1,247</div>
          <div className="text-sm text-muted-foreground">Total Products</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">1,089</div>
          <div className="text-sm text-muted-foreground">In Stock</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">142</div>
          <div className="text-sm text-muted-foreground">Low Stock</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-error">16</div>
          <div className="text-sm text-muted-foreground">Out of Stock</div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;