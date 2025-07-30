import { DataTypes } from 'sequelize';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'admin', 'manager', 'cashier'),
    defaultValue: 'cashier',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
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
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Add instance method to check password
User.prototype.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Add static methods to the User model
Object.assign(User, {
  // Create a new user
  async createUser(userData) {
    try {
      const user = await this.create(userData);
      const { password, ...userWithoutPassword } = user.get({ plain: true });
      return userWithoutPassword;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ApiError(400, 'Email already in use');
      }
      throw new ApiError(500, `Error creating user: ${error.message}`);
    }
  },

  // Find user by email
  async findByEmail(email) {
    try {
      return await this.findOne({ where: { email } });
    } catch (error) {
      throw new ApiError(500, `Error finding user: ${error.message}`);
    }
  },

  // Find user by ID
  async findById(id) {
    try {
      const user = await this.findByPk(id);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error fetching user: ${error.message}`);
    }
  },

  // Update user
  async updateUser(id, updateData) {
    try {
      const [updated] = await this.update(updateData, {
        where: { id },
        returning: true,
        plain: true,
      });

      if (!updated) {
        throw new ApiError(404, 'User not found');
      }

      const user = await this.findByPk(id);
      const { password, ...userWithoutPassword } = user.get({ plain: true });
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ApiError(400, 'Email already in use');
      }
      throw new ApiError(500, `Error updating user: ${error.message}`);
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const deleted = await this.destroy({ where: { id } });
      if (!deleted) {
        throw new ApiError(404, 'User not found');
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error deleting user: ${error.message}`);
    }
  },
});

export default User;
