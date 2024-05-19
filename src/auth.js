// src/auth.js
import { Amplify, Auth } from 'aws-amplify';

// Configure our Auth object to use our Cognito User Pool
Amplify.configure({
  Auth: {
    region: 'ap-south-1',
    userPoolId: process.env.AWS_COGNITO_POOL_ID,
    userPoolWebClientId: process.env.AWS_COGNITO_CLIENT_ID,

    // Hosted UI configuration
    oauth: {
      domain: process.env.AWS_COGNITO_HOSTED_UI_DOMAIN,
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
      redirectSignOut: process.env.OAUTH_SIGN_OUT_REDIRECT_URL,
      responseType: 'code',
    },
  },
});

/**
 * Get the authenticated user
 * @returns Promise<user>
 */
async function getUser() {
  try {
    const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
    // Get the user's username
    const username = currentAuthenticatedUser.username;
    // If that didn't throw, we have a user object, and the user is authenticated
    const idToken = currentAuthenticatedUser.signInUserSession.idToken.jwtToken;
    const accessToken = currentAuthenticatedUser.signInUserSession.accessToken.jwtToken;
    // Return a simplified "user" object
    return {
      username,
      idToken,
      accessToken,
      // Include a simple method to generate headers with our Authorization info
      authorizationHeaders: (type = 'application/json') => {
        const headers = { 'Content-Type': type };
        headers['Authorization'] = `bearer ${idToken}`;
        return headers;
      },
    };
  } catch (err) {
    console.log(err);
    // Unable to get user, return `null` instead
    return null;
  }
}

export { Auth, getUser };