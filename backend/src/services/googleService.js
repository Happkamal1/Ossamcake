const { OAuth2Client } = require('google-auth-library');
const ApiError = require('../utils/ApiError');

const verifyGoogleToken = async (idToken) => {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
    };
  } catch (error) {
    throw new ApiError(400, "Invalid Google ID Token: " + error.message);
  }
};

module.exports = {
  verifyGoogleToken,
};
