# 🛡️ Secure Role-Based Access Control (RBAC) Authentication System

An educational, enterprise-style Role-Based Access Control (RBAC) implementation built using Node.js, Express, MongoDB/Mongoose, and custom JSON Web Token (JWT) middlewares. This system features dual-layered security guards protecting sensitive resources, password encryption with salting, and an automated mock-database fallback for sandbox review.

---

## 🚀 Project Overview

This project serves as a highly robust template for developers looking to understand authentication, session lifecycle management, and fine-grained authorization layers in web applications. It implements two distinct clear roles: **Admin** and **User**, and strictly restrains client capabilities on both the browser frontend and API route level.

### 🌟 Core Security Features
1. **Cryptographic Salting & Hashing**: All registration requests have passwords processed with `bcryptjs` (using 10 salt rounds) before database insertion. Raw passwords are never stored or logged.
2. **Stateless JWT Authorization**: Generates signed JSON Web Tokens upon successful login containing user ID and role authorization. Valid for exactly **24 hours**.
3. **Route Gatekeeper Middleware**: Custom `verifyToken` and `authorizeRole('Admin', 'User')` middlewares isolate routes from unauthorized access or escalation.
4. **Interactive RBAC Audit Playground**: A built-in security sandbox allowing standard users to manually try bypassed actions to witness live `403 Forbidden` errors returned from the server.
5. **Zero-Config Developer Preview Fallback**: If no MongoDB connection is configured, the server automatically boots using an **In-Memory JSON Fallback Database** (`server/data/*.json`) allowing full testing of catalog editing, account creation, and user deletion instantly in the browser.

---

## 🛠️ Technologies Used

### Backend Engine
* **Node.js**: Asynchronous runtime environment.
* **Express.js**: Fast, minimalist web framework.
* **Mongoose & MongoDB**: Elegant ODM for modeling schemas and interacting with a document-oriented database.
* **jsonwebtoken (JWT)**: Security token serialization.
* **bcryptjs**: Password hashing and verification.
* **cors**: Handling Cross-Origin Resource Sharing.
* **dotenv**: Safe configuration load.

### Frontend
* **HTML5 & CSS3**: Structured layout wrappers.
* **Tailwind CSS (Vite Engine / CDN Fallback)**: Rapid, cohesive styling utility.
* **Vanilla JavaScript (ES Modules)**: Lightweight, modular state and API requests controller.

---

## 📁 Project Structure

```text
rbac-security-gate/
├── client/                      # Vanilla Frontend Client
│   ├── index.html               # Public Landing page & Catalog Explorer
│   ├── login.html               # Sign In console
│   ├── register.html            # Registration & Role setup
│   ├── dashboard.html           # Standard User dashboard (including Audit suite)
│   ├── admin.html               # Administrative Control Panel (Users, Catalog CRUD)
│   ├── profile.html             # Profile credential modifications
│   ├── css/
│   │   └── style.css            # Custom layout rhythm & transitions
│   └── js/
│       └── api.js               # Centralized local state & dynamic Nav Renderer
│
├── server/                      # Robust REST API Backend
│   ├── config/
│   │   ├── db.ts                # MongoDB & Mongoose initializers
│   │   └── modelWrapper.ts      # Automatic Local-to-Cloud hybrid DB manager
│   ├── controllers/
│   │   ├── authController.ts    # Login & Register handlers
│   │   ├── userController.ts    # Self-profile retrievals & updates
│   │   └── adminController.ts   # Restricted dashboard statistics, User deletions, Catalog CRUD
│   ├── middleware/
│   │   ├── authMiddleware.ts    # Token extraction and verification
│   │   └── roleMiddleware.ts    # Multi-role access permissions guard
│   ├── models/
│   │   ├── User.ts              # Mongoose user schemas & pre-seeding logic
│   │   └── Product.ts           # Mongoose catalog product models
│   └── data/                    # (Auto-generated in sandbox mode)
│       ├── users.json           # Mock User collections
│       └── products.json        # Mock Catalog collections
│
├── server.ts                    # Express entry point
├── package.json                 # Dependency manifests
└── .env.example                 # Configuration guides
```

---

## 🔌 MongoDB & Environment Setup

1. Rename the `.env.example` file to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Configure variables:
   ```env
   # Set a strong, custom JWT encryption secret
   JWT_SECRET="YOUR_CUSTOM_SECURE_TOKEN_KEY_HERE"

   # To connect a real cloud database, enter your MongoDB Atlas URI:
   MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/rbac_db"
   ```

> **Note on Fallback Mode**: If `MONGO_URI` is left blank, the application will automatically initialize the hybrid fallback mode, saving all accounts and edits to a secure JSON directory in `/server/data/`. This guarantees a working system out-of-the-box.

---

## 💻 Running the Project

### Installation
Install dependencies:
```bash
npm install
```

### Run in Development
Boots the server using `tsx` on port `3000`:
```bash
npm run dev
```

