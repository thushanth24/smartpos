import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TopHeader, { NavigationProvider } from '../../components/ui/TopHeader';
import MainSidebar from '../../components/ui/MainSidebar';
import ProductGrid from './components/ProductGrid';
import ShoppingCart from './components/ShoppingCart';
import PaymentSection from './components/PaymentSection';
import CustomerLookupModal from './components/CustomerLookupModal';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import Button from '../../components/ui/Button';

// Import services
import salesService from '../../utils/salesService';
import offlineService from '../../utils/offlineService';

const PointOfSaleTerminal = () => {
  const { user, userProfile } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customer, setCustomer] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [syncStatus, setSyncStatus] = useState('online');
  const [lastSync, setLastSync] = useState(new Date().toISOString());
  const [pendingTransactions, setPendingTransactions] = useState(0);
  const [activeView, setActiveView] = useState('products'); // For mobile: 'products' or 'cart'

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxRate = 0.085; // 8.5%
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + taxAmount;

  // Monitor network status and sync
  useEffect(() => {
    const updateSyncStatus = () => {
      const isOnline = navigator.onLine;
      setSyncStatus(isOnline ? 'online' : 'offline');
      
      // Get offline transaction count
      const offlineCount = offlineService.getOfflineTransactionCount();
      setPendingTransactions(offlineCount);
      
      if (isOnline) {
        setLastSync(new Date().toISOString());
      }
    };

    // Initial status check
    updateSyncStatus();

    // Listen for network changes
    window.addEventListener('online', updateSyncStatus);
    window.addEventListener('offline', updateSyncStatus);

    // Periodic sync status update
    const interval = setInterval(updateSyncStatus, 10000);

    return () => {
      window.removeEventListener('online', updateSyncStatus);
      window.removeEventListener('offline', updateSyncStatus);
      clearInterval(interval);
    };
  }, []);

  const handleAddToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });

    // Switch to cart view on mobile after adding item
    if (window.innerWidth < 768) {
      setActiveView('cart');
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCustomer(null);
    setDiscount(0);
  };

  const handleApplyDiscount = (discountPercent) => {
    setDiscount(Math.max(0, Math.min(100, discountPercent)));
  };

  const handleCustomerLookup = (selectedCustomer = null) => {
    if (selectedCustomer === null) {
      setIsCustomerModalOpen(true);
    } else {
      setCustomer(selectedCustomer);
    }
  };

  const handleCompleteSale = async (saleData) => {
    setIsProcessing(true);
    
    try {
      // Prepare transaction data
      const transactionData = {
        transaction_number: salesService.generateTransactionNumber(),
        receipt_number: salesService.generateReceiptNumber(),
        cashier_id: user?.id,
        customer_id: customer?.id || null,
        subtotal: subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: total,
        payment_method: saleData.paymentMethod,
        payment_reference: saleData.paymentReference || null,
        notes: saleData.notes || null,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          quantity: item.quantity,
          line_total: item.price * item.quantity
        }))
      };

      let result;
      
      if (navigator.onLine) {
        // Process sale online
        result = await salesService.processSale(transactionData);
      } else {
        // Save for offline sync
        result = await offlineService.saveOfflineTransaction(transactionData);
      }
      
      if (result?.success) {
        // Clear cart and reset
        handleClearCart();
        
        // Show success message
        const transactionId = result.data?.transaction_number || result.data?.offline_id;
        alert(`Sale ${navigator.onLine ? 'completed' : 'saved offline'} successfully!\nTransaction ID: ${transactionId}\nTotal: $${total.toFixed(2)}`);
        
        // Update pending transactions count
        if (!navigator.onLine) {
          setPendingTransactions(prev => prev + 1);
        }
      } else {
        throw new Error(result?.error || 'Transaction failed');
      }
      
    } catch (error) {
      console.log('Sale processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <NavigationProvider userRole={userProfile?.role || "cashier"}>
      <div className="min-h-screen bg-background">
        <TopHeader />
        <MainSidebar />
        
        {/* Main Content */}
        <main className="lg:ml-64 md:ml-16 pt-16 pb-16 md:pb-0">
          {/* Sync Status Bar */}
          <div className="p-4 border-b border-border bg-card">
            <SyncStatusIndicator 
              status={syncStatus}
              lastSync={lastSync}
              pendingTransactions={pendingTransactions}
            />
          </div>

          {/* Mobile View Toggle */}
          <div className="md:hidden border-b border-border bg-card">
            <div className="flex">
              <Button
                variant={activeView === 'products' ? 'default' : 'ghost'}
                className="flex-1 rounded-none border-r border-border"
                onClick={() => setActiveView('products')}
                iconName="Package"
                iconPosition="left"
              >
                Products
              </Button>
              <Button
                variant={activeView === 'cart' ? 'default' : 'ghost'}
                className="flex-1 rounded-none relative"
                onClick={() => setActiveView('cart')}
                iconName="ShoppingCart"
                iconPosition="left"
              >
                Cart
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex h-[calc(100vh-8rem)]">
            {/* Left Panel - Products */}
            <div className="flex-1 lg:w-3/5 border-r border-border">
              <ProductGrid
                onAddToCart={handleAddToCart}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>

            {/* Right Panel - Cart & Payment */}
            <div className="w-full lg:w-2/5 flex flex-col">
              <div className="flex-1">
                <ShoppingCart
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  subtotal={subtotal}
                  tax={taxAmount}
                  total={total}
                  onApplyDiscount={handleApplyDiscount}
                  discount={discountAmount}
                />
              </div>
              <PaymentSection
                total={total}
                onCompleteSale={handleCompleteSale}
                cartItems={cartItems}
                isProcessing={isProcessing}
                customer={customer}
                onCustomerLookup={handleCustomerLookup}
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden h-[calc(100vh-12rem)]">
            {activeView === 'products' ? (
              <ProductGrid
                onAddToCart={handleAddToCart}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <ShoppingCart
                    cartItems={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onClearCart={handleClearCart}
                    subtotal={subtotal}
                    tax={taxAmount}
                    total={total}
                    onApplyDiscount={handleApplyDiscount}
                    discount={discountAmount}
                  />
                </div>
                <PaymentSection
                  total={total}
                  onCompleteSale={handleCompleteSale}
                  cartItems={cartItems}
                  isProcessing={isProcessing}
                  customer={customer}
                  onCustomerLookup={handleCustomerLookup}
                />
              </div>
            )}
          </div>
        </main>

        {/* Customer Lookup Modal */}
        <CustomerLookupModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSelectCustomer={(selectedCustomer) => {
            setCustomer(selectedCustomer);
            setIsCustomerModalOpen(false);
          }}
        />
      </div>
    </NavigationProvider>
  );
};

export default PointOfSaleTerminal;