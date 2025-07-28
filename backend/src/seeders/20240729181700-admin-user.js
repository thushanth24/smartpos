import bcrypt from 'bcryptjs';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    return queryInterface.bulkInsert('users', [{
      id: '00000000-0000-0000-0000-000000000000',
      email: 'admin@example.com',
      password: hashedPassword,
      full_name: 'Admin User',
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
  },
};
