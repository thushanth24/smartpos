import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  try {
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate');
    if (stderr) console.error('Migration stderr:', stderr);
    console.log('✅ Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    return false;
  }
}

async function seedDatabase() {
  console.log('🌱 Seeding database...');
  try {
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:seed:all');
    if (stderr) console.error('Seed stderr:', stderr);
    console.log('✅ Database seeded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    return false;
  }
}

async function verifyConnection() {
  try {
    const { sequelize } = await import('../src/utils/db.js');
    await sequelize.authenticate();
    console.log('✅ Successfully connected to Neon PostgreSQL');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to Neon PostgreSQL:', error.message);
    console.error('\nPlease make sure:');
    console.error('1. Your Neon PostgreSQL instance is running');
    console.error('2. Your DATABASE_URL in .env is correct');
    console.error('3. Your IP is whitelisted in Neon dashboard if required\n');
    return false;
  }
}

async function setupDatabase() {
  console.log('🔍 Checking database connection...');
  const isConnected = await verifyConnection();
  if (!isConnected) {
    process.exit(1);
  }

  const migrationsSuccess = await runMigrations();
  if (!migrationsSuccess) {
    process.exit(1);
  }

  const seedingSuccess = await seedDatabase();
  if (!seedingSuccess) {
    process.exit(1);
  }

  console.log('\n✨ Database setup completed successfully!');
  console.log('\n🔑 Default admin credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123\n');
  
  process.exit(0);
}

setupDatabase();
