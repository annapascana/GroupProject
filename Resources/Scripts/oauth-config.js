// OAuth Configuration for CrimsonCollab
// This file contains demo OAuth credentials for testing purposes
// In production, these should be stored securely on the backend

const OAUTH_CONFIG = {
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

// Demo OAuth Setup Instructions:
// 
// 1. GOOGLE OAUTH SETUP:
//    - Go to Google Cloud Console (https://console.cloud.google.com/)
//    - Create a new project or select existing one
//    - Enable Google+ API
//    - Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
//    - Set authorized redirect URIs to: http://localhost:3000/callback.html
//    - Copy the Client ID and replace 'demo-google-client-id.apps.googleusercontent.com'
//
// 2. GITHUB OAUTH SETUP:
//    - Go to GitHub Settings > Developer settings > OAuth Apps
//    - Click "New OAuth App"
//    - Set Authorization callback URL to: http://localhost:3000/callback.html
//    - Copy the Client ID and replace 'demo-github-client-id'
//
// 3. MICROSOFT OAUTH SETUP:
//    - Go to Azure Portal (https://portal.azure.com/)
//    - Navigate to Azure Active Directory > App registrations
//    - Click "New registration"
//    - Set redirect URI to: http://localhost:3000/callback.html
//    - Copy the Application (client) ID and replace 'demo-microsoft-client-id'
//
// 4. BACKEND SETUP:
//    You'll need to create backend endpoints to handle OAuth token exchange:
//    - POST /api/oauth/exchange - Exchange authorization code for access token
//    - GET /api/oauth/userinfo - Get user info from OAuth provider
//
// 5. SECURITY NOTES:
//    - Never expose client secrets in frontend code
//    - Use HTTPS in production
//    - Implement proper state validation
//    - Store sensitive data securely on the backend

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAUTH_CONFIG;
} else {
    window.OAUTH_CONFIG = OAUTH_CONFIG;
}
