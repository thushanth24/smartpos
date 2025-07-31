import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const SaleItem = sequelize.define('SaleItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sale_transaction_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'sales_transactions', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'products', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'sale_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default SaleItem;
