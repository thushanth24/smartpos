'use strict';

const { DataTypes } = require('sequelize');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 * @returns {Promise<void>}
 */
const up = async (queryInterface, Sequelize) => {
  // Check if is_active column exists and status doesn't exist
  const tableInfo = await queryInterface.describeTable('users');
  
  if (tableInfo.is_active && !tableInfo.status) {
    // Rename is_active to status and convert boolean to enum
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      RENAME COLUMN is_active TO status;
      
      ALTER TABLE users 
      ALTER COLUMN status TYPE VARCHAR(20) 
      USING CASE WHEN status = true THEN 'active' ELSE 'inactive' END;
      
      ALTER TABLE users 
      ALTER COLUMN status SET DEFAULT 'active';
    `);
    
    console.log('Renamed is_active to status and converted to enum');
  } else if (!tableInfo.status) {
    // If is_active doesn't exist and status doesn't exist, add status column
    await queryInterface.addColumn('users', 'status', {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false
    });
    
    console.log('Added status column to users table');
  } else {
    console.log('status column already exists in users table');
  }
};

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 * @returns {Promise<void>}
 */
const down = async (queryInterface, Sequelize) => {
  const tableInfo = await queryInterface.describeTable('users');
  
  if (tableInfo.status) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      RENAME COLUMN status TO is_active;
      
      ALTER TABLE users 
      ALTER COLUMN is_active TYPE BOOLEAN 
      USING CASE WHEN is_active = 'active' THEN true ELSE false END;
      
      ALTER TABLE users 
      ALTER COLUMN is_active SET DEFAULT true;
    `);
    
    console.log('Reverted status back to is_active and converted to boolean');
  }
};

module.exports = { up, down };
