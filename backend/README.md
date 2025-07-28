# SmartPOS Backend

This is the backend for the SmartPOS (Point of Sale) system, built with Node.js, Express, and Supabase.

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
- Supabase account and project

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
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=30d
   JWT_COOKIE_EXPIRES=30

   # Database Configuration (Supabase)
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000` by default.

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

### Users
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
