const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { db } = require('../server');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/avatars'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    db.get(
        'SELECT id, email, first_name, last_name, avatar_url, social_provider, verified, role, created_at, last_login FROM users WHERE id = ?',
        [req.user.userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                avatar: user.avatar_url,
                socialProvider: user.social_provider,
                verified: user.verified,
                role: user.role,
                createdAt: user.created_at,
                lastLogin: user.last_login
            });
        }
    );
});

// Update user profile
router.put('/profile', authenticateToken, [
    body('firstName').optional().trim().isLength({ min: 1 }),
    body('lastName').optional().trim().isLength({ min: 1 }),
    body('phone').optional().isMobilePhone(),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('major').optional().trim().isLength({ max: 100 }),
    body('year').optional().isIn(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']),
    body('skills').optional().isArray()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, phone, bio, major, year, skills } = req.body;
        const userId = req.user.userId;

        // Update basic profile info
        if (firstName || lastName) {
            db.run(
                'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE id = ?',
                [firstName, lastName, userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to update profile' });
                    }
                }
            );
        }

        // Update preferences
        const preferences = { phone, bio, major, year, skills };
        Object.entries(preferences).forEach(([key, value]) => {
            if (value !== undefined) {
                const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
                db.run(
                    'INSERT OR REPLACE INTO user_preferences (id, user_id, preference_key, preference_value, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                    [uuidv4(), userId, key, valueStr]
                );
            }
        });

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload avatar
router.post('/upload-avatar', authenticateToken, upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.userId;
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Update user avatar
        db.run(
            'UPDATE users SET avatar_url = ? WHERE id = ?',
            [avatarUrl, userId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update avatar' });
                }

                res.json({
                    message: 'Avatar uploaded successfully',
                    avatarUrl: avatarUrl
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user preferences
router.get('/preferences', authenticateToken, (req, res) => {
    db.all(
        'SELECT preference_key, preference_value FROM user_preferences WHERE user_id = ?',
        [req.user.userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            const preferences = {};
            rows.forEach(row => {
                try {
                    preferences[row.preference_key] = JSON.parse(row.preference_value);
                } catch {
                    preferences[row.preference_key] = row.preference_value;
                }
            });

            res.json(preferences);
        }
    );
});

// Update user preferences
router.put('/preferences', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const preferences = req.body;

        Object.entries(preferences).forEach(([key, value]) => {
            const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
            db.run(
                'INSERT OR REPLACE INTO user_preferences (id, user_id, preference_key, preference_value, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [uuidv4(), userId, key, valueStr]
            );
        });

        res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user statistics
router.get('/stats', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    // Get activities count
    db.get('SELECT COUNT(*) as count FROM user_activities WHERE user_id = ?', [userId], (err, activitiesResult) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        // Get events count
        db.get('SELECT COUNT(*) as count FROM user_events WHERE user_id = ?', [userId], (err, eventsResult) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            // Get messages count
            db.get('SELECT COUNT(*) as count FROM user_messages WHERE user_id = ?', [userId], (err, messagesResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                // Get favorites count
                db.get('SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?', [userId], (err, favoritesResult) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    res.json({
                        activities: activitiesResult.count,
                        events: eventsResult.count,
                        messages: messagesResult.count,
                        favorites: favoritesResult.count
                    });
                });
            });
        });
    });
});

// Delete user account
router.delete('/account', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    // Delete user data
    db.serialize(() => {
        db.run('DELETE FROM user_activities WHERE user_id = ?', [userId]);
        db.run('DELETE FROM user_events WHERE user_id = ?', [userId]);
        db.run('DELETE FROM user_messages WHERE user_id = ?', [userId]);
        db.run('DELETE FROM user_favorites WHERE user_id = ?', [userId]);
        db.run('DELETE FROM user_preferences WHERE user_id = ?', [userId]);
        db.run('DELETE FROM password_reset_otps WHERE email = (SELECT email FROM users WHERE id = ?)', [userId]);
        db.run('UPDATE users SET is_active = 0 WHERE id = ?', [userId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete account' });
            }
            res.json({ message: 'Account deleted successfully' });
        });
    });
});

module.exports = router;
