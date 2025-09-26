// OAuth Configuration Template
// Copy this file to oauth-config.js and fill in your actual OAuth credentials

const OAUTH_CONFIG = {
    google: {
        clientId: 'your-google-client-id.apps.googleusercontent.com',
        redirectUri: window.location.origin + '/auth/google/callback',
        scope: 'openid email profile'
    },
    github: {
        clientId: 'your-github-client-id',
        redirectUri: window.location.origin + '/auth/github/callback',
        scope: 'user:email'
    },
    microsoft: {
        clientId: 'your-microsoft-client-id',
        redirectUri: window.location.origin + '/auth/microsoft/callback',
        scope: 'openid email profile'
    }
};

// Instructions for setting up OAuth providers:

// 1. GOOGLE OAUTH SETUP:
//    - Go to Google Cloud Console (https://console.cloud.google.com/)
//    - Create a new project or select existing one
//    - Enable Google+ API
//    - Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
//    - Set authorized redirect URIs to: http://localhost:3000/auth/google/callback
//    - Copy the Client ID and replace 'your-google-client-id.apps.googleusercontent.com'

// 2. GITHUB OAUTH SETUP:
//    - Go to GitHub Settings > Developer settings > OAuth Apps
//    - Click "New OAuth App"
//    - Set Authorization callback URL to: http://localhost:3000/auth/github/callback
//    - Copy the Client ID and replace 'your-github-client-id'

// 3. MICROSOFT OAUTH SETUP:
//    - Go to Azure Portal (https://portal.azure.com/)
//    - Navigate to Azure Active Directory > App registrations
//    - Click "New registration"
//    - Set redirect URI to: http://localhost:3000/auth/microsoft/callback
//    - Copy the Application (client) ID and replace 'your-microsoft-client-id'

// 4. BACKEND SETUP:
//    You'll need to create backend endpoints to handle OAuth callbacks:
//    - /auth/google/callback
//    - /auth/github/callback  
//    - /auth/microsoft/callback
//
//    These endpoints should:
//    1. Exchange the authorization code for access tokens
//    2. Fetch user profile data from the OAuth provider
//    3. Create or update user account in your database
//    4. Create a session and redirect back to your app

// 5. PRODUCTION CONSIDERATIONS:
//    - Use environment variables for OAuth credentials
//    - Implement proper CSRF protection with state parameters
//    - Use HTTPS in production
//    - Implement proper error handling and logging
//    - Consider rate limiting for OAuth endpoints

// Export for use in login.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAUTH_CONFIG;
} else {
    window.OAUTH_CONFIG = OAUTH_CONFIG;
}
