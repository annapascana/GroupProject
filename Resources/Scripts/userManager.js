// CrimsonCollab User Management System

class UserManager {
    constructor() {
        this.storageKey = 'crimsonCollab_users';
        this.sessionKey = 'crimsonCollab_session';
        this.initializeStorage();
    }

    // Initialize storage with default admin user if empty
    initializeStorage() {
        const users = this.getUsers();
        if (users.length === 0) {
            // Create a default admin user for testing
            const defaultUser = {
                id: this.generateId(),
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@crimsoncollab.com',
                password: this.hashPassword('admin123'),
                role: 'admin',
                createdAt: new Date().toISOString(),
                isActive: true
            };
            this.saveUser(defaultUser);
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Simple password hashing (in production, use proper hashing)
    hashPassword(password) {
        // Simple hash for demo purposes - in production use bcrypt or similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Get all users from storage
    getUsers() {
        try {
            const users = localStorage.getItem(this.storageKey);
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    // Save users to storage
    saveUsers(users) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Error saving users:', error);
            return false;
        }
    }

    // Save a single user
    saveUser(user) {
        const users = this.getUsers();
        const existingIndex = users.findIndex(u => u.id === user.id);
        
        if (existingIndex >= 0) {
            users[existingIndex] = user;
        } else {
            users.push(user);
        }
        
        return this.saveUsers(users);
    }

    // Find user by email
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Find user by ID
    findUserById(id) {
        const users = this.getUsers();
        return users.find(user => user.id === id);
    }

    // Check if email already exists
    emailExists(email) {
        return this.findUserByEmail(email) !== undefined;
    }

    // Validate login credentials
    validateLogin(email, password) {
        const user = this.findUserByEmail(email);
        
        if (!user) {
            return { success: false, message: 'Account not found. Please create an account first.' };
        }

        if (!user.isActive) {
            return { success: false, message: 'Account is deactivated. Please contact support.' };
        }

        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return { success: false, message: 'Invalid password.' };
        }

        return { success: true, user: this.sanitizeUser(user) };
    }

    // Create new user account
    createUser(userData) {
        const { firstName, lastName, email, password } = userData;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return { success: false, message: 'All fields are required.' };
        }

        // Validate email format
        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Please enter a valid email address.' };
        }

        // Check if email already exists
        if (this.emailExists(email)) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        // Validate password strength
        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.isValid) {
            return { success: false, message: passwordValidation.message };
        }

        // Create new user
        const newUser = {
            id: this.generateId(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: this.hashPassword(password),
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            profile: {
                bio: '',
                interests: [],
                avatar: null
            }
        };

        // Save user
        if (this.saveUser(newUser)) {
            return { success: true, user: this.sanitizeUser(newUser) };
        } else {
            return { success: false, message: 'Failed to create account. Please try again.' };
        }
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    validatePassword(password) {
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long.' };
        }

        if (!/[A-Z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
        }

        if (!/[a-z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
        }

        if (!/\d/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one number.' };
        }

        return { isValid: true, message: 'Password is valid.' };
    }

    // Remove sensitive data from user object
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    // Create user session
    createSession(user) {
        const session = {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };

        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            
            // Update user's last login
            const user = this.findUserById(session.userId);
            if (user) {
                user.lastLogin = new Date().toISOString();
                this.saveUser(user);
            }
            
            // Trigger fresh start check for travel section
            this.triggerTravelFreshStart(user);
            
            return session;
        } catch (error) {
            console.error('Error creating session:', error);
            return null;
        }
    }

    // Trigger fresh start for travel section when new user logs in
    triggerTravelFreshStart(user) {
        try {
            // Check if travel page functions are available
            if (typeof window.checkForFreshStart === 'function') {
                window.checkForFreshStart(user);
            } else {
                // If travel functions aren't loaded yet, store the user ID for later check
                localStorage.setItem('travel_pending_fresh_start', user.id);
            }
        } catch (error) {
            console.error('Error triggering travel fresh start:', error);
        }
    }

    // Get current session
    getCurrentSession() {
        try {
            const session = localStorage.getItem(this.sessionKey);
            if (!session) return null;

            const sessionData = JSON.parse(session);
            
            // Check if session is expired
            if (new Date() > new Date(sessionData.expiresAt)) {
                this.clearSession();
                return null;
            }

            return sessionData;
        } catch (error) {
            console.error('Error getting session:', error);
            this.clearSession();
            return null;
        }
    }

    // Clear session (logout)
    clearSession() {
        try {
            localStorage.removeItem(this.sessionKey);
            return true;
        } catch (error) {
            console.error('Error clearing session:', error);
            return false;
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentSession() !== null;
    }

    // Get current user
    getCurrentUser() {
        const session = this.getCurrentSession();
        if (!session) return null;

        const user = this.findUserById(session.userId);
        return user ? this.sanitizeUser(user) : null;
    }

    // Update user profile
    updateUserProfile(userId, updates) {
        const user = this.findUserById(userId);
        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        // Update user data
        Object.assign(user, updates);
        user.updatedAt = new Date().toISOString();

        if (this.saveUser(user)) {
            return { success: true, user: this.sanitizeUser(user) };
        } else {
            return { success: false, message: 'Failed to update profile.' };
        }
    }

    // Delete user account
    deleteUser(userId) {
        const users = this.getUsers();
        const filteredUsers = users.filter(user => user.id !== userId);
        
        if (this.saveUsers(filteredUsers)) {
            // Clear session if deleting current user
            const session = this.getCurrentSession();
            if (session && session.userId === userId) {
                this.clearSession();
            }
            return { success: true };
        } else {
            return { success: false, message: 'Failed to delete account.' };
        }
    }

    // Get user statistics
    getUserStats() {
        const users = this.getUsers();
        const activeUsers = users.filter(user => user.isActive);
        const recentUsers = users.filter(user => {
            const createdAt = new Date(user.createdAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return createdAt > weekAgo;
        });

        return {
            totalUsers: users.length,
            activeUsers: activeUsers.length,
            recentUsers: recentUsers.length,
            adminUsers: users.filter(user => user.role === 'admin').length
        };
    }

    // Export users data (for backup)
    exportUsers() {
        const users = this.getUsers();
        return JSON.stringify(users, null, 2);
    }

    // Import users data (for restore)
    importUsers(jsonData) {
        try {
            const users = JSON.parse(jsonData);
            if (Array.isArray(users)) {
                return this.saveUsers(users);
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error importing users:', error);
            return false;
        }
    }
}

// Create global instance
window.userManager = new UserManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}
