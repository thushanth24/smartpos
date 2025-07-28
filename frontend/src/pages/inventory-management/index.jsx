import React, { useState, useEffect } from 'react';
import TopHeader, { NavigationProvider } from '../../components/ui/TopHeader';
import MainSidebar from '../../components/ui/MainSidebar';
import InventoryTable from './components/InventoryTable';
import StockAdjustmentModal from './components/StockAdjustmentModal';
import StockAlertsPanel from './components/StockAlertsPanel';
import StockHistoryModal from './components/StockHistoryModal';
import BulkImportModal from './components/BulkImportModal';
import InventoryFilters from './components/InventoryFilters';

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState('in');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('online');

  // Mock inventory data
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      sku: "ELEC001",
      category: "electronics",
      price: 99.99,
      currentStock: 45,
      reserved: 5,
      reorderPoint: 10,
      location: "main",
      status: "in_stock",
      lastUpdated: "2025-01-28 14:30"
    },
    {
      id: 2,
      name: "Cotton T-Shirt - Blue",
      sku: "CLOTH002",
      category: "clothing",
      price: 19.99,
      currentStock: 8,
      reserved: 2,
      reorderPoint: 15,
      location: "main",
      status: "low_stock",
      lastUpdated: "2025-01-28 12:15"
    },
    {
      id: 3,
      name: "Organic Coffee Beans",
      sku: "FOOD003",
      category: "food",
      price: 12.99,
      currentStock: 0,
      reserved: 0,
      reorderPoint: 20,
      location: "warehouse",
      status: "out_of_stock",
      lastUpdated: "2025-01-27 16:45"
    },
    {
      id: 4,
      name: "JavaScript Programming Book",
      sku: "BOOK004",
      category: "books",
      price: 29.99,
      currentStock: 25,
      reserved: 3,
      reorderPoint: 5,
      location: "main",
      status: "in_stock",
      lastUpdated: "2025-01-28 10:20"
    },
    {
      id: 5,
      name: "Garden Plant Pot",
      sku: "HOME005",
      category: "home",
      price: 15.99,
      currentStock: 12,
      reserved: 1,
      reorderPoint: 8,
      location: "branch1",
      status: "in_stock",
      lastUpdated: "2025-01-28 09:30"
    },
    {
      id: 6,
      name: "Smartphone Case",
      sku: "ELEC006",
      category: "electronics",
      price: 24.99,
      currentStock: 3,
      reserved: 0,
      reorderPoint: 10,
      location: "main",
      status: "low_stock",
      lastUpdated: "2025-01-28 11:45"
    },
    {
      id: 7,
      name: "Running Shoes",
      sku: "CLOTH007",
      category: "clothing",
      price: 89.99,
      currentStock: 18,
      reserved: 2,
      reorderPoint: 5,
      location: "branch2",
      status: "in_stock",
      lastUpdated: "2025-01-28 13:20"
    },
    {
      id: 8,
      name: "Energy Drink",
      sku: "FOOD008",
      category: "food",
      price: 2.99,
      currentStock: 0,
      reserved: 0,
      reorderPoint: 50,
      location: "main",
      status: "out_of_stock",
      lastUpdated: "2025-01-27 18:30"
    }
  ]);

  // Mock stock alerts
  const [stockAlerts, setStockAlerts] = useState([
    {
      id: 1,
      type: "out_of_stock",
      productName: "Organic Coffee Beans",
      productId: 3,
      message: "Product is completely out of stock",
      location: "Warehouse",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      type: "low_stock",
      productName: "Cotton T-Shirt - Blue",
      productId: 2,
      message: "Stock level is below reorder point (8/15)",
      location: "Main Store",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      type: "reorder_suggested",
      productName: "Smartphone Case",
      productId: 6,
      message: "Consider reordering - only 3 units remaining",
      location: "Main Store",
      timestamp: "6 hours ago"
    },
    {
      id: 4,
      type: "out_of_stock",
      productName: "Energy Drink",
      productId: 8,
      message: "Product is completely out of stock",
      location: "Main Store",
      timestamp: "1 day ago"
    }
  ]);

  // Mock stock history
  const stockHistory = [
    {
      type: "in",
      quantity: 50,
      reason: "purchase",
      location: "main",
      user: "John Doe",
      timestamp: "2025-01-28T10:30:00Z",
      notes: "Weekly stock replenishment",
      balanceAfter: 45
    },
    {
      type: "out",
      quantity: 5,
      reason: "sale",
      location: "main",
      user: "System",
      timestamp: "2025-01-28T14:15:00Z",
      notes: "Customer purchase",
      balanceAfter: 40
    },
    {
      type: "adjustment",
      quantity: 2,
      reason: "damage",
      location: "main",
      user: "Jane Smith",
      timestamp: "2025-01-27T16:20:00Z",
      notes: "Damaged during transport",
      balanceAfter: 38
    },
    {
      type: "in",
      quantity: 25,
      reason: "return",
      location: "main",
      user: "Mike Johnson",
      timestamp: "2025-01-26T11:45:00Z",
      notes: "Customer return - unopened",
      balanceAfter: 40
    }
  ];

  // Simulate network status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ['online', 'offline', 'syncing'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setSyncStatus(randomStatus);
    }, 30000); // Change every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStockIn = (product = null) => {
    setSelectedProduct(product);
    setAdjustmentType('in');
    setAdjustmentModalOpen(true);
  };

  const handleStockOut = (product = null) => {
    setSelectedProduct(product);
    setAdjustmentType('out');
    setAdjustmentModalOpen(true);
  };

  const handleViewHistory = (product) => {
    setSelectedProduct(product);
    setHistoryModalOpen(true);
  };

  const handleStockAdjustment = (adjustmentData) => {
    // Update inventory based on adjustment
    setInventory(prev => prev.map(item => {
      if (item.id === adjustmentData.productId) {
        const newStock = adjustmentData.type === 'in' 
          ? item.currentStock + adjustmentData.quantity
          : item.currentStock - adjustmentData.quantity;
        
        let newStatus = 'in_stock';
        if (newStock === 0) {
          newStatus = 'out_of_stock';
        } else if (newStock <= item.reorderPoint) {
          newStatus = 'low_stock';
        }

        return {
          ...item,
          currentStock: Math.max(0, newStock),
          status: newStatus,
          lastUpdated: new Date().toLocaleString()
        };
      }
      return item;
    }));

    // Update alerts if necessary
    if (adjustmentData.type === 'out') {
      const product = inventory.find(p => p.id === adjustmentData.productId);
      if (product) {
        const newStock = product.currentStock - adjustmentData.quantity;
        if (newStock === 0) {
          setStockAlerts(prev => [...prev, {
            id: Date.now(),
            type: "out_of_stock",
            productName: product.name,
            productId: product.id,
            message: "Product is completely out of stock",
            location: adjustmentData.location,
            timestamp: "Just now"
          }]);
        } else if (newStock <= product.reorderPoint) {
          setStockAlerts(prev => [...prev, {
            id: Date.now(),
            type: "low_stock",
            productName: product.name,
            productId: product.id,
            message: `Stock level is below reorder point (${newStock}/${product.reorderPoint})`,
            location: adjustmentData.location,
            timestamp: "Just now"
          }]);
        }
      }
    }
  };

  const handleReorder = (alert) => {
    console.log('Reorder requested for:', alert);
    // In a real app, this would trigger a purchase order
  };

  const handleDismissAlert = (alertId) => {
    setStockAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleBulkImport = (results) => {
    console.log('Import results:', results);
    // In a real app, this would update the inventory with imported data
  };

  const handleExport = () => {
    // Generate CSV content
    const headers = ['SKU', 'Name', 'Category', 'Price', 'Current Stock', 'Reserved', 'Reorder Point', 'Location', 'Status', 'Last Updated'];
    const csvContent = [
      headers.join(','),
      ...inventory.map(item => [
        item.sku,
        `"${item.name}"`,
        item.category,
        item.price,
        item.currentStock,
        item.reserved,
        item.reorderPoint,
        item.location,
        item.status,
        `"${item.lastUpdated}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <NavigationProvider userRole="admin">
      <div className="min-h-screen bg-background">
        <TopHeader />
        <MainSidebar />
        
        <main className="lg:ml-64 pt-16 pb-20 lg:pb-8">
          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
                <p className="text-muted-foreground">
                  Track stock levels, manage inventory, and monitor alerts
                </p>
              </div>
            </div>

            {/* Filters and Actions */}
            <InventoryFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              locationFilter={locationFilter}
              onLocationChange={setLocationFilter}
              onStockIn={() => handleStockIn()}
              onStockOut={() => handleStockOut()}
              onBulkImport={() => setBulkImportModalOpen(true)}
              onExport={handleExport}
              syncStatus={syncStatus}
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Inventory Table */}
              <div className="xl:col-span-3">
                <InventoryTable
                  inventory={inventory}
                  onStockIn={handleStockIn}
                  onStockOut={handleStockOut}
                  onViewHistory={handleViewHistory}
                  searchTerm={searchTerm}
                  statusFilter={statusFilter}
                  categoryFilter={categoryFilter}
                  locationFilter={locationFilter}
                />
              </div>

              {/* Stock Alerts Panel */}
              <div className="xl:col-span-1">
                <StockAlertsPanel
                  alerts={stockAlerts}
                  onReorder={handleReorder}
                  onDismiss={handleDismissAlert}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
        <StockAdjustmentModal
          isOpen={adjustmentModalOpen}
          onClose={() => setAdjustmentModalOpen(false)}
          product={selectedProduct}
          type={adjustmentType}
          onConfirm={handleStockAdjustment}
        />

        <StockHistoryModal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          product={selectedProduct}
          history={stockHistory}
        />

        <BulkImportModal
          isOpen={bulkImportModalOpen}
          onClose={() => setBulkImportModalOpen(false)}
          onImport={handleBulkImport}
        />
      </div>
    </NavigationProvider>
  );
};

export default InventoryManagement;