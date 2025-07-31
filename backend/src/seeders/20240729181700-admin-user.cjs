"use strict";

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('admin123', 10); // Change password as needed
    return queryInterface.bulkInsert('users', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        email: 'admin@smartpos.com',
        password: passwordHash,
        full_name: 'Admin User',
        role: 'admin',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'admin@smartpos.com' }, {});
  },
};
