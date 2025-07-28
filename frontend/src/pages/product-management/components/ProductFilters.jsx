import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ProductFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  categories,
  searchQuery,
  onSearchChange 
}) => {
  const stockLevelOptions = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'in-stock', label: 'In Stock (>10)' },
    { value: 'low-stock', label: 'Low Stock (1-10)' },
    { value: 'out-of-stock', label: 'Out of Stock (0)' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  const hasActiveFilters = () => {
    return filters.category !== 'all' || 
           filters.stockLevel !== 'all' || 
           filters.status !== 'all' || 
           filters.minPrice || 
           filters.maxPrice ||
           searchQuery;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Input
            type="search"
            placeholder="Search products by name, SKU, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={filters.category}
          onChange={(value) => onFilterChange('category', value)}
        />

        <Select
          label="Stock Level"
          options={stockLevelOptions}
          value={filters.stockLevel}
          onChange={(value) => onFilterChange('stockLevel', value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Input
          label="Min Price"
          type="number"
          placeholder="0.00"
          value={filters.minPrice}
          onChange={(e) => onFilterChange('minPrice', e.target.value)}
          min="0"
          step="0.01"
        />

        <Input
          label="Max Price"
          type="number"
          placeholder="999.99"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          min="0"
          step="0.01"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters() && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Active filters applied
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;