### Production Build & Launch
Compiles backend TypeScript files with `esbuild` and launches node:
```bash
npm run build
npm start
```

---

## 🔒 Security Flow Architectures

### 1. Authentication Flow (Registration & Login)
```text
[User Client] --- (Register Form) ---> [API Post] ---> [Hash Password (Bcrypt)] ---> [Write to DB]
                                                                                          │
[User Client] <--- (JWT Token) <--- [Generate JWT] <--- [Match Password] <--- [Login Form] ┘
```

### 2. Authorization Flow (Middlewares)
```text
[HTTP Request] ──> [verifyToken()] ──────────> [authorizeRole('Admin')] ──────────> [Controller Action]
                    │                               │                                     │
                    ├── (No Token) -> 401           ├── (Role is User) -> 403             └── (Success) -> 200
                    └── (Expired) -> 401            └── (Role is Admin) -> Allow Next
```

---

## 📖 REST API Documentation

### 🔓 Public / Authentication Routes

#### `POST /api/auth/register`
Creates a new account.
* **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securepassword",
    "role": "User"
  }
  ```
* **Response (211 Registered)**:
  ```json
  {
    "success": true,
    "message": "Registration successful! Account created for Jane Smith with role [User].",
    "user": {
      "id": "abc123xyz",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "User"
    }
  }
  ```

#### `POST /api/auth/login`
Authenticates credentials and returns a secure token.
* **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Authentication successful! Welcome back, Jane Smith.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "abc123xyz",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "User"
    }
  }
  ```

---

### 🟢 Authenticated User Routes (Requires JWT Token)

All routes require sending the JWT inside the headers:
`Authorization: Bearer <token>`

#### `GET /api/user/profile`
Retrieve active user's profile metadata.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "profile": {
      "id": "abc123xyz",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "User",
      "createdAt": "2026-07-05T06:38:10.000Z"
    }
  }
  ```

#### `PUT /api/user/profile`
Update own name, email, or reset password securely.
* **Request Body**:
  ```json
  {
    "name": "Jane R. Smith",
    "password": "newsuperpassword"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully!",
    "user": {
      "id": "abc123xyz",
      "name": "Jane R. Smith",
      "email": "jane@example.com",
      "role": "User"
    }
  }
  ```

#### `GET /api/user/products`
Retrieves products catalog list.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "products": [
      {
        "_id": "prod-001",
        "name": "Secure-Gate Hardware Token",
        "price": 49.99,
        "description": "Physical cryptographic key supporting secure WebAuthn.",
        "category": "Security Hardware"
      }
    ]
  }
  ```

---

### 🔴 Administrator Only Routes (Requires JWT Token & Role="Admin")

#### `GET /api/admin/dashboard`
Returns live system analytics and storage driver.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "stats": {
      "totalUsers": 2,
      "adminCount": 1,
      "normalUserCount": 1,
      "totalProducts": 3,
      "dbStatus": "Mongoose (MongoDB Cloud)",
      "systemTime": "2026-07-05T06:38:10.000Z",
      "nodeVersion": "v22.14.0"
    }
  }
  ```

#### `GET /api/admin/users`
Audit all accounts currently registered in the database.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "users": [
      { "id": "admin-id", "name": "Admin", "email": "admin@example.com", "role": "Admin" },
      { "id": "user-id", "name": "Jane", "email": "jane@example.com", "role": "User" }
    ]
  }
  ```

#### `DELETE /api/admin/users/:id`
Permanently delete an account. Preventing admins from deleting their own active profiles.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User \"Jane Doe\" has been permanently deleted from the database."
  }
  ```

#### `POST /api/admin/products`
Create a new product listing.
* **Request Body**:
  ```json
  {
    "name": "Advanced Malware Shield",
    "price": 149.99,
    "category": "Antivirus",
    "description": "Heuristic endpoint analysis license."
  }
  ```

#### `PUT /api/admin/products/:id`
Modify catalog entry price, category, description, or title.
* **Request Body**:
  ```json
  {
    "price": 129.99
  }
  ```

#### `DELETE /api/admin/products/:id`
Delete a catalog listing.

---

## 🧪 Postman Sandbox Testing JSON

You can import this raw JSON into Postman to load all endpoints preconfigured:

```json
{
  "info": {
    "name": "Secure RBAC Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth - Register",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"tester@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"User\"\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": { "raw": "http://localhost:3000/api/auth/register" }
      }
    },
    {
      "name": "Auth - Login",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"adminpassword\"\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": { "raw": "http://localhost:3000/api/auth/login" }
      }
    }
  ]
}
```

---

## 💡 Future Enhancements
* **Two-Factor Authentication (2FA)**: Layer secure hardware keys.
* **Refresh Token Lifecycles**: Split standard access token decay.
* **Auditing Telemetry Tables**: Save tracking records of unauthorized 403 access attempts to database blocks.
