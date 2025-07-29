import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL is not defined in .env file');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Drop tables in reverse order of dependencies
    const tables = [
      'sale_items',
      'sales_transactions',
      'products',
      'customers'
    ];

    // First, drop the migrations table if it exists
    try {
      await client.query('DROP TABLE IF EXISTS migrations CASCADE;');
      console.log('Dropped table: migrations');
    } catch (error) {
      console.error('Error dropping migrations table:', error.message);
    }

    // Then drop other tables
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.error(`Error dropping table ${table}:`, error.message);
      }
    }
    
    console.log('\n✅ Database reset successful!');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
