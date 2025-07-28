# SmartPOS Backend

This is the backend for the SmartPOS (Point of Sale) system, built with Node.js, Express, and PostgreSQL.

## Features

- User authentication (JWT)
- Role-based access control (Admin, Cashier)
- Product management
- User management
- RESTful API
- Error handling and logging
- Security best practices (helmet, rate limiting, etc.)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL database (local or Neon PostgreSQL)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartpos/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   Copy the `.env.example` file to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database Configuration (Development)
   DB_NAME=smartpos_dev
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_HOST=localhost
   DB_PORT=5432

   # For production (Neon PostgreSQL)
   # DATABASE_URL=postgres://user:password@host:port/database?options=param

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=30d
   JWT_COOKIE_EXPIRES=30

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=15*60*1000
   RATE_LIMIT_MAX=100
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Initialize the database**
   ```bash
   npm run db:init
   ```
   This will:
   - Run all database migrations
   - Seed the database with initial data (admin user)

6. **Start the development server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000` by default.

## Database Management

- `npm run db:migrate` - Run pending migrations
- `npm run db:migrate:undo` - Revert the last migration
- `npm run db:seed` - Run all seeders
- `npm run db:seed:undo` - Undo all seeders
- `npm run db:init` - Initialize database (migrations + seeders)

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## API Documentation

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password
- `GET /api/v1/auth/logout` - Logout user

### Products

- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create new product (Admin only)
- `PUT /api/v1/products/:id` - Update product (Admin only)
- `DELETE /api/v1/products/:id` - Delete product (Admin only)
- `PATCH /api/v1/products/:id/stock` - Update product stock

### Users (Admin only)

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get single user
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX users_email_idx ON users(email);
```
- `id` - UUID (Primary Key)
- `email` - String (Unique)
- `password` - String (Hashed)
- `full_name` - String
- `role` - Enum ('admin', 'cashier')
- `status` - Enum ('active', 'inactive')
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Products
- `id` - UUID (Primary Key)
- `name` - String
- `description` - Text
- `sku` - String (Unique)
- `category` - String
- `price` - Decimal
- `cost_price` - Decimal
- `stock` - Integer
- `status` - Enum ('active', 'inactive')
- `image` - String (URL)
- `barcode` - String
- `weight` - Decimal
- `dimensions` - String
- `supplier` - String
- `tax_rate` - Decimal
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Error Handling

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error message",
  "stack": "Error stack trace (in development only)"
}
```

## Security

- Passwords are hashed using bcrypt
- JWT for authentication
- Helmet for setting secure HTTP headers
- Rate limiting to prevent brute force attacks
- CORS enabled for frontend URL only
- Input validation using express-validator

## Deployment

### Docker

1. Build the Docker image:
   ```bash
   docker build -t smartpos-backend .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 5000:5000 smartpos-backend
   ```

### Kubernetes

1. Create a Kubernetes deployment YAML file:
   ```yml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: smartpos-backend
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: smartpos-backend
     template:
       metadata:
         labels:
           app: smartpos-backend
       spec:
         containers:
         - name: smartpos-backend
           image: smartpos-backend:latest
           ports:
           - containerPort: 5000
   ```

2. Apply the YAML file:
   ```bash
   kubectl apply -f deployment.yaml
   ```

### Heroku

1. Create a Heroku app:
   ```bash
   heroku create
   ```

2. Set the Heroku environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=5000
   ```

3. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
