import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsDir = join(__dirname, '../../migrations');

// Get database URL from environment variables
const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL is not defined in .env file');
  process.exit(1);
}

// Create a new client instance
const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon's connection pooling
  }
});

// Function to run a single migration file
async function runMigrationFile(fileName) {
  try {
    const filePath = join(migrationsDir, fileName);
    const sql = await readFile(filePath, 'utf8');
    
    console.log(`\nRunning migration: ${fileName}`);
    await client.query(sql);
    console.log(`✅ Successfully applied: ${fileName}`);
    
    // Record the migration in a migrations table
    await client.query(
      'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
      [fileName]
    );
  } catch (error) {
    console.error(`❌ Error running migration ${fileName}:`, error.message);
    throw error;
  }
}

// Main function to run all migrations
async function runMigrations() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        run_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Get list of migration files
    const migrationFiles = [
      '001_create_products_table.sql',
      '002_create_customers_table.sql',
      '003_create_sales_transactions_table.sql',
      '004_create_sale_items_table.sql'
    ];

    // Get already run migrations
    const { rows: completedMigrations } = await client.query(
      'SELECT name FROM migrations'
    );
    
    const completedMigrationNames = new Set(completedMigrations.map(m => m.name));

    // Run pending migrations
    for (const fileName of migrationFiles) {
      if (!completedMigrationNames.has(fileName)) {
        await runMigrationFile(fileName);
      } else {
        console.log(`⏩ Already applied: ${fileName}`);
      }
    }

    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migrations
runMigrations();
