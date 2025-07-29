import { DataTypes } from 'sequelize';
import ApiError from '../utils/ApiError.js';
import sequelize from '../config/db.js';

// Define the Product model
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  barcode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
    defaultValue: 'active',
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true, // Enable soft deletes
  deletedAt: 'deleted_at',
});

// Add static methods to the Product model
Object.assign(Product, {
  // Create a new product
  async createProduct(productData) {
    try {
      const product = await this.create(productData);
      return product.get({ plain: true });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        if (error.fields.sku) {
          throw new ApiError(400, 'SKU already in use');
        }
        if (error.fields.barcode) {
          throw new ApiError(400, 'Barcode already in use');
        }
      }
      throw new ApiError(500, `Error creating product: ${error.message}`);
    }
  },

  // Get all products with optional filters
  async findAllProducts(filters = {}) {
    try {
      const where = {};
      
      // Apply filters
      if (filters.category) {
        where.category = filters.category;
      }
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.minPrice) {
        where.price = {
          ...where.price,
          [sequelize.Op.gte]: parseFloat(filters.minPrice),
        };
      }
      
      if (filters.maxPrice) {
        where.price = {
          ...where.price,
          [sequelize.Op.lte]: parseFloat(filters.maxPrice),
        };
      }
      
      if (filters.search) {
        where[sequelize.Op.or] = [
          { name: { [sequelize.Op.iLike]: `%${filters.search}%` } },
          { description: { [sequelize.Op.iLike]: `%${filters.search}%` } },
          { sku: { [sequelize.Op.iLike]: `%${filters.search}%` } },
        ];
      }
      
      // Sorting
      const order = [];
      if (filters.sortBy) {
        const [field, direction] = filters.sortBy.split(':');
        order.push([field, direction.toUpperCase()]);
      } else {
        // Default sorting
        order.push(['name', 'ASC']);
      }
      
      // Pagination
      const page = parseInt(filters.page, 10) || 1;
      const limit = parseInt(filters.limit, 10) || 10;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await this.findAndCountAll({
        where,
        order,
        limit,
        offset,
        paranoid: filters.includeDeleted ? false : true, // Include soft-deleted if requested
      });
      
      return {
        data: rows.map(row => row.get({ plain: true })),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new ApiError(500, `Error fetching products: ${error.message}`);
    }
  },

  // Find product by ID
  async findProductById(id, options = {}) {
    try {
      const product = await this.findByPk(id, {
        paranoid: options.includeDeleted ? false : true,
      });
      
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }
      
      return product.get({ plain: true });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error fetching product: ${error.message}`);
    }
  },

  // Update product
  async updateProduct(id, updateData) {
    const transaction = await sequelize.transaction();
    
    try {
      const product = await this.findByPk(id, { transaction });
      
      if (!product) {
        await transaction.rollback();
        throw new ApiError(404, 'Product not found');
      }
      
      // Update product
      await product.update(updateData, { transaction });
      await transaction.commit();
      
      return product.get({ plain: true });
    } catch (error) {
      await transaction.rollback();
      
      if (error instanceof ApiError) throw error;
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        if (error.fields.sku) {
          throw new ApiError(400, 'SKU already in use');
        }
        if (error.fields.barcode) {
          throw new ApiError(400, 'Barcode already in use');
        }
      }
      
      throw new ApiError(500, `Error updating product: ${error.message}`);
    }
  },

  // Delete product (soft delete)
  async deleteProduct(id) {
    try {
      const product = await this.findByPk(id);
      
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }
      
      await product.destroy();
      
      return { message: 'Product deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error deleting product: ${error.message}`);
    }
  },
  
  // Update product stock
  async updateStock(id, quantity) {
    const transaction = await sequelize.transaction();
    
    try {
      const product = await this.findByPk(id, { transaction, lock: true });
      
      if (!product) {
        await transaction.rollback();
        throw new ApiError(404, 'Product not found');
      }
      
      // Calculate new stock
      const newStock = product.stock_quantity + quantity;
      
      if (newStock < 0) {
        await transaction.rollback();
        throw new ApiError(400, 'Insufficient stock');
      }
      
      // Update stock
      await product.update({ stock_quantity: newStock }, { transaction });
      await transaction.commit();
      
      return product.get({ plain: true });
    } catch (error) {
      await transaction.rollback();
      
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating product stock: ${error.message}`);
    }
  },
});

export default Product;

