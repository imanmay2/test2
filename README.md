# Task Manager API

Task Manager API is a small backend service built with Express, PostgreSQL, and MongoDB. The application stores user accounts in PostgreSQL via Sequelize and keeps task data in MongoDB through Mongoose.

## What it does

- Registers and authenticates users
- Issues JWT tokens for protected routes
- Creates, lists, updates, and deletes tasks per authenticated user
- Validates task and user payloads with Joi
- Uses separate data stores for users and tasks

## Architecture

- `server.js` initializes the Express server, connects to PostgreSQL and MongoDB, and mounts routes.
- `routes/userRoutes.js` defines user registration, login, and profile endpoints.
- `routes/taskRoutes.js` defines task endpoints protected by authentication.
- `controllers/` contains handlers for requests and responses.
- `services/` contains business logic for users and tasks.
- `models/` defines the data schemas for users and tasks.
- `middleware/auth.js` verifies JWT tokens.
- `middleware/validators.js` validates incoming request payloads.

## Requirements

- Node.js
- PostgreSQL database
- MongoDB database
- Environment variables configured

## Environment variables

The application expects the following environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret for signing JWT tokens
- `PORT` - server port (optional, defaults to `5000`)

## Install and run

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

The application listens on the configured port and exposes the API under `/api`.

## API Endpoints

### Register a new user

POST `/api/users/register`

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response example:

```json
{
  "message": "User created",
  "user": {
    "id": "UUID",
    "email": "user@example.com"
  }
}
```

### Login

POST `/api/users/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response example:

```json
{
  "user": {
    "id": "UUID",
    "email": "user@example.com"
  },
  "token": "<jwt-token>"
}
```

### Current user profile

GET `/api/users/me`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Response example:

```json
{
  "id": "UUID",
  "email": "user@example.com"
}
```

### Create a task

POST `/api/tasks`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "title": "Finish report",
  "description": "Write the monthly status review",
  "dueDate": "2026-05-01T12:00:00.000Z",
  "status": "pending"
}
```

Response example:

```json
{
  "_id": "60d...",
  "userId": "UUID",
  "title": "Finish report",
  "description": "Write the monthly status review",
  "dueDate": "2026-05-01T12:00:00.000Z",
  "status": "pending",
  "createdAt": "2026-04-24T00:00:00.000Z",
  "updatedAt": "2026-04-24T00:00:00.000Z",
  "__v": 0
}
```

### List all tasks

GET `/api/tasks`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Response example:

```json
[
  {
    "_id": "60d...",
    "userId": "UUID",
    "title": "Finish report",
    "description": "Write the monthly status review",
    "dueDate": "2026-05-01T12:00:00.000Z",
    "status": "pending",
    "createdAt": "2026-04-24T00:00:00.000Z",
    "updatedAt": "2026-04-24T00:00:00.000Z",
    "__v": 0
  }
]
```

### Get task by ID

GET `/api/tasks/:id`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Response example:

```json
{
  "_id": "60d...",
  "userId": "UUID",
  "title": "Finish report",
  "description": "Write the monthly status review",
  "dueDate": "2026-05-01T12:00:00.000Z",
  "status": "pending",
  "createdAt": "2026-04-24T00:00:00.000Z",
  "updatedAt": "2026-04-24T00:00:00.000Z",
  "__v": 0
}
```

### Update a task

PATCH `/api/tasks/:id`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "title": "Finish report",
  "description": "Update with final notes",
  "dueDate": "2026-05-02T12:00:00.000Z",
  "status": "completed"
}
```

Response example:

```json
{
  "_id": "60d...",
  "userId": "UUID",
  "title": "Finish report",
  "description": "Update with final notes",
  "dueDate": "2026-05-02T12:00:00.000Z",
  "status": "completed",
  "createdAt": "2026-04-24T00:00:00.000Z",
  "updatedAt": "2026-04-24T00:00:00.000Z",
  "__v": 0
}
```

### Delete a task

DELETE `/api/tasks/:id`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Response:

- Status `204 No Content`

## Validation rules

- User registration requires `email` and `password`.
- Password must be at least 8 characters.
- Task creation and update require `title`, `dueDate`, and optional `description`.
- `dueDate` must be a future ISO date.
- `status` can only be `pending` or `completed`.

## Notes

- `auth` middleware reads the JWT from the `Authorization` header.
- `tasks` are stored in MongoDB and are scoped to the authenticated user.
- `users` are managed in PostgreSQL via Sequelize.
