const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
const db = new Database();

// User endpoints
app.post('/api/users', async (req, res) => {
    try {
        const { year, major, misSemester, technicalSkills, interests } = req.body;
        const userId = uuidv4();
        
        const userData = {
            userId,
            year,
            major,
            misSemester: misSemester || null,
            technicalSkills: technicalSkills || null,
            interests: interests || null
        };

        await db.createUser(userData);
        res.json({ success: true, userId, message: 'User profile created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: 'Failed to create user profile' });
    }
});

app.get('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await db.getUser(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

app.put('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { year, major, misSemester, technicalSkills, interests } = req.body;
        
        const userData = {
            userId,
            year,
            major,
            misSemester: misSemester || null,
            technicalSkills: technicalSkills || null,
            interests: interests || null
        };

        await db.createUser(userData);
        res.json({ success: true, message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Failed to update user profile' });
    }
});

// Group endpoints
app.post('/api/groups', async (req, res) => {
    try {
        const { name, description, focus, sizePreference, requiredSkills, createdBy } = req.body;
        const groupId = uuidv4();
        
        // Validate required fields
        if (!name || !description || !focus || !createdBy) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name, description, focus, and createdBy are required' 
            });
        }

        // Validate focus area
        const validFocusAreas = [
            'social-innovation',
            'data-analytics', 
            'fintech',
            'prototype-innovation',
            'full-stack-development',
            'cybersecurity'
        ];
        
        if (!validFocusAreas.includes(focus)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid focus area. Must be one of: ' + validFocusAreas.join(', ') 
            });
        }

        const groupData = {
            groupId,
            name,
            description,
            focus,
            sizePreference: sizePreference || null,
            requiredSkills: requiredSkills || null,
            createdBy
        };

        await db.createGroup(groupData);
        await db.addGroupMember(groupId, createdBy);
        
        res.json({ success: true, groupId, message: 'Group created successfully' });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ success: false, error: 'Failed to create group' });
    }
});

app.get('/api/groups', async (req, res) => {
    try {
        const { searchQuery, focus, year } = req.query;
        const filters = { searchQuery, focus, year };
        
        const groups = await db.searchGroups(filters);
        res.json({ success: true, groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch groups' });
    }
});

app.get('/api/groups/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await db.getGroup(groupId);
        
        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }
        
        const members = await db.getGroupMembers(groupId);
        res.json({ success: true, group: { ...group, members } });
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch group' });
    }
});

app.get('/api/users/:userId/groups', async (req, res) => {
    try {
        const { userId } = req.params;
        const groups = await db.getUserGroups(userId);
        res.json({ success: true, groups });
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user groups' });
    }
});

app.post('/api/groups/:groupId/join', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        // Check if group exists and is not full
        const group = await db.getGroup(groupId);
        if (!group) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        if (group.current_members >= group.max_members) {
            return res.status(400).json({ success: false, error: 'Group is full' });
        }

        // Check if user is already in the group
        const isInGroup = await db.isUserInGroup(groupId, userId);
        if (isInGroup) {
            return res.status(400).json({ success: false, error: 'User is already in this group' });
        }

        await db.addGroupMember(groupId, userId);
        res.json({ success: true, message: 'Successfully joined the group' });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ success: false, error: 'Failed to join group' });
    }
});

app.delete('/api/groups/:groupId/leave', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        // Check if user is in the group
        const isInGroup = await db.isUserInGroup(groupId, userId);
        if (!isInGroup) {
            return res.status(400).json({ success: false, error: 'User is not in this group' });
        }

        await db.removeGroupMember(groupId, userId);
        res.json({ success: true, message: 'Successfully left the group' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ success: false, error: 'Failed to leave group' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'UA Innovate API is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`UA Innovate API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close();
    process.exit(0);
});

module.exports = app;
