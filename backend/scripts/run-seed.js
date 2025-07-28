import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSeed() {
  console.log('🌱 Running database seed...');
  
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

    // Import the seed file
    const { default: seed } = await import(`file://${resolve(__dirname, '../src/seeders/20240729183600-admin-user.js')}?v=${Date.now()}`);
    
    // Run the seed
    await seed.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('✨ Seed completed successfully!');
    console.log('\n🔑 Admin credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
