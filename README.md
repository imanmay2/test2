# Task Manager API

Task Manager API is a small backend service built with Express, PostgreSQL, and MongoDB. The application stores user accounts in PostgreSQL via Sequelize and keeps task data in MongoDB through Mongoose.

## What it does

- Registers and authenticates users
- Issues JWT tokens for protected routes
- Creates, lists, updates, and deletes tasks per authenticated user
- Supports user-owned categories and free-form tags
- Filters tasks by category and tags
- Schedules simulated task reminders before due dates
- Sends simulated external analytics webhooks when tasks are completed
- Validates task and user payloads with Joi
- Uses separate data stores for users and tasks

## Architecture

- `server.js` initializes the Express server, connects to PostgreSQL and MongoDB, and mounts routes.
- `routes/userRoutes.js` defines user registration, login, and profile endpoints.
- `routes/taskRoutes.js` defines task endpoints protected by authentication.
- `routes/categoryRoutes.js` and `routes/tagRoutes.js` define category and tag management endpoints.
- `controllers/` contains handlers for requests and responses.
- `services/` contains business logic for users and tasks.
- `services/reminderService.js` contains the in-memory reminder scheduler.
- `services/webhookService.js` sends simulated completion webhooks with retry logic.
- `models/` defines the data schemas for users and tasks.
- `middleware/auth.js` verifies JWT tokens.
- `middleware/validators.js` validates incoming request payloads.

## Requirements

- Node.js 18 or newer
- PostgreSQL database
- MongoDB database
- Environment variables configured

## Environment variables

The application expects the following environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret for signing JWT tokens
- `PORT` - server port (optional, defaults to `5000`)
- `REMINDER_LEAD_MS` - how long before `dueDate` a reminder should trigger, default `3600000` (1 hour)
- `EXTERNAL_WEBHOOK_URL` - optional URL for simulated task completion analytics webhooks
- `WEBHOOK_MAX_RETRIES` - webhook retry count, default `3`
- `WEBHOOK_BACKOFF_MS` - initial webhook retry delay, default `1000`

Use `.env.example` as a starting point:

```bash
cp .env.example .env
```

Then update the values in `.env` for your local PostgreSQL and MongoDB instances.

## Install and run

Install dependencies:

```bash
npm install
```

Create the PostgreSQL database named in your `DATABASE_URL`. For example:

```bash
createdb task_manager
```

MongoDB will create the `task_manager` database automatically when tasks are inserted, as long as the MongoDB server is running.

Start the server:

```bash
npm start
```

The application listens on the configured port and exposes the API under `/api`.

Run a quick syntax check:

```bash
npm test
```

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
  "categoryId": "662...",
  "tags": ["High Priority", "Client A"],
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
  "categoryId": "662...",
  "tags": ["High Priority", "Client A"],
  "status": "pending",
  "createdAt": "2026-04-24T00:00:00.000Z",
  "updatedAt": "2026-04-24T00:00:00.000Z",
  "__v": 0
}
```

### List all tasks

GET `/api/tasks`

Optional filters:

- `categoryId=662...`
- `category=Work`
- `tag=High%20Priority`
- `tags=High%20Priority,Client%20A`

Example:

```http
GET /api/tasks?category=Work&tags=High%20Priority,Client%20A
```

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
    "categoryId": "662...",
    "tags": ["High Priority", "Client A"],
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
  "categoryId": "662...",
  "tags": ["High Priority", "Client A"],
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
  "status": "completed"
}
```

Partial updates are allowed. Send any one or more of `title`, `description`, `dueDate`, or `status`.
You can also update `categoryId` and replace the task's `tags` array.

Response example:

```json
{
  "_id": "60d...",
  "userId": "UUID",
  "title": "Finish report",
  "description": "Update with final notes",
  "dueDate": "2026-05-02T12:00:00.000Z",
  "categoryId": "662...",
  "tags": ["High Priority", "Client A"],
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

### Create a category

POST `/api/categories`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "name": "Work"
}
```

### List categories

GET `/api/categories`

Headers:

```http
Authorization: Bearer <jwt-token>
```

### Get category by ID

GET `/api/categories/:id`

Headers:

```http
Authorization: Bearer <jwt-token>
```

### Update a category

