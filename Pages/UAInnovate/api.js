// API client for UA Innovate backend
class InnovateAPI {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // User methods
    async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getUser(userId) {
        return this.request(`/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Group methods
    async createGroup(groupData) {
        return this.request('/groups', {
            method: 'POST',
            body: JSON.stringify(groupData)
        });
    }

    async searchGroups(filters = {}) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
        
        const queryString = params.toString();
        const endpoint = queryString ? `/groups?${queryString}` : '/groups';
        return this.request(endpoint);
    }

    async getGroup(groupId) {
        return this.request(`/groups/${groupId}`);
    }

    async getUserGroups(userId) {
        return this.request(`/users/${userId}/groups`);
    }

    async joinGroup(groupId, userId) {
        return this.request(`/groups/${groupId}/join`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async leaveGroup(groupId, userId) {
        return this.request(`/groups/${groupId}/leave`, {
            method: 'DELETE',
            body: JSON.stringify({ userId })
        });
    }

    // Group Messaging Methods
    async sendGroupMessage(groupId, userId, message, messageType = 'user') {
        return this.request(`/groups/${groupId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ userId, message, messageType })
        });
    }

    async getGroupMessages(groupId, limit = 50, offset = 0) {
        return this.request(`/groups/${groupId}/messages?limit=${limit}&offset=${offset}`);
    }

    async sendGroupInvite(groupId, inviterId, inviteeEmail) {
        return this.request(`/groups/${groupId}/invites`, {
            method: 'POST',
            body: JSON.stringify({ inviterId, inviteeEmail })
        });
    }

    async getGroupInvites(groupId) {
        return this.request(`/groups/${groupId}/invites`);
    }

    async updateInviteStatus(inviteId, status) {
        return this.request(`/invites/${inviteId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async getUserInvites(userEmail) {
        return this.request(`/users/${userEmail}/invites`);
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Create global API instance
window.innovateAPI = new InnovateAPI();
