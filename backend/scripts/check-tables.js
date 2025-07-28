import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  try {
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    });

    await sequelize.authenticate();
    console.log('✅ Successfully connected to Neon PostgreSQL');

    // Get all tables
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('\n📋 Database Tables:');
    if (results.length === 0) {
      console.log('No tables found in the database.');
    } else {
      results.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    }

    // Check if users table exists and has data
    try {
      const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n👥 Users table has ${users[0].count} records`);
    } catch (error) {
      console.log('\n❌ Users table not found or has no data');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to the database:', error.message);
    process.exit(1);
  }
}

checkTables();
