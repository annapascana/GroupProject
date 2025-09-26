const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create avatars subdirectory
const avatarsDir = path.join(uploadsDir, 'avatars');
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'crimsoncollab.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️  Initializing CrimsonCollab Database...');

// Create tables
db.serialize(() => {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
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
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('✅ Users table created');
        }
    });

    // Password reset OTPs table
    db.run(`
        CREATE TABLE IF NOT EXISTS password_reset_otps (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            otp TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            attempts INTEGER DEFAULT 0,
            max_attempts INTEGER DEFAULT 3,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating password_reset_otps table:', err.message);
        } else {
            console.log('✅ Password reset OTPs table created');
        }
    });

    // User activities table
    db.run(`
        CREATE TABLE IF NOT EXISTS user_activities (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating user_activities table:', err.message);
        } else {
            console.log('✅ User activities table created');
        }
    });

    // User events table
    db.run(`
        CREATE TABLE IF NOT EXISTS user_events (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            start_date DATETIME NOT NULL,
            end_date DATETIME,
            location TEXT,
            type TEXT DEFAULT 'event',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating user_events table:', err.message);
        } else {
            console.log('✅ User events table created');
        }
    });

    // User messages table
    db.run(`
        CREATE TABLE IF NOT EXISTS user_messages (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            conversation_name TEXT NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating user_messages table:', err.message);
        } else {
            console.log('✅ User messages table created');
        }
    });

    // User favorites table
    db.run(`
        CREATE TABLE IF NOT EXISTS user_favorites (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            item_type TEXT NOT NULL,
            item_id TEXT NOT NULL,
            item_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, item_type, item_id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating user_favorites table:', err.message);
        } else {
            console.log('✅ User favorites table created');
        }
    });

    // User preferences table
    db.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            preference_key TEXT NOT NULL,
            preference_value TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, preference_key)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating user_preferences table:', err.message);
        } else {
            console.log('✅ User preferences table created');
        }
    });

    // Create indexes for better performance
    db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
        if (err) {
            console.error('Error creating users email index:', err.message);
        } else {
            console.log('✅ Users email index created');
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_activities_user_id ON user_activities(user_id)', (err) => {
        if (err) {
            console.error('Error creating activities user_id index:', err.message);
        } else {
            console.log('✅ Activities user_id index created');
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_events_user_id ON user_events(user_id)', (err) => {
        if (err) {
            console.error('Error creating events user_id index:', err.message);
        } else {
            console.log('✅ Events user_id index created');
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_messages_user_id ON user_messages(user_id)', (err) => {
        if (err) {
            console.error('Error creating messages user_id index:', err.message);
        } else {
            console.log('✅ Messages user_id index created');
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON user_favorites(user_id)', (err) => {
        if (err) {
            console.error('Error creating favorites user_id index:', err.message);
        } else {
            console.log('✅ Favorites user_id index created');
        }
    });

    // Insert sample data
    db.run(`
        INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, verified, role) 
        VALUES ('admin-001', 'admin@crimsoncollab.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Qz8QzO', 'Admin', 'User', 1, 'admin')
    `, (err) => {
        if (err) {
            console.error('Error inserting admin user:', err.message);
        } else {
            console.log('✅ Admin user created (email: admin@crimsoncollab.com, password: admin123)');
        }
    });
});

// Close database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('🎉 Database initialization completed successfully!');
        console.log(`📁 Database location: ${dbPath}`);
        console.log(`📁 Uploads directory: ${uploadsDir}`);
        console.log('');
        console.log('🚀 You can now start the server with: npm start');
    }
});
