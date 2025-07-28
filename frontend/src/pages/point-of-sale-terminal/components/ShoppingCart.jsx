import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ShoppingCart = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  subtotal,
  tax,
  total,
  onApplyDiscount,
  discount
}) => {
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Cart Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon name="ShoppingCart" size={20} />
            Shopping Cart ({cartItems.length})
          </h2>
          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              iconName="Trash2"
              iconPosition="left"
              className="text-error hover:text-error hover:bg-error/10"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Icon name="ShoppingCart" size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Cart is empty</h3>
            <p className="text-muted-foreground">Add products to start a transaction</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-muted/20 border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm mb-1 truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      ${item.price.toFixed(2)} each
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          iconName="Minus"
                        />
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          iconName="Plus"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onRemoveItem(item.id)}
                          iconName="X"
                          className="text-error hover:text-error hover:bg-error/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <div className="border-t border-border p-4 bg-muted/30">
          {/* Discount Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Percent" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Discount</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.00"
                className="flex-1"
                min="0"
                max="100"
                step="0.01"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onApplyDiscount}
                iconName="Check"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium text-success">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8.5%):</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-foreground">Total:</span>
                <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;