# Banking Ledger System Backend

A secure Node.js backend for a ledger-based banking service that supports user authentication, account management, and idempotent transaction processing.

## Features

* User registration and login using JWT stored in cookies
* Account creation and account balance retrieval
* Ledger-based transaction posting with debit/credit entries
* Idempotent transaction handling via `idempotencyKey`
* System-user protected initial funds transaction endpoint
* Email notifications for registration and transaction events
* Immutable ledger entries for audit integrity

## Tech Stack

* Backend framework: Express.js
* Database: MongoDB with Mongoose ORM
* Authentication: JWT with cookie support
* Email: Nodemailer with Gmail OAuth2
* Deployment: Node.js server
* Other libraries/tools:
  * `bcryptjs` for password hashing
  * `cookie-parser` for cookie handling
  * `dotenv` for environment configuration
  * `jsonwebtoken` for token signing
  * `mongoose` for schema modeling

## Architecture Overview

This backend follows a standard layered structure:

1. Client sends an HTTP request to the REST API.
2. Express routes in `src/routes` select the appropriate controller.
3. Middleware validates authentication and authorization using JWT cookies.
4. Controllers orchestrate business logic and interact with models.
5. Mongoose models persist and query MongoDB data.
6. Services handle external integrations such as email delivery.

### Request lifecycle

* Incoming request enters `src/app.js`.
* JSON payloads and cookies are parsed.
* Request is routed to `/api/auth`, `/api/accounts`, or `/api/transaction`.
* Protected routes execute middleware before controller logic.
* Controller performs validation and database operations.
* Response is sent back to the client.

### Authentication flow

* Users register or login via `/api/auth`.
* A JWT token is generated and stored in a cookie named `token`.
* `authMiddleware` verifies the token on protected routes.
* `authSystemUserMiddleware` additionally checks the `systemUser` flag on the user.

## Folder Structure

* `server.js` — application entry point, database connection, and server start
* `src/app.js` — Express app configuration and route mounting
* `src/config/database.js` — MongoDB connection logic
* `src/controllers/` — request handling and business logic
* `src/routes/` — API route definitions
* `src/middleware/` — authentication and authorization checks
* `src/models/` — Mongoose schemas and data model logic
* `src/services/` — email notification service

## API Endpoints

### Authentication

* `POST /api/auth/register`
  * Purpose: Register a new user
  * Request body:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "secret123"
    }
    ```
  * Response example:
    ```json
    {
      "message": "User registered successfully",
      "status": "success",
      "data": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
    ```

* `POST /api/auth/login`
  * Purpose: Authenticate an existing user
  * Request body:
    ```json
    {
      "email": "john@example.com",
      "password": "secret123"
    }
    ```
  * Response example:
    ```json
    {
      "message": "User logged in successfully",
      "status": "success",
      "data": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
    ```

* `POST /api/auth/logout`
  * Purpose: Clear the authentication cookie
  * Response example:
    ```json
    {
      "message": "User logged out successfully",
      "status": "success"
    }
    ```

### Accounts

* `POST /api/accounts/`
  * Purpose: Create a new account for the logged-in user
  * Requires authentication
  * Response example:
    ```json
    {
      "message": "Account created successfully!",
      "account": {
        "_id": "...",
        "user": "...",
        "status": "ACTIVE",
        "currency": "INR"
      }
    }
    ```

* `GET /api/accounts/`
  * Purpose: Retrieve all accounts for the authenticated user
  * Requires authentication
  * Response example:
    ```json
    {
      "message": "User accounts!",
      "accounts": [ ... ]
    }
    ```

* `GET /api/accounts/balance/:accountId`
  * Purpose: Get the computed balance for a specific account
  * Requires authentication
  * Response example:
    ```json
    {
      "message": "User account balance!",
      "balance": 1200
    }
    ```

### Transactions

* `POST /api/transaction/`
  * Purpose: Create a debit/credit ledger transaction between two accounts
  * Requires authentication
  * Request body:
    ```json
    {
      "fromAccount": "<accountId>",
      "toAccount": "<accountId>",
      "amount": 250,
      "idempotencyKey": "unique-key-123"
    }
    ```
  * Response example:
    ```json
    {
      "message": "Requested Transaction completed successfully",
      "transaction": {
        "_id": "...",
        "fromAccount": "...",
        "toAccount": "...",
        "status": "COMPLETED",
        "amount": 250,
        "idempotencyKey": "unique-key-123"
      }
    }
    ```

* `POST /api/transaction/system/initial-funds`
  * Purpose: System-user protected initial funds transaction
  * Requires system user authentication
  * Request body:
    ```json
    {
      "toAccount": "<accountId>",
      "amount": 1000,
      "idempotencyKey": "init-key-123"
    }
    ```
  * Response example:
    ```json
    {
      "message": "Initial funds transaction completed successfully",
      "transaction": { ... }
    }
    ```

## Database Schema

### Collections

* `users`
  * Stores registered users
  * Important fields: `email`, `name`, `password`, `systemUser`

* `accounts`
  * Stores account records linked to users
  * Important fields: `user`, `status`, `currency`
  * Relationship: each account belongs to one user

* `transactions`
  * Stores transfer events between accounts
  * Important fields: `fromAccount`, `toAccount`, `status`, `amount`, `idempotencyKey`
  * Relationship: transaction references two accounts

* `ledgers`
  * Stores immutable debit/credit entries for each transaction
  * Important fields: `account`, `amount`, `transaction`, `type`
  * Relationship: ledger entries reference an account and a transaction

### Indexing

* `users.email` is unique
* `transactions.idempotencyKey` is unique
* `accounts.user` indexed for user account lookup
* `ledger.account`, `ledger.transaction`, `transaction.fromAccount`, `transaction.toAccount` use indexes for query performance

## Installation & Setup

1. Clone repository
   ```bash
   git clone <repository-url>
   cd "Banking Ledger System"
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create `.env` file
   ```bash
   copy .env.example .env
   ```

4. Run locally
   ```bash
   npm start
   ```

5. Development mode
   ```bash
   npm run dev
   ```

## Environment Variables

Example `.env` values:

```env
MONGO_URI=mongodb://<username>:<password>@<host>/<database>
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_refresh_token
```

## Security Features

* Passwords are hashed before saving with `bcryptjs`
* Authentication uses JWT tokens stored in secure cookies
* Protected routes validate JWT tokens before executing controller logic
* Idempotent transaction keys prevent duplicate transaction processing
* Ledger entries are designed to be immutable and cannot be modified or deleted once created

> Note: The current implementation does not include rate limiting or CORS configuration out of the box. Those can be added to harden the backend further.

## Challenges Faced

* Designing idempotent transaction processing for repeated requests
* Maintaining a ledger-style balance while avoiding direct account balance mutation
* Ensuring authentication worked through cookies and middleware
* Handling atomic debit/credit operations with MongoDB transactions

## Learning Outcomes

* Built a production-style REST API with Express and Mongoose
* Implemented JWT authentication with cookie-based session flow
* Designed a ledger-based transaction model for account balance calculations
* Applied MongoDB transactions for atomic debit/credit operations
* Integrated email notifications using Nodemailer and OAuth2

## Author

* Author: Veerender Nemali
* Contact: nemaliveerender2001@gmail.com
* GitHub: https://github.com/veerender-nemali
