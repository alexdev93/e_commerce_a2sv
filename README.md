# E-commerce Backend Project

This is the backend for an e-commerce platform, implementing core functionalities like user authentication, product management, and order processing.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Notes](#notes)

---

## Technologies Used

- **Node.js** with **TypeScript** for backend development
- **Express.js** for building RESTful APIs
- **TypeORM** for database management
- **Postgres** as the database
- **JWT** for authentication
- **bcrypt** for password hashing
- Optional: **Cloudinary** or similar for file uploads (if implemented)



## Getting Started

### Prerequisites
- Node.js >= 18.x
- yarn
- PostgreSQL installed locally or accessible via a cloud provider

### Installation

1. Clone the repository:

```bash
git clone https://github.com/alexdev93/e_commerce_a2sv.git
cd e_commerce_a2sv
```

2. Install dependencies:

```bash
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```env
# App
NODE_ENV=development
PORT=3000

# Database (Postgres)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=a2sv_db
DATABASE_URL=postgres://admin:admin123@localhost:5432/a2sv_db

# JWT
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=1d

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# Redis configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=   
REDIS_DB=0           
REDIS_TTL=3600       

# Other
LOG_LEVEL=info

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
---

## Running the Project

```bash
# For development
yarn dev

# For production build
yarn build
yarn start
```

The server will start on `http://localhost:5000` (or the port you specified).

---

#### Run with Docker 🐳

##### After cloning the repo:

```bash
docker compose up --build -d
```

---

## Postman API Collection

You can use this Postman collection to test all API endpoints of the A2SV E-commerce backend.

[📥 Download the Postman API Collection](./API.postman_collection.json)

> After downloading, open the file in Postman. You can test authentication, products, and orders endpoints immediately.

---

---

## API Endpoints

### Authentication
- `POST /auth/register` – Register a new user
- `POST /auth/login` – Login and receive a JWT

### Products
- `POST /products` – Create a product (Admin only)
- `PUT /products/:id` – Update a product (Admin only)
- `GET /products?search="mobile"&page=1&pageSize=10` – List products (with optional pagination and search)
- `GET /products/:id` – Get product details
- `DELETE /products/:id` – Delete a product (Admin only)

### Orders
- `POST /orders` – Place a new order (Authenticated users)
- `GET /orders` – View order history (Authenticated users)

---

## Testing

If you implemented unit tests:

```bash
yarn test
```

---

## Notes

- Passwords are hashed using `bcrypt`.
- JWT tokens are used for securing endpoints.
- All endpoints return a standardized API response with success status, message, and data/error details.
- Pagination is supported for listing endpoints.
- All bonus features have been implemented, including:
  - Unit tests for all HTTP requests with mocked database
  - Caching for product listing endpoints
  - API documentation
  - Product image uploads
  - Advanced search and filtering
  - Security enhancements including rate limiting

---


