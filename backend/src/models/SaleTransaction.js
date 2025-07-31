import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const SaleTransaction = sequelize.define('SaleTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'customers', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  total_amount: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'completed',
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
  tableName: 'sales_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default SaleTransaction;
