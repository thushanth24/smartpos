import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import readline from 'readline';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for user input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function createSuperAdmin() {
  try {
    console.log('🚀 Setting up superadmin account\n');

    // Initialize Sequelize with the connection string from .env
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: false
    });

    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Import models
    const { User } = await import('../src/models/index.js');

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({
      where: { role: 'superadmin' }
    });

    if (existingSuperAdmin) {
      console.log('\n⚠️  A superadmin already exists:');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.full_name}`);
      
      const createNew = await prompt('\nDo you want to create another superadmin? (y/N): ');
      
      if (createNew.toLowerCase() !== 'y') {
        console.log('\nOperation cancelled.');
        process.exit(0);
      }
    }

    // Get user input
    console.log('\nPlease enter superadmin details:');
    const email = await prompt('Email: ');
    const fullName = await prompt('Full Name: ');
    const password = await prompt('Password (min 8 characters): ');

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create superadmin user
    const superadmin = await User.create({
      email,
      full_name: fullName,
      password: hashedPassword,
      role: 'superadmin',
      status: 'active'
    });

    console.log('\n✅ Superadmin created successfully!');
    console.log(`   Email: ${superadmin.email}`);
    console.log(`   Name: ${superadmin.full_name}`);
    console.log('\nYou can now log in with these credentials.');

  } catch (error) {
    console.error('\n❌ Error creating superadmin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the script
createSuperAdmin();
