import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const StockAdjustmentModal = ({ 
  isOpen, 
  onClose, 
  product, 
  type, // 'in' or 'out'
  onConfirm 
}) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const reasonOptions = type === 'in' ? [
    { value: 'purchase', label: 'Purchase Order' },
    { value: 'return', label: 'Customer Return' },
    { value: 'adjustment', label: 'Stock Adjustment' },
    { value: 'transfer', label: 'Location Transfer' },
    { value: 'production', label: 'Production' }
  ] : [
    { value: 'sale', label: 'Sale' },
    { value: 'damage', label: 'Damaged Goods' },
    { value: 'theft', label: 'Theft/Loss' },
    { value: 'expired', label: 'Expired Items' },
    { value: 'transfer', label: 'Location Transfer' },
    { value: 'adjustment', label: 'Stock Adjustment' }
  ];

  const locationOptions = [
    { value: 'main', label: 'Main Store' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'branch1', label: 'Branch 1' },
    { value: 'branch2', label: 'Branch 2' }
  ];

  useEffect(() => {
    if (isOpen && product) {
      setLocation(product.location || 'main');
      setQuantity('');
      setReason('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen, product]);

  const validateForm = () => {
    const newErrors = {};

    if (!quantity || parseInt(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }

    if (type === 'out' && parseInt(quantity) > product?.currentStock) {
      newErrors.quantity = 'Quantity cannot exceed current stock';
    }

    if (!reason) {
      newErrors.reason = 'Please select a reason';
    }

    if (!location) {
      newErrors.location = 'Please select a location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const adjustmentData = {
      productId: product.id,
      type,
      quantity: parseInt(quantity),
      reason,
      location,
      notes,
      timestamp: new Date().toISOString(),
      user: 'Current User' // In real app, get from auth context
    };

    onConfirm(adjustmentData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Stock {type === 'in' ? 'In' : 'Out'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {product?.name} ({product?.sku})
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Stock Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Stock:</span>
              <span className="font-medium text-foreground">{product?.currentStock || 0}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Reserved:</span>
              <span className="text-muted-foreground">{product?.reserved || 0}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Available:</span>
              <span className="font-medium text-foreground">
                {(product?.currentStock || 0) - (product?.reserved || 0)}
              </span>
            </div>
          </div>

          <Input
            label="Quantity"
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            error={errors.quantity}
            required
            min="1"
          />

          <Select
            label="Reason"
            placeholder="Select reason"
            options={reasonOptions}
            value={reason}
            onChange={setReason}
            error={errors.reason}
            required
          />

          <Select
            label="Location"
            placeholder="Select location"
            options={locationOptions}
            value={location}
            onChange={setLocation}
            error={errors.location}
            required
          />

          <Input
            label="Notes (Optional)"
            type="text"
            placeholder="Additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Preview */}
          {quantity && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm font-medium text-foreground mb-2">Preview:</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {type === 'in' ? 'New Stock:' : 'Remaining Stock:'}
                </span>
                <span className={`font-medium ${
                  type === 'in' ?'text-success' 
                    : (product?.currentStock - parseInt(quantity)) <= product?.reorderPoint 
                      ? 'text-warning' :'text-foreground'
                }`}>
                  {type === 'in' 
                    ? (product?.currentStock || 0) + parseInt(quantity)
                    : (product?.currentStock || 0) - parseInt(quantity)
                  }
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={type === 'in' ? 'default' : 'warning'}
              className="flex-1"
            >
              <Icon name={type === 'in' ? 'Plus' : 'Minus'} size={16} className="mr-2" />
              Confirm {type === 'in' ? 'Stock In' : 'Stock Out'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;