const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { db } = require('../server');

const router = express.Router();

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

// Get user activities
router.get('/activities', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    db.all(
        'SELECT * FROM user_activities WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            const activities = rows.map(row => ({
                id: row.id,
                type: row.type,
                title: row.title,
                description: row.description,
                metadata: row.metadata ? JSON.parse(row.metadata) : null,
                createdAt: row.created_at
            }));

            res.json(activities);
        }
    );
});

// Add user activity
router.post('/activities', authenticateToken, [
    body('type').notEmpty().withMessage('Activity type is required'),
    body('title').notEmpty().withMessage('Activity title is required'),
    body('description').optional().trim()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, title, description, metadata } = req.body;
        const userId = req.user.userId;
        const activityId = uuidv4();

        db.run(
            'INSERT INTO user_activities (id, user_id, type, title, description, metadata) VALUES (?, ?, ?, ?, ?, ?)',
            [activityId, userId, type, title, description, metadata ? JSON.stringify(metadata) : null],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to add activity' });
                }

                res.status(201).json({
                    message: 'Activity added successfully',
                    activity: {
                        id: activityId,
                        type,
                        title,
                        description,
                        metadata,
                        createdAt: new Date().toISOString()
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user events
router.get('/events', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = 'SELECT * FROM user_events WHERE user_id = ?';
    let params = [userId];

    if (startDate && endDate) {
        query += ' AND start_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
    }

    query += ' ORDER BY start_date ASC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const events = rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            startDate: row.start_date,
            endDate: row.end_date,
            location: row.location,
            type: row.type,
            createdAt: row.created_at
        }));

        res.json(events);
    });
});

// Add user event
router.post('/events', authenticateToken, [
    body('title').notEmpty().withMessage('Event title is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601(),
    body('description').optional().trim(),
    body('location').optional().trim(),
    body('type').optional().trim()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, startDate, endDate, location, type } = req.body;
        const userId = req.user.userId;
        const eventId = uuidv4();

        db.run(
            'INSERT INTO user_events (id, user_id, title, description, start_date, end_date, location, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [eventId, userId, title, description, startDate, endDate || null, location || null, type || 'event'],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to add event' });
                }

                res.status(201).json({
                    message: 'Event added successfully',
                    event: {
                        id: eventId,
                        title,
                        description,
                        startDate,
                        endDate,
                        location,
                        type: type || 'event',
                        createdAt: new Date().toISOString()
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user event
router.put('/events/:eventId', authenticateToken, [
    body('title').optional().notEmpty(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('description').optional().trim(),
    body('location').optional().trim(),
    body('type').optional().trim()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { eventId } = req.params;
        const { title, description, startDate, endDate, location, type } = req.body;
        const userId = req.user.userId;

        // Build dynamic update query
        const updates = [];
        const params = [];

        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (startDate !== undefined) {
            updates.push('start_date = ?');
            params.push(startDate);
        }
        if (endDate !== undefined) {
            updates.push('end_date = ?');
            params.push(endDate);
        }
        if (location !== undefined) {
            updates.push('location = ?');
            params.push(location);
        }
        if (type !== undefined) {
            updates.push('type = ?');
            params.push(type);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(eventId, userId);

        db.run(
            `UPDATE user_events SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            params,
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update event' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Event not found' });
                }

                res.json({ message: 'Event updated successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user event
router.delete('/events/:eventId', authenticateToken, (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.userId;

    db.run(
        'DELETE FROM user_events WHERE id = ? AND user_id = ?',
        [eventId, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete event' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json({ message: 'Event deleted successfully' });
        }
    );
});

// Get user messages
router.get('/messages', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const conversationName = req.query.conversation;

    let query = 'SELECT * FROM user_messages WHERE user_id = ?';
    let params = [userId];

    if (conversationName) {
        query += ' AND conversation_name = ?';
        params.push(conversationName);
    }

    query += ' ORDER BY timestamp ASC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const messages = rows.map(row => ({
            id: row.id,
            conversationName: row.conversation_name,
            sender: row.sender,
            message: row.message,
            timestamp: row.timestamp
        }));

        res.json(messages);
    });
});

// Add user message
router.post('/messages', authenticateToken, [
    body('conversationName').notEmpty().withMessage('Conversation name is required'),
    body('sender').notEmpty().withMessage('Sender is required'),
    body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { conversationName, sender, message } = req.body;
        const userId = req.user.userId;
        const messageId = uuidv4();

        db.run(
            'INSERT INTO user_messages (id, user_id, conversation_name, sender, message) VALUES (?, ?, ?, ?, ?)',
            [messageId, userId, conversationName, sender, message],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to add message' });
                }

                res.status(201).json({
                    message: 'Message added successfully',
                    messageData: {
                        id: messageId,
                        conversationName,
                        sender,
                        message,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user favorites
router.get('/favorites', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.all(
        'SELECT * FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            const favorites = rows.map(row => ({
                id: row.id,
                itemType: row.item_type,
                itemId: row.item_id,
                itemName: row.item_name,
                createdAt: row.created_at
            }));

            res.json(favorites);
        }
    );
});

// Add user favorite
router.post('/favorites', authenticateToken, [
    body('itemType').notEmpty().withMessage('Item type is required'),
    body('itemId').notEmpty().withMessage('Item ID is required'),
    body('itemName').notEmpty().withMessage('Item name is required')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { itemType, itemId, itemName } = req.body;
        const userId = req.user.userId;
        const favoriteId = uuidv4();

        db.run(
            'INSERT INTO user_favorites (id, user_id, item_type, item_id, item_name) VALUES (?, ?, ?, ?, ?)',
            [favoriteId, userId, itemType, itemId, itemName],
            function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                        return res.status(409).json({ error: 'Item already in favorites' });
                    }
                    return res.status(500).json({ error: 'Failed to add favorite' });
                }

                res.status(201).json({
                    message: 'Favorite added successfully',
                    favorite: {
                        id: favoriteId,
                        itemType,
                        itemId,
                        itemName,
                        createdAt: new Date().toISOString()
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove user favorite
router.delete('/favorites/:favoriteId', authenticateToken, (req, res) => {
    const { favoriteId } = req.params;
    const userId = req.user.userId;

    db.run(
        'DELETE FROM user_favorites WHERE id = ? AND user_id = ?',
        [favoriteId, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to remove favorite' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Favorite not found' });
            }

            res.json({ message: 'Favorite removed successfully' });
        }
    );
});

module.exports = router;
