import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

const execAsync = promisify(exec);

dotenv.config();

async function runMigrations() {
  console.log('Running database migrations...');
  try {
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate');
    if (stderr) console.error('Migration stderr:', stderr);
    console.log('Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
}

async function seedDatabase() {
  console.log('Seeding database...');
  try {
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:seed:all');
    if (stderr) console.error('Seed stderr:', stderr);
    console.log('Database seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  const migrationsSuccess = await runMigrations();
  if (!migrationsSuccess) {
    console.error('Failed to run migrations');
    process.exit(1);
  }

  const seedingSuccess = await seedDatabase();
  if (!seedingSuccess) {
    console.error('Failed to seed database');
    process.exit(1);
  }

  console.log('Database initialization completed successfully');
  process.exit(0);
}

initializeDatabase();
