"use strict";

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('superadmin123', 10); // Change password as needed
    return queryInterface.bulkInsert('users', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        email: 'superadmin@smartpos.com',
        password: passwordHash,
        full_name: 'Super Admin',
        role: 'superadmin',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'superadmin@smartpos.com' }, {});
  },
};
