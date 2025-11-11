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
- npm or yarn
- MongoDB / PostgreSQL installed locally or accessible via a cloud provider

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000

# Database
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=a2sv_ecommerce

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> Confirm your database type (MongoDB or PostgreSQL) and any other services you are using so I can adjust these instructions.

---

## Running the Project

```bash
# For development
npm run dev

# For production build
npm run build
npm start
```

The server will start on `http://localhost:5000` (or the port you specified).

---

## API Endpoints

### Authentication
- `POST /auth/register` – Register a new user
- `POST /auth/login` – Login and receive a JWT

### Products
- `POST /products` – Create a product (Admin only)
- `PUT /products/:id` – Update a product (Admin only)
- `GET /products` – List products (with optional pagination and search)
- `GET /products/:id` – Get product details
- `DELETE /products/:id` – Delete a product (Admin only)

### Orders
- `POST /orders` – Place a new order (Authenticated users)
- `GET /orders` – View order history (Authenticated users)

---

## Testing

If you implemented unit tests:

```bash
npm run test
```

---

## Notes

- Passwords are hashed using `bcrypt`.
- JWT tokens are used for securing endpoints.
- All endpoints return a standardized API response with success status, message, and data/error details.
- Pagination is supported for listing endpoints.

---

## License

This project is open-source and free to use.

