# UA Innovate Backend API

This is the backend API server for the UA Innovate group management system.

## Features

- User profile management
- Group creation and management
- Group search and filtering
- Member management (join/leave groups)
- SQLite database for data persistence
- RESTful API endpoints

## Installation

1. Navigate to the backend directory:
   ```bash
   cd Pages/UAInnovate/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Users
- `POST /api/users` - Create user profile
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile

### Groups
- `POST /api/groups` - Create new group
- `GET /api/groups` - Search groups (with query parameters)
- `GET /api/groups/:groupId` - Get specific group details
- `GET /api/users/:userId/groups` - Get user's groups
- `POST /api/groups/:groupId/join` - Join a group
- `DELETE /api/groups/:groupId/leave` - Leave a group

### Health Check
- `GET /api/health` - Server health check

## Database Schema

### Users Table
- id (INTEGER PRIMARY KEY)
- user_id (TEXT UNIQUE)
- year (TEXT)
- major (TEXT)
- mis_semester (TEXT)
- technical_skills (TEXT)
- interests (TEXT)
- created_at (DATETIME)

### Groups Table
- id (INTEGER PRIMARY KEY)
- group_id (TEXT UNIQUE)
- name (TEXT)
- description (TEXT)
- focus (TEXT)
- size_preference (TEXT)
- required_skills (TEXT)
- max_members (INTEGER, default 4)
- current_members (INTEGER, default 1)
- created_by (TEXT)
- created_at (DATETIME)

### Group Members Table
- id (INTEGER PRIMARY KEY)
- group_id (TEXT)
- user_id (TEXT)
- joined_at (DATETIME)

## Configuration

The server runs on port 3000 by default. You can change this by setting the PORT environment variable:

```bash
PORT=8080 npm start
```

## Development

The backend uses:
- Node.js and Express for the API server
- SQLite3 for the database
- CORS for cross-origin requests
- UUID for generating unique IDs

## API Response Format

All API responses follow this format:

```json
{
  "success": true/false,
  "data": {...}, // (optional)
  "error": "Error message", // (if success is false)
  "message": "Success message" // (optional)
}
```
