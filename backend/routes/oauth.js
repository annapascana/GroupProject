const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../server');

const router = express.Router();

// OAuth configuration
const OAUTH_CONFIG = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || 'demo-google-client-id.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-secret',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/oauth/google/callback',
        scope: 'openid email profile',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
    },
    github: {
        clientId: process.env.GITHUB_CLIENT_ID || 'demo-github-client-id',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || 'demo-secret',
        redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/oauth/github/callback',
        scope: 'user:email',
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user'
    },
    microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID || 'demo-microsoft-client-id',
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'demo-secret',
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/oauth/microsoft/callback',
        scope: 'openid email profile',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me'
    }
};

// Initiate OAuth login
router.get('/:provider', (req, res) => {
    const { provider } = req.params;
    const config = OAUTH_CONFIG[provider];

    if (!config) {
        return res.status(400).json({ error: 'Unsupported OAuth provider' });
    }

    // Generate state parameter for security
    const state = uuidv4();
    
    // Store state in session or database for verification
    // For demo purposes, we'll use a simple approach
    const stateData = {
        state,
        provider,
        timestamp: Date.now(),
        expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
    };

    // In production, store this in Redis or database
    // For demo, we'll encode it in the state parameter
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString('base64');

    // Build OAuth URL
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scope,
        response_type: 'code',
        state: encodedState,
        access_type: 'offline',
        prompt: 'consent'
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;
    
    res.json({ authUrl });
});

// Handle OAuth callback
router.get('/:provider/callback', async (req, res) => {
    const { provider } = req.params;
    const { code, state, error } = req.query;
    const config = OAUTH_CONFIG[provider];

    if (error) {
        return res.status(400).json({ error: `OAuth error: ${error}` });
    }

    if (!code || !state) {
        return res.status(400).json({ error: 'Missing OAuth parameters' });
    }

    if (!config) {
        return res.status(400).json({ error: 'Unsupported OAuth provider' });
    }

    try {
        // Verify state parameter
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        if (stateData.expiresAt < Date.now()) {
            return res.status(400).json({ error: 'OAuth state expired' });
        }

        // Exchange code for access token
        const tokenResponse = await exchangeCodeForToken(provider, code, config);
        if (!tokenResponse.access_token) {
            return res.status(400).json({ error: 'Failed to get access token' });
        }

        // Get user info from provider
        const userInfo = await getUserInfoFromProvider(provider, tokenResponse.access_token, config);
        if (!userInfo) {
            return res.status(400).json({ error: 'Failed to get user info' });
        }

        // Create or update user in database
        const user = await createOrUpdateSocialUser(provider, userInfo);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'demo-secret-key',
            { expiresIn: '24h' }
        );

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/callback.html?token=${token}&provider=${provider}`);

    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({ error: 'OAuth authentication failed' });
    }
});

// Exchange authorization code for access token
async function exchangeCodeForToken(provider, code, config) {
    // For demo purposes, return mock token
    // In production, make actual HTTP request to provider's token endpoint
    return {
        access_token: `mock_${provider}_token_${Date.now()}`,
        token_type: 'Bearer',
        expires_in: 3600
    };

    // Real implementation would look like this:
    /*
    const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code: code,
            redirect_uri: config.redirectUri,
            grant_type: 'authorization_code'
        })
    });

    return await response.json();
    */
}

// Get user info from OAuth provider
async function getUserInfoFromProvider(provider, accessToken, config) {
    // For demo purposes, return mock user info
    // In production, make actual HTTP request to provider's user info endpoint
    const mockUsers = {
        google: {
            id: `google_${Date.now()}`,
            email: 'john.smith@gmail.com',
            given_name: 'John',
            family_name: 'Smith',
            picture: 'https://via.placeholder.com/150/4285f4/ffffff?text=JS',
            verified_email: true
        },
        github: {
            id: `github_${Date.now()}`,
            email: 'sarah.johnson@example.com',
            name: 'Sarah Johnson',
            avatar_url: 'https://via.placeholder.com/150/333333/ffffff?text=SJ',
            login: 'sarahjohnson'
        },
        microsoft: {
            id: `microsoft_${Date.now()}`,
            mail: 'mike.davis@outlook.com',
            givenName: 'Mike',
            surname: 'Davis',
            userPrincipalName: 'mike.davis@outlook.com'
        }
    };

    return mockUsers[provider];

    // Real implementation would look like this:
    /*
    const response = await fetch(config.userInfoUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    return await response.json();
    */
}

// Create or update social user
function createOrUpdateSocialUser(provider, userInfo) {
    return new Promise((resolve, reject) => {
        // Normalize user info based on provider
        let normalizedUser;
        
        switch (provider) {
            case 'google':
                normalizedUser = {
                    socialId: userInfo.id,
                    email: userInfo.email,
                    firstName: userInfo.given_name,
                    lastName: userInfo.family_name,
                    avatar: userInfo.picture,
                    verified: userInfo.verified_email
                };
                break;
            case 'github':
                normalizedUser = {
                    socialId: userInfo.id,
                    email: userInfo.email,
                    firstName: userInfo.name.split(' ')[0],
                    lastName: userInfo.name.split(' ').slice(1).join(' ') || '',
                    avatar: userInfo.avatar_url,
                    verified: true
                };
                break;
            case 'microsoft':
                normalizedUser = {
                    socialId: userInfo.id,
                    email: userInfo.mail || userInfo.userPrincipalName,
                    firstName: userInfo.givenName,
                    lastName: userInfo.surname,
                    avatar: null,
                    verified: true
                };
                break;
            default:
                return reject(new Error('Unsupported provider'));
        }

        // Check if user already exists
        db.get(
            'SELECT * FROM users WHERE email = ? OR (social_provider = ? AND social_id = ?)',
            [normalizedUser.email, provider, normalizedUser.socialId],
            (err, existingUser) => {
                if (err) {
                    return reject(err);
                }

                if (existingUser) {
                    // Update existing user
                    db.run(
                        'UPDATE users SET social_provider = ?, social_id = ?, avatar_url = ?, verified = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
                        [provider, normalizedUser.socialId, normalizedUser.avatar, normalizedUser.verified, existingUser.id],
                        (err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve({
                                id: existingUser.id,
                                email: existingUser.email,
                                firstName: existingUser.first_name,
                                lastName: existingUser.last_name,
                                avatar: normalizedUser.avatar,
                                verified: normalizedUser.verified,
                                role: existingUser.role,
                                socialProvider: provider
                            });
                        }
                    );
                } else {
                    // Create new user
                    const userId = uuidv4();
                    db.run(
                        'INSERT INTO users (id, email, first_name, last_name, avatar_url, social_provider, social_id, verified, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [userId, normalizedUser.email, normalizedUser.firstName, normalizedUser.lastName, normalizedUser.avatar, provider, normalizedUser.socialId, normalizedUser.verified, 'user'],
                        (err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve({
                                id: userId,
                                email: normalizedUser.email,
                                firstName: normalizedUser.firstName,
                                lastName: normalizedUser.lastName,
                                avatar: normalizedUser.avatar,
                                verified: normalizedUser.verified,
                                role: 'user',
                                socialProvider: provider
                            });
                        }
                    );
                }
            }
        );
    });
}

module.exports = router;
