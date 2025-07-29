import sequelize from '../config/db.js';
import User from './User.js';
import Product from './Product.js';
import Log from './Log.js';

// Initialize models
const models = {
  User,
  Product,
  Log,
};

// Set up associations
// Example:
// User.hasMany(Product, { foreignKey: 'userId' });
// Product.belongsTo(User, { foreignKey: 'userId' });

// Export the models and sequelize instance
export {
  sequelize,
  User,
  Product,
  Log,
};

export default models;
