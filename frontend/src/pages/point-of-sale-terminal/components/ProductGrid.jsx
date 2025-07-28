import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

// Import services
import productService from '../../../utils/productService';
import categoryService from '../../../utils/categoryService';

const ProductGrid = ({ 
  onAddToCart, 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory 
}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load products and categories
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Load categories and products in parallel
        const [categoriesResult, productsResult] = await Promise.all([
          categoryService.getCategories(),
          selectedCategory === 'all' 
            ? productService.getProducts()
            : productService.getProductsByCategory(selectedCategory)
        ]);

        if (isMounted) {
          if (categoriesResult?.success) {
            setCategories([
              { id: 'all', name: 'All Products', color: '#6366f1', icon: 'Grid' },
              ...categoriesResult.data
            ]);
          }

          if (productsResult?.success) {
            setProducts(productsResult.data || []);
          } else {
            setError(productsResult?.error || 'Failed to load products');
          }
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load data');
          console.log('Product grid loading error:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  // Search products
  useEffect(() => {
    let isMounted = true;
    
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        // If no search term, reload products based on category
        const result = selectedCategory === 'all' 
          ? await productService.getProducts()
          : await productService.getProductsByCategory(selectedCategory);
        
        if (isMounted && result?.success) {
          setProducts(result.data || []);
        }
        return;
      }

      try {
        const result = await productService.searchProducts(searchTerm);
        if (isMounted) {
          if (result?.success) {
            setProducts(result.data || []);
          } else {
            setError(result?.error || 'Search failed');
          }
        }
      } catch (error) {
        if (isMounted) {
          setError('Search failed');
          console.log('Product search error:', error);
        }
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchProducts, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchTerm(''); // Clear search when changing category
  };

  const handleAddToCart = (product) => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
      sku: product.sku,
      stock: product.stock_quantity
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <div className="p-4 border-b border-border bg-card">
        {/* Search Input */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search products by name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon="Search"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(category.id)}
              className="whitespace-nowrap"
              iconName={category.icon}
              iconPosition="left"
            >
              {category.name}
            </Button>
          ))}
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

      {/* Products Grid */}
      <div className="flex-1 overflow-auto p-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No products available in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAddToCart(product)}
              >
                {/* Product Image */}
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center bg-muted" style={{display: product.image_url ? 'none' : 'flex'}}>
                    <Icon name="Package" size={32} className="text-muted-foreground" />
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-primary">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.stock_quantity > product.min_stock_level 
                        ? 'bg-success/10 text-success' 
                        : product.stock_quantity > 0
                        ? 'bg-warning/10 text-warning' :'bg-error/10 text-error'
                    }`}>
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground">
                      SKU: {product.sku}
                    </p>
                  )}
                </div>

                {/* Add to Cart Overlay */}
                <div className="absolute inset-0 bg-primary/90 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-center text-primary-foreground">
                    <Icon name="Plus" size={24} className="mx-auto mb-2" />
                    <span className="text-sm font-medium">Add to Cart</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;