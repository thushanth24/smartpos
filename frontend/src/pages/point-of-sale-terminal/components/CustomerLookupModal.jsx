import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

// Import services
import customerService from '../../../utils/customerService';

const CustomerLookupModal = ({ isOpen, onClose, onSelectCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Load customers when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  // Search customers when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      loadCustomers();
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await customerService.searchCustomers(searchTerm);
        
        if (result?.success) {
          setCustomers(result.data || []);
          setError('');
        } else {
          setError(result?.error || 'Search failed');
        }
      } catch (error) {
        setError('Search failed');
        console.log('Customer search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await customerService.getCustomers();
      
      if (result?.success) {
        setCustomers(result.data || []);
      } else {
        setError(result?.error || 'Failed to load customers');
      }
    } catch (error) {
      setError('Failed to load customers');
      console.log('Customer loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    onSelectCustomer(customer);
    handleClose();
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const result = await customerService.createCustomer(newCustomer);
      
      if (result?.success) {
        // Add new customer to list and select it
        setCustomers(prev => [result.data, ...prev]);
        onSelectCustomer(result.data);
        handleClose();
      } else {
        setError(result?.error || 'Failed to create customer');
      }
    } catch (error) {
      setError('Failed to create customer');
      console.log('Customer creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setShowAddForm(false);
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {showAddForm ? 'Add New Customer' : 'Select Customer'}
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {showAddForm ? (
            /* Add Customer Form */
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <Input
                label="Customer Name"
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Enter customer name"
              />
              
              <Input
                label="Email Address"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                placeholder="customer@example.com"
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1-555-0123"
              />
              
              <Input
                label="Address"
                type="text"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main St, City, State 12345"
              />

              {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertCircle" size={16} className="text-error" />
                    <span className="text-sm text-error">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Back to Search
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  loading={loading}
                  className="flex-1"
                >
                  Add Customer
                </Button>
              </div>
            </form>
          ) : (
            /* Customer Search and List */
            <div className="flex flex-col h-full">
              {/* Search */}
              <div className="p-6 border-b border-border">
                <Input
                  type="text"
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="Search"
                />
                
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSelectCustomer(null)}
                    className="flex-1"
                    iconName="User"
                    iconPosition="left"
                  >
                    Continue without Customer
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setShowAddForm(true)}
                    className="flex-1"
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Add New Customer
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-error/10 border-b border-error/20">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertCircle" size={16} className="text-error" />
                    <span className="text-sm text-error">{error}</span>
                  </div>
                </div>
              )}

              {/* Customer List */}
              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search terms' : 'No customers in database'}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{customer.name}</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {customer.email && <p>📧 {customer.email}</p>}
                              {customer.phone && <p>📞 {customer.phone}</p>}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="text-foreground font-medium">
                              ${(customer.total_spent || 0).toFixed(2)} spent
                            </div>
                            <div className="text-muted-foreground">
                              {customer.loyalty_points || 0} points
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLookupModal;