import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PaymentSection = ({ 
  total, 
  onCompleteSale, 
  cartItems, 
  isProcessing,
  customer,
  onCustomerLookup 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [splitPayments, setSplitPayments] = useState([]);
  const [receiptOptions, setReceiptOptions] = useState({
    print: true,
    email: false,
    sms: false
  });

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'split', label: 'Split Payment' }
  ];

  const calculateChange = () => {
    if (paymentMethod === 'cash' && cashReceived) {
      const received = parseFloat(cashReceived) || 0;
      return Math.max(0, received - total);
    }
    return 0;
  };

  const handleCompleteSale = () => {
    const saleData = {
      items: cartItems,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
      change: calculateChange(),
      customer,
      receiptOptions,
      timestamp: new Date().toISOString()
    };
    
    onCompleteSale(saleData);
  };

  const isPaymentValid = () => {
    if (cartItems.length === 0) return false;
    
    switch (paymentMethod) {
      case 'cash':
        return parseFloat(cashReceived) >= total;
      case 'card':
        return cardNumber.length >= 4;
      case 'split':
        return splitPayments.reduce((sum, p) => sum + p.amount, 0) >= total;
      default:
        return false;
    }
  };

  return (
    <div className="bg-card border-t border-border p-4">
      {/* Customer Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <Icon name="User" size={16} />
            Customer
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCustomerLookup}
            iconName="Search"
            iconPosition="left"
          >
            Lookup
          </Button>
        </div>
        {customer ? (
          <div className="bg-muted/20 border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
                {customer.loyaltyPoints && (
                  <p className="text-xs text-success">
                    {customer.loyaltyPoints} loyalty points available
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onCustomerLookup(null)}
                iconName="X"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Walk-in customer</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-4">
        <Select
          label="Payment Method"
          options={paymentMethods}
          value={paymentMethod}
          onChange={setPaymentMethod}
          className="mb-3"
        />

        {paymentMethod === 'cash' && (
          <div className="space-y-3">
            <Input
              label="Cash Received"
              type="number"
              placeholder="0.00"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              min="0"
              step="0.01"
            />
            {cashReceived && (
              <div className="bg-muted/20 border border-border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Change Due:</span>
                  <span className="text-lg font-bold text-success">
                    ${calculateChange().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="space-y-3">
            <Input
              label="Card Number (Last 4 digits)"
              type="text"
              placeholder="****"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength="4"
            />
            <div className="bg-muted/20 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="CreditCard" size={16} />
                <span>Card payment will be processed at terminal</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Options */}
      <div className="mb-4">
        <span className="text-sm font-medium text-foreground mb-2 block">Receipt Options</span>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={receiptOptions.print ? "default" : "outline"}
            size="sm"
            onClick={() => setReceiptOptions(prev => ({ ...prev, print: !prev.print }))}
            iconName="Printer"
            iconPosition="left"
          >
            Print
          </Button>
          <Button
            variant={receiptOptions.email ? "default" : "outline"}
            size="sm"
            onClick={() => setReceiptOptions(prev => ({ ...prev, email: !prev.email }))}
            iconName="Mail"
            iconPosition="left"
          >
            Email
          </Button>
          <Button
            variant={receiptOptions.sms ? "default" : "outline"}
            size="sm"
            onClick={() => setReceiptOptions(prev => ({ ...prev, sms: !prev.sms }))}
            iconName="MessageSquare"
            iconPosition="left"
          >
            SMS
          </Button>
        </div>
      </div>

      {/* Complete Sale Button */}
      <Button
        variant="default"
        size="lg"
        fullWidth
        onClick={handleCompleteSale}
        disabled={!isPaymentValid() || isProcessing}
        loading={isProcessing}
        iconName="CreditCard"
        iconPosition="left"
        className="bg-success hover:bg-success/90 text-white font-semibold py-4"
      >
        {isProcessing ? 'Processing...' : `Complete Sale - $${total.toFixed(2)}`}
      </Button>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          iconName="UserPlus"
          iconPosition="left"
        >
          New Customer
        </Button>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          iconName="Clock"
          iconPosition="left"
        >
          Hold Transaction
        </Button>
      </div>
    </div>
  );
};

export default PaymentSection;