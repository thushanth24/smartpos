import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';



const InventoryTable = ({ 
  inventory, 
  onStockIn, 
  onStockOut, 
  onViewHistory, 
  searchTerm, 
  statusFilter, 
  categoryFilter,
  locationFilter 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
    });
  }, [inventory, searchTerm, statusFilter, categoryFilter, locationFilter]);

  const sortedInventory = useMemo(() => {
    if (!sortConfig.key) return filteredInventory;

    return [...filteredInventory].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredInventory, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusBadge = (status, stock, reorderPoint) => {
    let statusConfig;
    
    if (status === 'out_of_stock' || stock === 0) {
      statusConfig = {
        label: 'Out of Stock',
        className: 'bg-error/10 text-error border-error/20'
      };
    } else if (status === 'low_stock' || stock <= reorderPoint) {
      statusConfig = {
        label: 'Low Stock',
        className: 'bg-warning/10 text-warning border-warning/20'
      };
    } else {
      statusConfig = {
        label: 'In Stock',
        className: 'bg-success/10 text-success border-success/20'
      };
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
        {statusConfig.label}
      </span>
    );
  };

  const SortButton = ({ column, children }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 text-left font-medium text-foreground hover:text-primary transition-colors"
    >
      {children}
      <Icon 
        name={sortConfig.key === column 
          ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown')
          : 'ChevronsUpDown'
        } 
        size={14} 
        className="text-muted-foreground"
      />
    </button>
  );

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4">
                <SortButton column="name">Product</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton column="sku">SKU</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton column="category">Category</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton column="currentStock">Stock</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton column="reserved">Reserved</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton column="reorderPoint">Reorder Point</SortButton>
              </th>
              <th className="text-left p-4">
                <SortButton column="location">Location</SortButton>
              </th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">
                <SortButton column="lastUpdated">Last Updated</SortButton>
              </th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedInventory.map((item) => (
              <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Icon name="Package" size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground">${item.price}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground font-mono text-sm">{item.sku}</td>
                <td className="p-4 text-muted-foreground capitalize">{item.category}</td>
                <td className="p-4">
                  <span className="font-medium text-foreground">{item.currentStock}</span>
                </td>
                <td className="p-4 text-muted-foreground">{item.reserved}</td>
                <td className="p-4 text-muted-foreground">{item.reorderPoint}</td>
                <td className="p-4 text-muted-foreground capitalize">{item.location}</td>
                <td className="p-4">
                  {getStatusBadge(item.status, item.currentStock, item.reorderPoint)}
                </td>
                <td className="p-4 text-muted-foreground text-sm">{item.lastUpdated}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStockIn(item)}
                      className="text-success hover:text-success hover:bg-success/10"
                    >
                      <Icon name="Plus" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStockOut(item)}
                      className="text-warning hover:text-warning hover:bg-warning/10"
                    >
                      <Icon name="Minus" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewHistory(item)}
                    >
                      <Icon name="History" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedInventory.map((item) => (
          <div key={item.id} className="bg-background rounded-lg border border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.sku}</div>
                </div>
              </div>
              {getStatusBadge(item.status, item.currentStock, item.reorderPoint)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Stock</div>
                <div className="font-medium text-foreground">{item.currentStock}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Reserved</div>
                <div className="text-muted-foreground">{item.reserved}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Reorder Point</div>
                <div className="text-muted-foreground">{item.reorderPoint}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Location</div>
                <div className="text-muted-foreground capitalize">{item.location}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Updated: {item.lastUpdated}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStockIn(item)}
                  className="text-success hover:text-success hover:bg-success/10"
                >
                  <Icon name="Plus" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStockOut(item)}
                  className="text-warning hover:text-warning hover:bg-warning/10"
                >
                  <Icon name="Minus" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewHistory(item)}
                >
                  <Icon name="History" size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedInventory.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <div className="text-lg font-medium text-foreground mb-2">No inventory found</div>
          <div className="text-muted-foreground">Try adjusting your search or filter criteria</div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;