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

    close() {
        this.db.close();
    }
}

module.exports = Database;
