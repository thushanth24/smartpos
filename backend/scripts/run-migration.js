import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  
  try {
    // Initialize Sequelize with the connection string from .env
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: console.log
    });

    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connected to Neon PostgreSQL');

    // Get all migration files
    const migrationsPath = resolve(__dirname, '../src/migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'));

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`🔄 Running migration: ${file}`);
      const migration = await import(`file://${resolve(migrationsPath, file)}`);
      await migration.up(sequelize.getQueryInterface(), Sequelize);
      console.log(`✅ Migration completed: ${file}`);
    }

    console.log('✨ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
