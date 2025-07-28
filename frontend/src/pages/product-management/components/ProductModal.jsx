import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProductModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  product, 
  categories,
  mode = 'add' // 'add', 'edit', 'duplicate'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    status: 'active',
    image: '',
    barcode: '',
    weight: '',
    dimensions: '',
    supplier: '',
    costPrice: '',
    taxRate: '0'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'duplicate')) {
      setFormData({
        ...product,
        sku: mode === 'duplicate' ? generateSKU() : product.sku,
        name: mode === 'duplicate' ? `${product.name} (Copy)` : product.name
      });
    } else {
      setFormData({
        name: '',
        description: '',
        sku: generateSKU(),
        category: '',
        price: '',
        stock: '',
        status: 'active',
        image: '',
        barcode: '',
        weight: '',
        dimensions: '',
        supplier: '',
        costPrice: '',
        taxRate: '0'
      });
    }
    setErrors({});
  }, [product, mode, isOpen]);

  const generateSKU = () => {
    return `SKU${Date.now().toString().slice(-6)}`;
  };

  const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
        taxRate: parseFloat(formData.taxRate),
        weight: formData.weight ? parseFloat(formData.weight) : 0
      });
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const modalTitle = {
    add: 'Add New Product',
    edit: 'Edit Product',
    duplicate: 'Duplicate Product'
  }[mode];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{modalTitle}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Product Image */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.image ? (
                    <Image
                      src={formData.image}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Icon name="ImagePlus" size={32} className="text-muted-foreground mx-auto mb-2" />
                      <span className="text-sm text-muted-foreground">Add Image</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Input
                  label="Product Image URL"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  description="Enter a valid image URL for the product"
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Product Name"
                type="text"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                required
              />

              <Input
                label="SKU"
                type="text"
                placeholder="Product SKU"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                error={errors.sku}
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Description"
                  type="text"
                  placeholder="Product description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <Select
                label="Category"
                options={categoryOptions}
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                error={errors.category}
                required
                placeholder="Select category"
              />

              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
              />
            </div>

            {/* Pricing & Inventory */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Selling Price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                error={errors.price}
                required
                min="0"
                step="0.01"
              />

              <Input
                label="Cost Price"
                type="number"
                placeholder="0.00"
                value={formData.costPrice}
                onChange={(e) => handleInputChange('costPrice', e.target.value)}
                min="0"
                step="0.01"
              />

              <Input
                label="Stock Quantity"
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                error={errors.stock}
                required
                min="0"
              />
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Barcode"
                type="text"
                placeholder="Product barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
              />

              <Input
                label="Supplier"
                type="text"
                placeholder="Supplier name"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
              />

              <Input
                label="Weight (kg)"
                type="number"
                placeholder="0.0"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                min="0"
                step="0.1"
              />

              <Input
                label="Tax Rate (%)"
                type="number"
                placeholder="0"
                value={formData.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                min="0"
                max="100"
                step="0.1"
              />

              <div className="md:col-span-2">
                <Input
                  label="Dimensions"
                  type="text"
                  placeholder="L x W x H (cm)"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-border bg-muted/30">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              iconName="Save"
              iconPosition="left"
            >
              {mode === 'add' ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;