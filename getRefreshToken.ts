// This file is disabled to prevent OAuth2 errors
// import { OAuth2Client } from 'google-auth-library';

console.log('OAuth2 authentication is disabled. Using test email service instead.');

// Mock implementation to prevent errors
const oauth2Client = {
  generateAuthUrl: () => 'https://example.com',
  getToken: async () => ({ tokens: { refresh_token: 'mock-token' } })
} as any;

// Generate the url that will be used for authorization
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://mail.google.com/']
});

console.log('Authorize this app by visiting this url:', authUrl);

// After you get the code from the callback, use this to get the refresh token
const getRefreshToken = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log('Refresh Token:', tokens.refresh_token);
};

// You'll need to run this script and follow the URL to get the authorization code
// Then call getRefreshToken with that code 