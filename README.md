# Tinder4Devs

A Tinder-like application backend for developers worldwide to connect and collaborate.

## Features

- User authentication (Sign up/Sign in)
- JWT-based authorization
- User profile management
- Search users by ID or email
- Secure password hashing with bcrypt
- Input validation
- Soft delete functionality

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: validator.js

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd tinder4devs
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory

```env
PORT=8000
MONGO_DB_URI=<MONGO-DB-URI>
PRODUCTION=<PRODUCTION-KEY>
DEVELOPMENT=<DEVELOPMENT-KEY>
CURRENT_ENV=<PRODUCTION | DEVELOPMENT>
JWT_SECRET_PRODUCTION=<PRODUCTION-JWT-SECRET>
JWT_SECRET_DEVELOPMENT=<DEVELOPMENT-JWT-SECRET>

```

4. Start the server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Sign Up

```
POST /v1/api/signUp
```

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "age": 25,
  "contactNumber": "+1234567890",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "primaryRole": "Full Stack Developer",
  "yearsOfExperience": 3,
  "skills": ["JavaScript", "Node.js", "React"],
  "collaborationStyle": "Remote"
}
```

#### Sign In

```
POST /v1/api/signIn
```

**Body:**

```json
{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```

### User Management (Protected Routes)

All routes below require authentication via JWT token in cookies.

#### Get User by ID

```
GET /v1/api/user/id/:id
```

#### Get User by Email

```
GET /v1/api/user/email/:email
```

#### Get All Users

```
GET /v1/api/users
```

#### Update User

```
PATCH /v1/api/user/id/:id
```

#### Delete User

```
DELETE /v1/api/user/id/:id
```

## Project Structure

```
tinder4devs/
├── src/
│   ├── config/
│   │   ├── database.init.js
│   │   └── environmentConfig.js
│   ├── constant/
│   │   └── updateAvailable.constant.js
│   ├── controllers/
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── checkAuth.middleware.js
│   │   └── verifyUpdate.middleware.js
│   ├── models/
│   │   └── user.schema.js
│   ├── routes/
│   │   └── user.route.js
│   ├── utils/
│   │   ├── jwt.utils.js
│   │   └── user.util.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## User Schema

- **firstName**: String (3-20 characters)
- **lastName**: String (3-20 characters)
- **age**: Number (18-100)
- **contactNumber**: String (unique, validated)
- **email**: String (unique, validated)
- **password**: String (hashed, strong password required)
- **profilePicture**: String (URL)
- **coverPicture**: String (URL)
- **bio**: String (10-300 characters)
- **location**: String
- **primaryRole**: String (3-30 characters)
- **yearsOfExperience**: Number (0-80)
- **skills**: Array of Strings (max 20)
- **socialLinks**: Map of Strings
- **collaborationStyle**: Enum ["Remote", "In-Person", "Hybrid"]
- **statusDeleted**: Enum ["NEW", "DELETED"]

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (not configured yet)

## Author

Nikhil Ranjan Kumar

## License

ISC
