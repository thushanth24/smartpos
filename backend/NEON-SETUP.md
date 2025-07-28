# Setting Up Neon PostgreSQL with SmartPOS

This guide will help you set up and connect your SmartPOS backend to a Neon PostgreSQL database.

## Prerequisites

1. A Neon PostgreSQL account (https://neon.tech/)
2. Node.js v14+ installed
3. Git installed

## Step 1: Create a Neon PostgreSQL Database

1. Sign up or log in to [Neon](https://neon.tech/)
2. Create a new project
3. Note your connection string from the Neon dashboard (it should look like `postgres://user:password@host/dbname`)

## Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update the following:
   ```env
   # Update this with your Neon connection string
   DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
   
   # Set a strong JWT secret
   JWT_SECRET=your_secure_jwt_secret_here
   ```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Set Up the Database

Run the setup script to create tables and seed initial data:

```bash
npm run setup:neon
```

This will:
1. Test the database connection
2. Run all migrations
3. Seed the database with an admin user

## Step 5: Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

## Default Admin Credentials

After setup, you can log in with:
- Email: admin@example.com
- Password: admin123

## Troubleshooting

### Connection Issues
- Ensure your IP is whitelisted in the Neon dashboard
- Verify your connection string is correct
- Check that your database is running

### Migration Issues
- Make sure all dependencies are installed
- Check for any error messages during setup
- You can reset the database by running:
  ```bash
  npx sequelize-cli db:migrate:undo:all
  npm run setup:neon
  ```

## Next Steps

1. Change the default admin password after first login
2. Set up environment-specific configurations for production
3. Configure backup and monitoring for your Neon database
