import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductTable = ({ 
  products, 
  onEdit, 
  onDuplicate, 
  onArchive, 
  sortConfig, 
  onSort,
  selectedProducts,
  onSelectProduct,
  onSelectAll 
}) => {
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return 'ArrowUpDown';
    return sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'text-success', bg: 'bg-success/10', label: 'Active' },
      inactive: { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Inactive' },
      archived: { color: 'text-error', bg: 'bg-error/10', label: 'Archived' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-error', label: 'Out of Stock' };
    if (stock <= 10) return { color: 'text-warning', label: 'Low Stock' };
    return { color: 'text-success', label: 'In Stock' };
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium text-foreground">Image</th>
              {[
                { key: 'name', label: 'Product Name' },
                { key: 'sku', label: 'SKU' },
                { key: 'category', label: 'Category' },
                { key: 'stock', label: 'Stock' },
                { key: 'price', label: 'Price' },
                { key: 'status', label: 'Status' }
              ].map(column => (
                <th key={column.key} className="text-left px-4 py-3 font-medium text-foreground">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => onSort(column.key)}
                  >
                    {column.label}
                    <Icon 
                      name={getSortIcon(column.key)} 
                      size={16} 
                      className="ml-2 text-muted-foreground" 
                    />
                  </Button>
                </th>
              ))}
              <th className="text-right px-4 py-3 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <tr 
                  key={product.id} 
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => onSelectProduct(product.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      {hoveredProduct === product.id && (
                        <div className="absolute top-0 left-16 z-50 bg-popover border border-border rounded-lg shadow-elevation-2 p-2">
                          <Image
                            src={product.image}
                            alt={product.name}
                            className="w-32 h-32 rounded-lg object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-foreground">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.description}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm text-muted-foreground">{product.sku}</td>
                  <td className="px-4 py-4 text-foreground">{product.category}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${stockStatus.color}`}>{product.stock}</span>
                      <span className={`text-xs ${stockStatus.color}`}>({stockStatus.label})</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-foreground">{formatPrice(product.price)}</td>
                  <td className="px-4 py-4">{getStatusBadge(product.status)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDuplicate(product)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="Copy" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onArchive(product)}
                        className="h-8 w-8 text-muted-foreground hover:text-error"
                      >
                        <Icon name="Archive" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-4 p-4">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          return (
            <div key={product.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => onSelectProduct(product.id)}
                  className="mt-1 rounded border-border"
                />
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="ml-2 font-mono">{product.sku}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <span className="ml-2 font-medium">{formatPrice(product.price)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className={`ml-2 font-medium ${stockStatus.color}`}>
                        {product.stock} ({stockStatus.label})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                      iconName="Edit"
                      iconPosition="left"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicate(product)}
                      iconName="Copy"
                      iconPosition="left"
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onArchive(product)}
                      iconName="Archive"
                      iconPosition="left"
                      className="text-error hover:text-error"
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductTable;