# Evangadi Forum API

Node.js + Express + MySQL backend with JWT authentication, organized in MVC architecture.

## Stack

- **Express** — HTTP API
- **MySQL** — `users`, `questions`, `answers` tables
- **bcrypt** — password hashing
- **jsonwebtoken** — stateless auth (Bearer token)

## Project structure

```
src/
  config/db.js           # MySQL connection pool
  controllers/           # Request handlers
  middleware/            # JWT auth + errors
  models/                # Database queries
  routes/                # API routes
  app.js                 # Express app
  server.js              # Entry point
database/schema.sql      # MySQL schema
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment file and edit values:

   ```bash
   copy .env.example .env
   ```

3. Create the database (MySQL CLI or Workbench):

   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

## API endpoints

### Users (auth)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | No | Register |
| POST | `/api/users/login` | No | Login (returns JWT) |
| GET | `/api/users/profile` | Yes | Current user profile |

### Questions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/questions` | No | List all questions |
| GET | `/api/questions/:questionid` | No | Question + answers |
| POST | `/api/questions` | Yes | Create question |
| PUT | `/api/questions/:questionid` | Yes | Update (owner only) |
| DELETE | `/api/questions/:questionid` | Yes | Delete (owner only) |

### Answers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/answers/:questionid` | Yes | Post answer |
| PUT | `/api/answers/:answerid` | Yes | Update (owner only) |
| DELETE | `/api/answers/:answerid` | Yes | Delete (owner only) |

Protected routes require:

```
Authorization: Bearer <your_jwt_token>
```

## Example requests

**Register**

```json
POST /api/users/register
{
  "username": "johndoe",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Login**

```json
POST /api/users/login
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Create question**

```json
POST /api/questions
Authorization: Bearer <token>
{
  "title": "How does JWT work?",
  "description": "Explain the flow between React and Node.",
  "tag": "auth"
}
```

**Post answer**

```json
POST /api/answers/<questionid>
Authorization: Bearer <token>
{
  "answer": "The client sends the token in the Authorization header."
}
```
