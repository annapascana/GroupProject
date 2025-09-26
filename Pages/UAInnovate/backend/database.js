const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'innovate.db'));
        this.init();
    }

    init() {
        // Create users table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                year TEXT NOT NULL,
                major TEXT NOT NULL,
                mis_semester TEXT,
                technical_skills TEXT,
                interests TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create groups table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                focus TEXT NOT NULL,
                size_preference TEXT,
                required_skills TEXT,
                max_members INTEGER DEFAULT 4,
                current_members INTEGER DEFAULT 1,
                created_by TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (user_id)
            )
        `);

        // Create group_members table (many-to-many relationship)
        this.db.run(`
            CREATE TABLE IF NOT EXISTS group_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES groups (group_id),
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                UNIQUE(group_id, user_id)
            )
        `);

        // Create group_messages table for group messaging
        this.db.run(`
            CREATE TABLE IF NOT EXISTS group_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT UNIQUE NOT NULL,
                group_id TEXT NOT NULL,
                user_id TEXT,
                message TEXT NOT NULL,
                message_type TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES groups (group_id),
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        `);

        // Create group_invites table for group invitations
        this.db.run(`
            CREATE TABLE IF NOT EXISTS group_invites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invite_id TEXT UNIQUE NOT NULL,
                group_id TEXT NOT NULL,
                inviter_id TEXT NOT NULL,
                invitee_email TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (group_id) REFERENCES groups (group_id),
                FOREIGN KEY (inviter_id) REFERENCES users (user_id)
            )
        `);

        // Create trips table for travel page
        this.db.run(`
            CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trip_id TEXT UNIQUE NOT NULL,
                destination TEXT NOT NULL,
                departure_date TEXT NOT NULL,
                departure_time TEXT NOT NULL,
                return_date TEXT,
                return_time TEXT,
                total_seats INTEGER NOT NULL,
                available_seats INTEGER NOT NULL,
                cost_per_person REAL NOT NULL,
                trip_type TEXT NOT NULL,
                description TEXT,
                created_by TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (created_by) REFERENCES users (user_id)
            )
        `);

        // Create trip_messages table for trip messaging
        this.db.run(`
            CREATE TABLE IF NOT EXISTS trip_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT UNIQUE NOT NULL,
                trip_id TEXT NOT NULL,
                user_id TEXT,
                message TEXT NOT NULL,
                message_type TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (trip_id) REFERENCES trips (trip_id),
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        `);
    }

    // User operations
    createUser(userData) {
        return new Promise((resolve, reject) => {
            const { userId, year, major, misSemester, technicalSkills, interests } = userData;
            this.db.run(
                `INSERT OR REPLACE INTO users (user_id, year, major, mis_semester, technical_skills, interests)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, year, major, misSemester, technicalSkills, interests],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, userId });
                }
            );
        });
    }

    getUser(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    updateUser(userId, userData) {
        return new Promise((resolve, reject) => {
            const { year, major, misSemester, technicalSkills, interests } = userData;
            this.db.run(
                `UPDATE users SET year = ?, major = ?, mis_semester = ?, technical_skills = ?, interests = ?
                 WHERE user_id = ?`,
                [year, major, misSemester, technicalSkills, interests, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ userId, changes: this.changes });
                }
            );
        });
    }

    // Group operations
    createGroup(groupData) {
        return new Promise((resolve, reject) => {
            const { groupId, name, description, focus, sizePreference, requiredSkills, createdBy } = groupData;
            this.db.run(
                `INSERT INTO groups (group_id, name, description, focus, size_preference, required_skills, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [groupId, name, description, focus, sizePreference, requiredSkills, createdBy],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, groupId });
                }
            );
        });
    }

    addGroupMember(groupId, userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
                [groupId, userId],
                function(err) {
                    if (err) reject(err);
                    else {
                        // Update current_members count
                        this.db.run(
                            'UPDATE groups SET current_members = current_members + 1 WHERE group_id = ?',
                            [groupId],
                            (err) => {
                                if (err) reject(err);
                                else resolve({ id: this.lastID });
                            }
                        );
                    }
                }
            );
        });
    }

    removeGroupMember(groupId, userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
                [groupId, userId],
                function(err) {
                    if (err) reject(err);
                    else {
                        // Update current_members count
                        this.db.run(
                            'UPDATE groups SET current_members = current_members - 1 WHERE group_id = ?',
                            [groupId],
                            (err) => {
                                if (err) reject(err);
                                else resolve({ id: this.lastID });
                            }
                        );
                    }
                }
            );
        });
    }

    getGroup(groupId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM groups WHERE group_id = ?',
                [groupId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    getUserGroups(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT g.*, gm.joined_at 
                 FROM groups g 
                 JOIN group_members gm ON g.group_id = gm.group_id 
                 WHERE gm.user_id = ?`,
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    searchGroups(filters = {}) {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM groups WHERE 1=1';
            const params = [];

            if (filters.searchQuery) {
                query += ' AND (name LIKE ? OR description LIKE ? OR required_skills LIKE ?)';
                const searchTerm = `%${filters.searchQuery}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (filters.focus) {
                query += ' AND focus = ?';
                params.push(filters.focus);
            }

            if (filters.year) {
                query += ' AND group_id IN (SELECT gm.group_id FROM group_members gm JOIN users u ON gm.user_id = u.user_id WHERE u.year = ?)';
                params.push(filters.year);
            }

            // Exclude full groups
            query += ' AND current_members < max_members';

            query += ' ORDER BY created_at DESC';

            this.db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    getGroupMembers(groupId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT u.*, gm.joined_at 
                 FROM users u 
                 JOIN group_members gm ON u.user_id = gm.user_id 
                 WHERE gm.group_id = ?`,
                [groupId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    isUserInGroup(groupId, userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
                [groupId, userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(!!row);
                }
            );
        });
    }

    // Group Messaging Methods
    createGroupMessage(groupId, userId, message, messageType = 'user') {
        return new Promise((resolve, reject) => {
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.db.run(
                `INSERT INTO group_messages (message_id, group_id, user_id, message, message_type, created_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                [messageId, groupId, userId, message, messageType],
                function(err) {
                    if (err) reject(err);
                    else resolve({ messageId: this.lastID });
                }
            );
        });
    }

    getGroupMessages(groupId, limit = 50, offset = 0) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT gm.*, u.username, u.email
                 FROM group_messages gm
                 LEFT JOIN users u ON gm.user_id = u.user_id
                 WHERE gm.group_id = ?
                 ORDER BY gm.created_at DESC
                 LIMIT ? OFFSET ?`,
                [groupId, limit, offset],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.reverse()); // Reverse to show oldest first
                }
            );
        });
    }

    createGroupInvite(groupId, inviterId, inviteeEmail, status = 'pending') {
        return new Promise((resolve, reject) => {
            const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.db.run(
                `INSERT INTO group_invites (invite_id, group_id, inviter_id, invitee_email, status, created_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                [inviteId, groupId, inviterId, inviteeEmail, status],
                function(err) {
                    if (err) reject(err);
                    else resolve({ inviteId: this.lastID });
                }
            );
        });
    }

    getGroupInvites(groupId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT gi.*, u.username as inviter_name
                 FROM group_invites gi
                 LEFT JOIN users u ON gi.inviter_id = u.user_id
                 WHERE gi.group_id = ?
                 ORDER BY gi.created_at DESC`,
                [groupId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    updateInviteStatus(inviteId, status) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE group_invites SET status = ?, updated_at = datetime('now')
                 WHERE invite_id = ?`,
                [status, inviteId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    }

    getUserInvites(userEmail) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT gi.*, g.name as group_name, g.description, u.username as inviter_name
                 FROM group_invites gi
                 JOIN groups g ON gi.group_id = g.group_id
                 LEFT JOIN users u ON gi.inviter_id = u.user_id
                 WHERE gi.invitee_email = ? AND gi.status = 'pending'
                 ORDER BY gi.created_at DESC`,
                [userEmail],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    // Trip Management Methods
    createTrip(tripData) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO trips (trip_id, destination, departure_date, departure_time, 
                 return_date, return_time, total_seats, available_seats, cost_per_person, 
                 trip_type, description, created_by, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                [
                    tripData.trip_id,
                    tripData.destination,
                    tripData.departure_date,
                    tripData.departure_time,
                    tripData.return_date,
                    tripData.return_time,
                    tripData.total_seats,
                    tripData.available_seats,
                    tripData.cost_per_person,
                    tripData.trip_type,
                    tripData.description,
                    tripData.created_by
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve({ tripId: tripData.trip_id });
                }
            );
        });
    }

    getAllTrips() {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM trips ORDER BY created_at DESC`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    getTrip(tripId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT * FROM trips WHERE trip_id = ?`,
                [tripId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    updateTrip(tripId, updateData) {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];
            
            Object.keys(updateData).forEach(key => {
                if (key !== 'trip_id') {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            if (fields.length === 0) {
                resolve({ changes: 0 });
                return;
            }
            
            values.push(tripId);
            
            this.db.run(
                `UPDATE trips SET ${fields.join(', ')}, updated_at = datetime('now') WHERE trip_id = ?`,
                values,
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    }

    deleteTrip(tripId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `DELETE FROM trips WHERE trip_id = ?`,
                [tripId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    }

    // Trip Message Methods
    createTripMessage(tripId, userId, message, messageType = 'user') {
        return new Promise((resolve, reject) => {
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.db.run(
                `INSERT INTO trip_messages (message_id, trip_id, user_id, message, message_type, created_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                [messageId, tripId, userId, message, messageType],
                function(err) {
                    if (err) reject(err);
                    else resolve({ messageId: this.lastID });
                }
            );
        });
    }

    getTripMessages(tripId, limit = 50, offset = 0) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT tm.*, u.username, u.email
                 FROM trip_messages tm
                 LEFT JOIN users u ON tm.user_id = u.user_id
                 WHERE tm.trip_id = ?
                 ORDER BY tm.created_at DESC
                 LIMIT ? OFFSET ?`,
                [tripId, limit, offset],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.reverse()); // Reverse to show oldest first
                }
            );
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = Database;
