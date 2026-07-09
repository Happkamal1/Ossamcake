const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const { isoUint8Array } = require("@simplewebauthn/server/helpers");
const crypto = require("crypto");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const rpId = process.env.RP_ID || "localhost";
const rpName = process.env.RP_NAME || "OssamCake E-Commerce";
const expectedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Generate options for Passkey registration (existing authenticated user)
 *
 * userID is omitted so the library auto-generates a random, privacy-safe
 * WebAuthn-specific identifier. This is the recommended approach per the
 * SimpleWebAuthn v10+ docs.
 */
const getRegistrationOptions = async (user) => {
  const options = await generateRegistrationOptions({
    rpName,
    rpID: rpId,
    // Let the library generate a random userID (recommended for privacy).
    // If you need a deterministic mapping, use:
    //   userID: isoUint8Array.fromUTF8String(user._id.toString()),
    userName: user.email,
    userDisplayName: user.name,
    attestationType: "none",
    // v10+: excludeCredentials items only need `id` (base64url string) and `transports`.
    // `type: "public-key"` is no longer required.
    excludeCredentials: (user.passkeys || []).map((p) => ({
      id: p.credentialID, // already stored as base64url string
      transports: p.transports || [],
    })),
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  return options;
};

/**
 * Verify passkey registration response and save it.
 *
 * v10+ registrationInfo structure:
 *   registrationInfo.credential.id          → base64url string
 *   registrationInfo.credential.publicKey   → Uint8Array
 *   registrationInfo.credential.counter     → number
 *   registrationInfo.credentialDeviceType   → string
 *   registrationInfo.credentialBackedUp     → boolean
 */
const verifyRegistration = async (user, response, expectedChallenge) => {
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpId,
    });
  } catch (error) {
    throw new ApiError(400, "WebAuthn registration verification failed: " + error.message);
  }

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) {
    throw new ApiError(400, "Registration response verification failed");
  }

  // v10+: credential data is nested under registrationInfo.credential
  const { id: credentialID, publicKey: credentialPublicKey, counter } = registrationInfo.credential;

  const newPasskey = {
    credentialID,  // already a base64url string in v10+
    publicKey: Buffer.from(credentialPublicKey).toString("base64"),
    counter,
    deviceType: registrationInfo.credentialDeviceType || "singleDevice",
    backedUp: registrationInfo.credentialBackedUp || false,
    transports: response.response.transports || [],
    createdAt: new Date(),
  };

  user.passkeys = user.passkeys || [];
  user.passkeys.push(newPasskey);
  await user.save();

  return await User.findById(user._id).select("-password");
};

/**
 * Generate options for Passkey authentication (login).
 *
 * v10+: allowCredentials[].id must be a base64url string, not a Buffer.
 */
const getAuthenticationOptions = async (user) => {
  const options = await generateAuthenticationOptions({
    rpID: rpId,
    allowCredentials: (user.passkeys || []).map((p) => ({
      id: p.credentialID,  // base64url string — correct for v10+
      transports: p.transports || [],
    })),
    userVerification: "preferred",
  });

  return options;
};

/**
 * Verify passkey authentication response and update counter.
 *
 * v10+: credential.id must be a base64url string.
 *       credential.publicKey must be a Uint8Array.
 */
const verifyAuthentication = async (user, response, expectedChallenge) => {
  const credentialID = response.id;
  const passkey = (user.passkeys || []).find(
    (p) => p.credentialID === credentialID
  );

  if (!passkey) {
    throw new ApiError(400, "Credentials do not match any registered passkeys for this user");
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpId,
      credential: {
        id: passkey.credentialID,  // base64url string — correct for v13
        publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64")),
        counter: passkey.counter,
        transports: passkey.transports || [],
      },
    });
  } catch (error) {
    throw new ApiError(400, "WebAuthn authentication verification failed: " + error.message);
  }

  const { verified, authenticationInfo } = verification;
  if (!verified || !authenticationInfo) {
    throw new ApiError(400, "Authentication response verification failed");
  }

  // Update counter in DB to prevent replay attacks
  passkey.counter = authenticationInfo.newCounter;
  await user.save();

  const accessToken = user.generateAccessToken();
  const loggedInUser = await User.findById(user._id).select("-password");

  return { user: loggedInUser, accessToken };
};

/**
 * Generate options for Passkey signup (registration of new user).
 *
 * v10+: userID must be a Uint8Array, not a string.
 * We generate 16 random bytes and pass them as Uint8Array.
 */
const getSignupOptions = async (email, name) => {
  // Generate a random 16-byte user ID as Uint8Array (not string)
  const userIdBytes = new Uint8Array(crypto.randomBytes(16));

  const options = await generateRegistrationOptions({
    rpName,
    rpID: rpId,
    userID: userIdBytes,  // Uint8Array — required by v10+
    userName: email,
    userDisplayName: name,
    attestationType: "none",
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  return options;
};

/**
 * Verify signup passkey response and create the user.
 *
 * Uses v10+ registrationInfo.credential structure.
 */
const verifySignup = async (email, name, response, expectedChallenge) => {
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpId,
    });
  } catch (error) {
    throw new ApiError(400, "WebAuthn registration verification failed: " + error.message);
  }

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) {
    throw new ApiError(400, "Registration response verification failed");
  }

  // v10+: credential data is nested under registrationInfo.credential
  const { id: credentialID, publicKey: credentialPublicKey, counter } = registrationInfo.credential;

  const newPasskey = {
    credentialID,  // already a base64url string in v10+
    publicKey: Buffer.from(credentialPublicKey).toString("base64"),
    counter,
    deviceType: registrationInfo.credentialDeviceType || "singleDevice",
    backedUp: registrationInfo.credentialBackedUp || false,
    transports: response.response.transports || [],
    createdAt: new Date(),
  };

  // Create the new user with email verification active and local provider
  const user = await User.create({
    email,
    name,
    isEmailVerified: true,
    provider: "local",
    passkeys: [newPasskey],
  });

  const accessToken = user.generateAccessToken();
  const loggedInUser = await User.findById(user._id).select("-password");

  return { user: loggedInUser, accessToken };
};

/**
 * Remove a registered passkey
 */
const removePasskey = async (user, credentialID) => {
  user.passkeys = (user.passkeys || []).filter(
    (p) => p.credentialID !== credentialID
  );
  await user.save();
  return await User.findById(user._id).select("-password");
};

module.exports = {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  removePasskey,
  getSignupOptions,
  verifySignup,
};
