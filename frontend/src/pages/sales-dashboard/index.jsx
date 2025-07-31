import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TopHeader, { NavigationProvider } from '../../components/ui/TopHeader';
import MainSidebar from '../../components/ui/MainSidebar';
import SalesMetricCard from './components/SalesMetricCard';
import RecentTransactionsList from './components/RecentTransactionsList';
import TopSellingProducts from './components/TopSellingProducts';

import QuickActionCards from './components/QuickActionCards';
import SalesChart from './components/SalesChart';
import Button from '../../components/ui/Button';

// Import services
import salesService from '../../utils/salesService';
import productService from '../../utils/productService';

const SalesDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log('user:', user);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [salesMetrics, setSalesMetrics] = useState({
    totalSales: 0,
    transactionCount: 0,
    averageTransaction: 0,
    cashierCount: 1
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  const [salesChartData, setSalesChartData] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load all dashboard data
        const [
          analyticsResult,
          transactionsResult,
          topProductsResult,
        ] = await Promise.all([
          salesService.getSalesAnalytics('today'),
          salesService.getRecentTransactions(10),
          salesService.getTopSellingProducts(5, 'week')
        ]);

        if (isMounted) {
          // Update sales metrics
          if (analyticsResult?.success) {
            setSalesMetrics({
              totalSales: analyticsResult.data.totalSales,
              transactionCount: analyticsResult.data.transactionCount,
              averageTransaction: analyticsResult.data.averageTransaction,
              cashierCount: 1 // This could be calculated from active users
            });
          }

          // Update recent transactions
          if (transactionsResult?.success) {
            setRecentTransactions(transactionsResult.data?.map(transaction => ({
              id: transaction.id,
              customerName: transaction.customer?.name || null,
              total: parseFloat(transaction.total_amount),
              paymentMethod: transaction.payment_method,
              itemCount: transaction.sale_items?.length || 0,
              receiptNumber: transaction.receipt_number,
              timestamp: new Date(transaction.created_at)
            })) || []);
          }

          // Update top selling products
          if (topProductsResult?.success) {
            setTopSellingProducts(topProductsResult.data?.map(product => ({
              id: product.id,
              name: product.name,
              image: `https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400`, // Default image
              soldQuantity: product.soldQuantity,
              price: product.price,
              revenue: product.revenue
            })) || []);
          }



          // Generate mock chart data (in real app, this would come from analytics)
          setSalesChartData([
            { name: 'Mon', sales: 420 },
            { name: 'Tue', sales: 380 },
            { name: 'Wed', sales: 520 },
            { name: 'Thu', sales: 460 },
            { name: 'Fri', sales: 680 },
            { name: 'Sat', sales: 890 },
            { name: 'Sun', sales: 750 }
          ]);
        }
      } catch (error) {
        console.log('Dashboard data loading error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Reload dashboard data
      const [
        analyticsResult,
        transactionsResult,
        topProductsResult,
      ] = await Promise.all([
        salesService.getSalesAnalytics('today'),
        salesService.getRecentTransactions(10),
        salesService.getTopSellingProducts(5, 'week')
      ]);

      // Update data (same logic as useEffect)
      if (analyticsResult?.success) {
        setSalesMetrics({
          totalSales: analyticsResult.data.totalSales,
          transactionCount: analyticsResult.data.transactionCount,
          averageTransaction: analyticsResult.data.averageTransaction,
          cashierCount: 1
        });
      }

      if (transactionsResult?.success) {
        setRecentTransactions(Array.isArray(transactionsResult.data)
          ? transactionsResult.data.map(transaction => ({
            id: transaction.id,
            customerName: transaction.customer?.name || null,
            total: parseFloat(transaction.total_amount),
            paymentMethod: transaction.payment_method,
            itemCount: transaction.sale_items?.length || 0,
            receiptNumber: transaction.receipt_number,
            timestamp: new Date(transaction.created_at)
          }))
          : []);
      }

      if (topProductsResult?.success) {
        setTopSellingProducts(Array.isArray(topProductsResult.data)
          ? topProductsResult.data.map(product => ({
            id: product.id,
            name: product.name,
            image: `https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400`,
            soldQuantity: product.soldQuantity,
            price: product.price,
            revenue: product.revenue
          }))
          : []);
      }
    } catch (error) {
      console.log('Dashboard refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewSale = () => {
    navigate('/point-of-sale-terminal');
  };

  const handleViewInventory = () => {
    navigate('/inventory-management');
  };

  const handleViewCustomers = () => {
    console.log('Navigate to customer management');
  };

  const handleViewReports = () => {
    console.log('Navigate to reports');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <NavigationProvider userRole={user?.role || "admin"}>
        <div className="min-h-screen bg-background">
          <TopHeader />
          <MainSidebar />
          <main className="lg:ml-64 pt-16 pb-20 lg:pb-8">
            <div className="p-6 flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </NavigationProvider>
    );
  }

  return (
    <NavigationProvider userRole={user?.role || "admin"}>
      <div className="min-h-screen bg-background">
        <TopHeader />
        <MainSidebar />
        
        {/* Main Content */}
        <main className="lg:ml-64 pt-16 pb-20 lg:pb-8">
          <div className="p-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Sales Dashboard</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                  <span>{formatDate(currentTime)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-mono">{formatTime(currentTime)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  iconName="RefreshCw"
                  loading={refreshing}
                  onClick={handleRefresh}
                  className="hidden sm:flex"
                >
                  Refresh
                </Button>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={handleNewSale}
                  className="bg-primary hover:bg-primary/90"
                >
                  New Sale
                </Button>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SalesMetricCard
                title="Today's Sales"
                value={`$${(salesMetrics.totalSales ?? 0).toLocaleString()}`}
                change="+12.5%"
                changeType="positive"
                icon="DollarSign"
                color="success"
              />
              <SalesMetricCard
                title="Transactions"
                value={(salesMetrics.transactionCount ?? 0).toString()}
                change="+8.2%"
                changeType="positive"
                icon="Receipt"
                color="primary"
              />
              <SalesMetricCard
                title="Avg. Transaction"
                value={`$${(salesMetrics.averageTransaction ?? 0).toFixed(2)}`}
                change="+3.1%"
                changeType="positive"
                icon="TrendingUp"
                color="primary"
              />
              <SalesMetricCard
                title="Active Cashiers"
                value={(salesMetrics.cashierCount ?? 0).toString()}
                change="0"
                changeType="neutral"
                icon="Users"
                color="warning"
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <QuickActionCards
                onNewSale={handleNewSale}
                onViewInventory={handleViewInventory}
                onViewCustomers={handleViewCustomers}
                onViewReports={handleViewReports}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Sales Chart - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <SalesChart data={salesChartData} period="week" />
              </div>
              
              {/* Top Selling Products */}
              <div>
                <TopSellingProducts products={topSellingProducts} />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Transactions - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <RecentTransactionsList transactions={recentTransactions} />
              </div>
              

            </div>
          </div>
        </main>
      </div>
    </NavigationProvider>
  );
};

export default SalesDashboard;