# CrimsonCollab Backend API

A Node.js/Express backend API with SQLite database for the CrimsonCollab collaboration platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Initialize the database:**
```bash
npm run init-db
```

3. **Start the server:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── routes/
│   ├── auth.js          # Authentication endpoints
│   ├── users.js         # User management endpoints
│   ├── dashboard.js     # Dashboard data endpoints
│   └── oauth.js         # OAuth integration endpoints
├── scripts/
│   └── init-database.js # Database initialization
├── database/
│   └── crimsoncollab.db # SQLite database file
├── uploads/
│   └── avatars/         # User avatar uploads
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── env.example          # Environment variables template
```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

**Required variables:**
- `JWT_SECRET`: Secret key for JWT tokens
- `EMAIL_USER`: Gmail address for sending OTP emails
- `EMAIL_PASS`: Gmail app password

**Optional variables:**
- `PORT`: Server port (default: 3000)
- `FRONTEND_URL`: Frontend URL for CORS
- OAuth credentials for Google, GitHub, Microsoft

### Database

The SQLite database is automatically created and initialized with:
- Users table
- Password reset OTPs table
- User activities table
- User events table
- User messages table
- User favorites table
- User preferences table

## 📚 API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /forgot-password` - Send OTP for password reset
- `POST /verify-otp` - Verify OTP code
- `POST /reset-password` - Reset password with OTP

### Users (`/api/users`)

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /upload-avatar` - Upload user avatar
- `GET /preferences` - Get user preferences
- `PUT /preferences` - Update user preferences
- `GET /stats` - Get user statistics
- `DELETE /account` - Delete user account

### Dashboard (`/api/dashboard`)

- `GET /activities` - Get user activities
- `POST /activities` - Add user activity
- `GET /events` - Get user events
- `POST /events` - Add user event
- `PUT /events/:id` - Update user event
- `DELETE /events/:id` - Delete user event
- `GET /messages` - Get user messages
- `POST /messages` - Add user message
- `GET /favorites` - Get user favorites
- `POST /favorites` - Add user favorite
- `DELETE /favorites/:id` - Remove user favorite

### OAuth (`/api/oauth`)

- `GET /:provider` - Initiate OAuth login
- `GET /:provider/callback` - Handle OAuth callback

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: express-validator for request validation
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers
- **File Upload Security**: Image-only uploads with size limits

## 📧 Email Integration

The system includes email functionality for:
- Password reset OTPs
- Account verification
- Notifications

**Setup Gmail SMTP:**
1. Enable 2-factor authentication on Gmail
2. Generate an app password
3. Set `EMAIL_USER` and `EMAIL_PASS` in `.env`

## 🔄 OAuth Integration

Supports OAuth login with:
- **Google**: Google OAuth 2.0
- **GitHub**: GitHub OAuth
- **Microsoft**: Microsoft Graph API

**Setup OAuth:**
1. Create OAuth apps with each provider
2. Set redirect URIs to `http://localhost:3000/api/oauth/{provider}/callback`
3. Configure client IDs and secrets in `.env`

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    social_provider TEXT,
    social_id TEXT,
    verified BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Password Reset OTPs
```sql
CREATE TABLE password_reset_otps (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database and create tables

### Testing

Test the API with curl or Postman:

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get profile (with JWT token)
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database
4. Set up proper email service
5. Configure OAuth with production URLs

### Security Checklist
- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Use environment variables for secrets

## 📝 API Documentation

### Authentication Flow

1. **Register/Login** → Get JWT token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Token expires** in 24 hours, refresh as needed

### Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Success Responses

Successful operations return:
```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
