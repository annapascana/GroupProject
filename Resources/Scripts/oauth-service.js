// OAuth Service for CrimsonCollab
// Handles Google, GitHub, and Microsoft OAuth integration

class OAuthService {
    constructor() {
        // Use configuration from oauth-config.js if available, otherwise use defaults
        this.config = window.OAUTH_CONFIG || {
            google: {
                clientId: 'demo-google-client-id.apps.googleusercontent.com',
                redirectUri: window.location.origin + '/callback.html',
                scope: 'openid email profile',
                authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
            },
            github: {
                clientId: 'demo-github-client-id',
                redirectUri: window.location.origin + '/callback.html',
                scope: 'user:email',
                authUrl: 'https://github.com/login/oauth/authorize'
            },
            microsoft: {
                clientId: 'demo-microsoft-client-id',
                redirectUri: window.location.origin + '/callback.html',
                scope: 'openid email profile',
                authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
            }
        };
        
        this.state = this.generateState();
    }
    
    // Generate random state for OAuth security
    generateState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    // Initiate OAuth login (simulated for development)
    async initiateLogin(provider) {
        console.log(`Initiating ${provider} OAuth login (simulated)...`);
        
        // For development, simulate OAuth login instead of real OAuth
        this.simulateOAuthLogin(provider);
    }
    
    // Simulate OAuth login for development
    simulateOAuthLogin(provider) {
        console.log(`Simulating ${provider} OAuth login...`);
        
        // Create simulated user data based on provider
        const simulatedUsers = {
            google: {
                id: 'google_' + Date.now(),
                firstName: 'Emily',
                lastName: 'Garcia',
                email: 'emily.garcia@gmail.com',
                picture: null,
                provider: 'google',
                verified: true
            },
            github: {
                id: 'github_' + Date.now(),
                firstName: 'Emily',
                lastName: 'Garcia',
                email: 'emily.garcia@github.com',
                picture: null,
                provider: 'github',
                verified: true
            },
            microsoft: {
                id: 'microsoft_' + Date.now(),
                firstName: 'Emily',
                lastName: 'Garcia',
                email: 'emily.garcia@outlook.com',
                picture: null,
                provider: 'microsoft',
                verified: true
            }
        };
        
        const userData = simulatedUsers[provider];
        if (!userData) {
            throw new Error(`Unsupported OAuth provider: ${provider}`);
        }
        
        // Simulate OAuth callback
        setTimeout(() => {
            this.handleOAuthCallback(userData);
        }, 1000);
    }
    
    // Handle OAuth callback (simulated)
    handleOAuthCallback(userData) {
        console.log('Handling simulated OAuth callback with user data:', userData);
        
        // Store user data in localStorage
        localStorage.setItem('oauth_user_data', JSON.stringify(userData));
        
        // Redirect to dashboard
        window.location.href = './dashboard.html';
    }
    
    // Handle OAuth callback (called after redirect)
    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
            console.error('OAuth error:', error);
            showNotification(`OAuth error: ${error}`, 'error');
            return null;
        }
        
        if (!code || !state) {
            console.error('Missing OAuth parameters');
            return null;
        }
        
        // Verify state
        const storedState = localStorage.getItem('oauth_state');
        if (state !== storedState) {
            console.error('Invalid OAuth state');
            showNotification('Invalid OAuth state. Please try again.', 'error');
            return null;
        }
        
        const provider = localStorage.getItem('oauth_provider');
        if (!provider) {
            console.error('No OAuth provider found');
            return null;
        }
        
        console.log(`Handling ${provider} OAuth callback...`);
        
        try {
            // Exchange code for access token and user info
            const userInfo = await this.exchangeCodeForUserInfo(provider, code);
            
            // Clean up stored OAuth data
            localStorage.removeItem('oauth_state');
            localStorage.removeItem('oauth_provider');
            
            return userInfo;
        } catch (error) {
            console.error('OAuth callback error:', error);
            showNotification('OAuth authentication failed. Please try again.', 'error');
            return null;
        }
    }
    
    // Exchange authorization code for user info
    async exchangeCodeForUserInfo(provider, code) {
        console.log(`Exchanging code for ${provider} user info...`);
        
        // In a real application, this would be done on the backend
        // For demo purposes, we'll simulate the API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const mockUserInfo = this.generateMockUserInfo(provider);
                resolve(mockUserInfo);
            }, 1000);
        });
        
        // Real implementation would look like this:
        /*
        const response = await fetch('/api/oauth/exchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider: provider,
                code: code,
                redirectUri: this.config[provider].redirectUri
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to exchange code for user info');
        }
        
        return await response.json();
        */
    }
    
    // Generate mock user info for demo purposes
    generateMockUserInfo(provider) {
        const mockUsers = {
            google: {
                id: 'google_' + Math.random().toString(36).substring(2, 15),
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@gmail.com',
                picture: 'https://via.placeholder.com/150/4285f4/ffffff?text=JS',
                provider: 'google',
                verified: true
            },
            github: {
                id: 'github_' + Math.random().toString(36).substring(2, 15),
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.johnson@example.com',
                picture: 'https://via.placeholder.com/150/333333/ffffff?text=SJ',
                provider: 'github',
                verified: true
            },
            microsoft: {
                id: 'microsoft_' + Math.random().toString(36).substring(2, 15),
                firstName: 'Mike',
                lastName: 'Davis',
                email: 'mike.davis@outlook.com',
                picture: 'https://via.placeholder.com/150/0078d4/ffffff?text=MD',
                provider: 'microsoft',
                verified: true
            }
        };
        
        return mockUsers[provider] || null;
    }
    
    // Get user info from OAuth provider (for demo purposes)
    async getUserInfo(provider, accessToken) {
        console.log(`Getting user info from ${provider}...`);
        
        // In a real application, this would make API calls to the provider
        // For demo purposes, we'll return mock data
        return this.generateMockUserInfo(provider);
        
        // Real implementation would look like this:
        /*
        const apiUrls = {
            google: 'https://www.googleapis.com/oauth2/v2/userinfo',
            github: 'https://api.github.com/user',
            microsoft: 'https://graph.microsoft.com/v1.0/me'
        };
        
        const response = await fetch(apiUrls[provider], {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get user info from ${provider}`);
        }
        
        return await response.json();
        */
    }
    
    // Check if we're in an OAuth callback
    isCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('code') && urlParams.has('state');
    }
    
    // Get current provider from URL or localStorage
    getCurrentProvider() {
        const urlParams = new URLSearchParams(window.location.search);
        const state = urlParams.get('state');
        
        if (state) {
            return localStorage.getItem('oauth_provider');
        }
        
        return null;
    }
}

// Create global OAuth service instance
window.oauthService = new OAuthService();

// Auto-handle OAuth callback if we're in a callback URL
if (window.oauthService.isCallback()) {
    console.log('OAuth callback detected, handling...');
    window.oauthService.handleCallback().then(userInfo => {
        if (userInfo) {
            console.log('OAuth login successful:', userInfo);
            
            // Create user session
            if (typeof userManager !== 'undefined') {
                const session = userManager.createSocialSession(userInfo);
                if (session) {
                    showNotification(`Successfully signed in with ${userInfo.provider}!`, 'success');
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = './dashboard.html';
                    }, 1500);
                } else {
                    showNotification('Failed to create user session.', 'error');
                }
            } else {
                console.error('UserManager not available');
                showNotification('Authentication service not available.', 'error');
            }
        }
    });
}
