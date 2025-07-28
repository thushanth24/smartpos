const { supabase } = require('../config/db');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email: userData.email,
            password: hashedPassword,
            full_name: userData.full_name,
            role: userData.role || 'cashier',
            status: 'active'
          }
        ])
        .select();

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new ApiError(400, 'Email already in use');
        }
        throw error;
      }
      
      // Remove password from returned data
      const { password, ...userWithoutPassword } = data[0];
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, `Error creating user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      throw new ApiError(500, `Error finding user: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          throw new ApiError(404, 'User not found');
        }
        throw error;
      }
      
      // Remove password from returned data
      const { password, ...userWithoutPassword } = data;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error fetching user: ${error.message}`);
    }
  }

  // Update user
  static async update(id, updateData) {
    try {
      // If password is being updated, hash it
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new ApiError(404, 'User not found');
      }
      
      // Remove password from returned data
      const { password, ...userWithoutPassword } = data[0];
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating user: ${error.message}`);
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      throw new ApiError(500, `Error deleting user: ${error.message}`);
    }
  }

  // Check if password matches
  static async isPasswordMatch(user, candidatePassword) {
    return bcrypt.compare(candidatePassword, user.password);
  }
}

module.exports = User;