PATCH `/api/categories/:id`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "name": "Personal"
}
```

### Delete a category

DELETE `/api/categories/:id`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Deleting a category removes that category reference from the user's tasks.

### Create a tag

POST `/api/tags`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "name": "High Priority"
}
```

### List tags

GET `/api/tags`

Headers:

```http
Authorization: Bearer <jwt-token>
```

### Get tag by ID

GET `/api/tags/:id`

Headers:

```http
Authorization: Bearer <jwt-token>
```

### Update a tag

PATCH `/api/tags/:id`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "name": "Client A"
}
```

Renaming a tag updates matching tag names on the user's tasks.

### Delete a tag

DELETE `/api/tags/:id`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Deleting a tag removes that tag name from the user's tasks.

## Validation rules

- User registration requires `email` and `password`.
- User login requires `email` and `password`.
- Password must be at least 8 characters.
- Task creation requires `title`, `dueDate`, and optional `description`, `categoryId`, `tags`, and `status`.
- Task update allows partial updates, but the request body must contain at least one valid task field.
- `dueDate` must be a future ISO date.
- `status` can only be `pending` or `completed`.
- `categoryId` must belong to the authenticated user when provided.
- `tags` must be an array of unique strings.
- Category and tag names must be 2-60 characters.

## Reminder scheduling

When a task is created with a future `dueDate`, the API schedules an in-memory reminder using `setTimeout`.
By default, the reminder logs one hour before the due date. You can change that delay with `REMINDER_LEAD_MS`.

If a task's `dueDate` changes, the old reminder is cancelled and a new one is scheduled.
If a task is marked `completed` or deleted before the reminder fires, the reminder is cancelled.
This scheduler is intentionally simple and resets when the Node process restarts.

## Webhook integration

When a task changes from `pending` to `completed`, the API sends a POST request to `EXTERNAL_WEBHOOK_URL`.
The payload includes:

```json
{
  "event": "task.completed",
  "task": {
    "id": "60d...",
    "title": "Finish report",
    "completedAt": "2026-04-28T15:30:00.000Z",
    "userId": "UUID"
  }
}
```

If delivery fails, the API retries with exponential backoff. The defaults are 3 retries and an initial 1000 ms delay.
If no webhook URL is configured, the API logs that the webhook was skipped.

## Design choices

- Categories are dynamic and user-owned MongoDB documents. This lets each user create their own task organization without hardcoding a fixed list.
- Tags are also user-owned documents for management endpoints, while tasks store tag names directly. This keeps task filtering simple and allows free-form tags as requested.
- Reminders use an in-memory `setTimeout` scheduler because the assignment allows a lightweight simulated approach. It is easy to demonstrate locally, but a production system should use a durable queue.
- Webhook delivery is intentionally decoupled from the task update response. The API returns the updated task immediately while delivery retries happen asynchronously.

## Demo video checklist

Use this order for the required short video:

1. Show `.env` setup from `.env.example`, then run `npm install` and `npm start`.
2. Register and log in a user, then copy the JWT.
3. Create a category such as `Work` and a tag such as `High Priority`.
4. Create a task with a future `dueDate`, `categoryId`, and `tags`, then show the reminder scheduled log.
5. List tasks filtered by `category=Work` and `tags=High%20Priority`.
6. Mark the task as `completed`, then show the reminder cancellation log and webhook delivery or skipped log.
7. Briefly explain that reminders are in-memory and webhook retries use exponential backoff.

## Error responses

Common failures return JSON in this shape:

```json
{
  "error": {
    "message": "Task not found or access denied",
    "type": "Error",
    "path": "/api/tasks/..."
  }
}
```

Typical status codes:

- `400 Bad Request` for validation errors or malformed task IDs.
- `401 Unauthorized` for missing, invalid, or expired JWTs.
- `404 Not Found` when a route or owned task cannot be found.
- `409 Conflict` when registering an email that already exists.
- `500 Internal Server Error` for unexpected server failures.

## Notes

- `auth` middleware reads the JWT from the `Authorization` header.
- `tasks` are stored in MongoDB and are scoped to the authenticated user.
- `users` are managed in PostgreSQL via Sequelize.
- A task query always includes both the task ID and authenticated user ID, so one user cannot view, update, or delete another user's task.
