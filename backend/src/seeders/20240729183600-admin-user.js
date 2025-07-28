import bcrypt from 'bcryptjs';

/** @type {import('sequelize-cli').Migration} */
const seed = {
  async up(queryInterface) {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Add the admin user
    await queryInterface.bulkInsert('users', [{
      id: '00000000-0000-0000-0000-000000000000',
      email: 'admin@example.com',
      password: hashedPassword,
      full_name: 'Admin User',
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
    
    console.log('✅ Admin user created successfully');
  },

  async down(queryInterface) {
    // Remove the admin user
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' });
    console.log('✅ Admin user removed');
  }
};

export default seed;
