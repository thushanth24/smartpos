import React, { useState, useMemo, useEffect } from 'react';
import { NavigationProvider } from '../../components/ui/TopHeader';
import TopHeader from '../../components/ui/TopHeader';
import MainSidebar from '../../components/ui/MainSidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProductTable from './components/ProductTable';
import ProductFilters from './components/ProductFilters';
import ProductModal from './components/ProductModal';
import BulkActionsDropdown from './components/BulkActionsDropdown';
import InventoryAlerts from './components/InventoryAlerts';
import RecentStockMovements from './components/RecentStockMovements';
import BarcodeScanner from './components/BarcodeScanner';

const ProductManagement = () => {
  // Mock data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      description: "Premium noise-canceling wireless headphones with 30-hour battery life",
      sku: "SKU001",
      category: "Electronics",
      price: 199.99,
      costPrice: 120.00,
      stock: 45,
      status: "active",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      barcode: "1234567890123",
      weight: 0.3,
      dimensions: "20 x 18 x 8",
      supplier: "TechCorp Inc",
      taxRate: 8.5,
      createdAt: "2025-01-15T10:30:00Z",
      updatedAt: "2025-01-20T14:22:00Z"
    },
    {
      id: 2,
      name: "Smartphone Case",
      description: "Durable protective case with wireless charging compatibility",
      sku: "SKU002",
      category: "Accessories",
      price: 29.99,
      costPrice: 15.00,
      stock: 8,
      status: "active",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
      barcode: "9876543210987",
      weight: 0.1,
      dimensions: "16 x 8 x 1",
      supplier: "AccessoryWorld",
      taxRate: 8.5,
      createdAt: "2025-01-10T09:15:00Z",
      updatedAt: "2025-01-18T11:45:00Z"
    },
    {
      id: 3,
      name: "USB-C Cable",
      description: "High-speed USB-C to USB-C cable for fast charging and data transfer",
      sku: "SKU003",
      category: "Accessories",
      price: 19.99,
      costPrice: 8.00,
      stock: 0,
      status: "active",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      barcode: "5555666677778",
      weight: 0.05,
      dimensions: "100 x 2 x 1",
      supplier: "CableTech",
      taxRate: 8.5,
      createdAt: "2025-01-08T16:20:00Z",
      updatedAt: "2025-01-22T13:10:00Z"
    },
    {
      id: 4,
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with precision tracking",
      sku: "SKU004",
      category: "Electronics",
      price: 49.99,
      costPrice: 25.00,
      stock: 23,
      status: "active",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
      barcode: "1111222233334",
      weight: 0.12,
      dimensions: "12 x 6 x 4",
      supplier: "TechCorp Inc",
      taxRate: 8.5,
      createdAt: "2025-01-12T12:00:00Z",
      updatedAt: "2025-01-19T15:30:00Z"
    },
    {
      id: 5,
      name: "Bluetooth Speaker",
      description: "Portable waterproof Bluetooth speaker with rich bass",
      sku: "SKU005",
      category: "Electronics",
      price: 79.99,
      costPrice: 45.00,
      stock: 67,
      status: "inactive",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
      barcode: "4444555566667",
      weight: 0.8,
      dimensions: "18 x 8 x 8",
      supplier: "AudioMax",
      taxRate: 8.5,
      createdAt: "2025-01-05T14:45:00Z",
      updatedAt: "2025-01-17T10:20:00Z"
    }
  ]);

  const categories = ["Electronics", "Accessories", "Clothing", "Home & Garden", "Sports"];

  const [inventoryAlerts] = useState([
    {
      id: 1,
      productId: 3,
      productName: "USB-C Cable",
      sku: "SKU003",
      type: "out-of-stock",
      currentStock: 0,
      message: "Product is completely out of stock. Immediate restocking required."
    },
    {
      id: 2,
      productId: 2,
      productName: "Smartphone Case",
      sku: "SKU002",
      type: "low-stock",
      currentStock: 8,
      message: "Stock level is below minimum threshold of 10 units."
    }
  ]);

  const [recentMovements] = useState([
    {
      id: 1,
      productId: 1,
      productName: "Wireless Bluetooth Headphones",
      sku: "SKU001",
      type: "out",
      quantity: 5,
      newStock: 45,
      reason: "Sale transaction #TXN-2025-001",
      user: "John Doe",
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: 2,
      productId: 4,
      productName: "Wireless Mouse",
      sku: "SKU004",
      type: "in",
      quantity: 20,
      newStock: 23,
      reason: "Stock replenishment from supplier",
      user: "Admin",
      timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
    },
    {
      id: 3,
      productId: 2,
      productName: "Smartphone Case",
      sku: "SKU002",
      type: "adjustment",
      quantity: 2,
      newStock: 8,
      reason: "Inventory count correction",
      user: "Jane Smith",
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    }
  ]);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    stockLevel: 'all',
    status: 'all',
    minPrice: '',
    maxPrice: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = filters.category === 'all' || product.category === filters.category;

      // Stock level filter
      const matchesStock = filters.stockLevel === 'all' || 
        (filters.stockLevel === 'in-stock' && product.stock > 10) ||
        (filters.stockLevel === 'low-stock' && product.stock > 0 && product.stock <= 10) ||
        (filters.stockLevel === 'out-of-stock' && product.stock === 0);

      // Status filter
      const matchesStatus = filters.status === 'all' || product.status === filters.status;

      // Price filters
      const matchesMinPrice = !filters.minPrice || product.price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);

      return matchesSearch && matchesCategory && matchesStock && matchesStatus && matchesMinPrice && matchesMaxPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    });

    return filtered;
  }, [products, searchQuery, filters, sortConfig]);

  // Event handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      stockLevel: 'all',
      status: 'all',
      minPrice: '',
      maxPrice: ''
    });
    setSearchQuery('');
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(prev => 
      prev.length === filteredAndSortedProducts.length 
        ? [] 
        : filteredAndSortedProducts.map(p => p.id)
    );
  };

  const handleAddProduct = () => {
    setModalMode('add');
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDuplicateProduct = (product) => {
    setModalMode('duplicate');
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleArchiveProduct = (product) => {
    if (window.confirm(`Are you sure you want to archive "${product.name}"?`)) {
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, status: 'archived' } : p
      ));
    }
  };

  const handleSaveProduct = async (productData) => {
    if (modalMode === 'add' || modalMode === 'duplicate') {
      const newProduct = {
        ...productData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProducts(prev => [...prev, newProduct]);
    } else if (modalMode === 'edit') {
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...productData, id: editingProduct.id, updatedAt: new Date().toISOString() }
          : p
      ));
    }
  };

  const handleBulkUpdateCategory = () => {
    // Implementation for bulk category update
    console.log('Bulk update category for:', selectedProducts);
  };

  const handleBulkUpdateStatus = () => {
    // Implementation for bulk status update
    console.log('Bulk update status for:', selectedProducts);
  };

  const handleBulkExport = () => {
    // Implementation for bulk export
    console.log('Bulk export for:', selectedProducts);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to archive ${selectedProducts.length} products?`)) {
      setProducts(prev => prev.map(p => 
        selectedProducts.includes(p.id) ? { ...p, status: 'archived' } : p
      ));
      setSelectedProducts([]);
    }
  };

  const handleViewProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      handleEditProduct(product);
    }
  };

  const handleRestock = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = prompt(`Enter new stock quantity for ${product.name}:`, '50');
      if (newStock && !isNaN(newStock)) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, stock: parseInt(newStock) } : p
        ));
      }
    }
  };

  const handleBarcodeProductFound = (product) => {
    const existingProduct = products.find(p => p.barcode === product.barcode);
    if (existingProduct) {
      handleEditProduct(existingProduct);
    }
    setShowBarcodeScanner(false);
  };

  return (
    <NavigationProvider userRole="admin">
      <div className="min-h-screen bg-background">
        <TopHeader />
        <MainSidebar />
        
        {/* Main Content */}
        <main className="lg:ml-64 pt-16 pb-20 lg:pb-6">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage your product catalog, inventory, and pricing
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowBarcodeScanner(true)}
                    iconName="Scan"
                    iconPosition="left"
                  >
                    Scan Barcode
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleAddProduct}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Add Product
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Content Area */}
              <div className="xl:col-span-3 space-y-6">
                {/* Filters */}
                <ProductFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  categories={categories}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                {/* Table Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <BulkActionsDropdown
                      selectedCount={selectedProducts.length}
                      onBulkEdit={handleBulkUpdateCategory}
                      onBulkDelete={handleBulkDelete}
                      onBulkExport={handleBulkExport}
                      onBulkUpdateCategory={handleBulkUpdateCategory}
                      onBulkUpdateStatus={handleBulkUpdateStatus}
                      categories={categories}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Package" size={16} />
                    <span>
                      {filteredAndSortedProducts.length} of {products.length} products
                    </span>
                  </div>
                </div>

                {/* Products Table */}
                <ProductTable
                  products={filteredAndSortedProducts}
                  onEdit={handleEditProduct}
                  onDuplicate={handleDuplicateProduct}
                  onArchive={handleArchiveProduct}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  selectedProducts={selectedProducts}
                  onSelectProduct={handleSelectProduct}
                  onSelectAll={handleSelectAll}
                />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                <InventoryAlerts
                  alerts={inventoryAlerts}
                  onViewProduct={handleViewProduct}
                  onRestock={handleRestock}
                />
                
                <RecentStockMovements
                  movements={recentMovements}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
        {showProductModal && (
          <ProductModal
            isOpen={showProductModal}
            onClose={() => setShowProductModal(false)}
            onSave={handleSaveProduct}
            product={editingProduct}
            categories={categories}
            mode={modalMode}
          />
        )}

        {showBarcodeScanner && (
          <BarcodeScanner
            onProductFound={handleBarcodeProductFound}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}
      </div>
    </NavigationProvider>
  );
};

export default ProductManagement;