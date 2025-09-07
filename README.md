# Library Management System

## Overview

This is a comprehensive Library Management System built using Node.js, Express.js, and Prisma. It provides a robust API for managing books, users, and borrowing records.

## Features

- User authentication and authorization
- Book management (add, update, delete, list)
- Borrowing and returning books
- User management (register, login, profile management)
- Rate limiting for API protection

## Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)
- PostgreSQL database (hosted or local)

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sindhumanjala/Library-Assignment.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Library-Assignment
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:
   ```
   DATABASE_URL=your_postgresql_database_url
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the server:
   ```bash
   node server.js
   ```

## API Documentation

API documentation is available at `http://localhost:3000/api-docs` when the server is running.

## Hosting on Render

1. Create a new web service on Render and connect it to your GitHub repository.
2. Set the following environment variables in Render:
   - `DATABASE_URL`: Your PostgreSQL database URL
   - `JWT_SECRET`: Your JWT secret key
   - `PORT`: 10000 (Render will use this port automatically)
3. Configure the build command:
   ```bash
   npm install
   npx prisma migrate deploy
   ```
4. Configure the start command:
   ```bash
   node server.js
   ```
5. Deploy the service.

## Notes

- Make sure to replace `your_postgresql_database_url` and `your_jwt_secret_key` with your actual PostgreSQL database URL and JWT secret key.
- The application uses Prisma for database operations. Ensure you have a PostgreSQL database set up and accessible.

## Contributing

Contributions are welcome! Please submit pull requests to the main branch.

## License

This project is licensed under the MIT License.
