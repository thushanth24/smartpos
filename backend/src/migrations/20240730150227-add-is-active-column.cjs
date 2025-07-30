'use strict';

const { DataTypes } = require('sequelize');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 * @returns {Promise<void>}
 */
const up = async (queryInterface, Sequelize) => {
  // Check if the column already exists
  const tableInfo = await queryInterface.describeTable('users');
  
  if (!tableInfo.is_active) {
    await queryInterface.addColumn('users', 'is_active', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    console.log('Added is_active column to users table');
  } else {
    console.log('is_active column already exists in users table');
  }
};

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 * @returns {Promise<void>}
 */
const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('users', 'is_active');
  console.log('Removed is_active column from users table');
};

module.exports = { up, down };
