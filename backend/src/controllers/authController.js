const authService = require("../services/authService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const passkeyService = require("../services/passkeyService");
const User = require("../models/User");

// Cookie options for production readiness
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  res.status(201).json(new ApiResponse(201, user, "User registered successfully. Please verify your email with the OTP sent."));
});

/**
 * @desc    Verify Email OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  await authService.verifyEmail(email, otp);

  res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
});

/**
 * @desc    Resend Email Verification OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOtp = asyncHandler(async (req, res) => {
  const { email, type } = req.body;
  await authService.resendOtp(email, type || "emailVerification");

  res.status(200).json(new ApiResponse(200, null, "Verification OTP sent successfully"));
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);

  if (result.require2FA) {
    return res.status(200).json(
      new ApiResponse(200, { require2FA: true, tempEmail: result.email }, "2FA OTP sent to your email")
    );
  }

  const { user, accessToken, refreshToken } = result;

  // Set JWT in HTTP-Only Cookie
  res.cookie("jwt", accessToken, cookieOptions);
  res.cookie("refresh_token", refreshToken, refreshCookieOptions);

  res.status(200).json(
    new ApiResponse(200, { user, token: accessToken }, "Login successful")
  );
});

/**
 * @desc    Forgot Password - Send OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);

  res.status(200).json(new ApiResponse(200, null, "Password reset OTP sent to your email"));
});

/**
 * @desc    Verify Reset Password OTP
 * @route   POST /api/auth/verify-reset-otp
 * @access  Public
 */
const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  await authService.verifyResetOtp(email, otp);

  res.status(200).json(new ApiResponse(200, null, "OTP verified successfully. You can now reset your password."));
});

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  await authService.resetPassword(email, otp, password);

  res.status(200).json(new ApiResponse(200, null, "Password updated successfully"));
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Protected
 */
const logoutUser = asyncHandler(async (req, res) => {
  // Clear the cookies
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie("refresh_token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  // Remove refresh token from DB if user is logged in
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }

  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Protected
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

/**
 * @desc    Update user password
 * @route   PUT /api/auth/update-password
 * @access  Protected
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.updateUserPassword(req.user._id, currentPassword, newPassword);
  res.status(200).json(new ApiResponse(200, null, "Password updated successfully"));
});

/**
 * @desc    Add delivery address
 * @route   POST /api/auth/addresses
 * @access  Protected
 */
const addAddress = asyncHandler(async (req, res) => {
  const addresses = await authService.addUserAddress(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, addresses, "Address added successfully"));
});

/**
 * @desc    Delete delivery address
 * @route   DELETE /api/auth/addresses/:addressId
 * @access  Protected
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const addresses = await authService.deleteUserAddress(req.user._id, addressId);
  res.status(200).json(new ApiResponse(200, addresses, "Address deleted successfully"));
});

/**
 * @desc    Google login
 * @route   POST /api/auth/google
 * @access  Public
 */
const loginGoogle = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginWithGoogle(idToken);

  res.cookie("jwt", accessToken, cookieOptions);
  res.cookie("refresh_token", refreshToken, refreshCookieOptions);

  res.status(200).json(
    new ApiResponse(200, { user, token: accessToken }, "Google login successful")
  );
});


/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the authMiddleware
  const user = await authService.getUserProfile(req.user._id);

  res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const verify2FALogin = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const { user, accessToken, refreshToken } = await authService.verify2FALogin(email, otp);

  // Set JWT in HTTP-Only Cookie
  res.cookie("jwt", accessToken, cookieOptions);
  res.cookie("refresh_token", refreshToken, refreshCookieOptions);

  res.status(200).json(
    new ApiResponse(200, { user, token: accessToken }, "2FA Verification successful")
  );
});

const toggle2FA = asyncHandler(async (req, res) => {
  const { enable } = req.body;
  if (enable === undefined) {
    throw new ApiError(400, "Enable status is required");
  }

  const user = await authService.toggle2FA(req.user._id, enable);
  res.status(200).json(
    new ApiResponse(200, user, `2FA ${enable ? 'enabled' : 'disabled'} successfully`)
  );
});

// Passkey registration and authentication
const getPasskeyRegisterOptions = asyncHandler(async (req, res) => {
  const options = await passkeyService.getRegistrationOptions(req.user);
  
  res.cookie("regChallenge", options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 5 * 60 * 1000,
  });

  res.status(200).json(new ApiResponse(200, options, "Registration options generated"));
});

const verifyPasskeyRegister = asyncHandler(async (req, res) => {
  const expectedChallenge = req.cookies.regChallenge;
  if (!expectedChallenge) {
    throw new ApiError(400, "Registration challenge expired or missing");
  }

  res.clearCookie("regChallenge");
  const user = await passkeyService.verifyRegistration(req.user, req.body, expectedChallenge);
  
  res.status(200).json(new ApiResponse(200, user, "Passkey registered successfully"));
});

const getPasskeyLoginOptions = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required to request passkey login options");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User with this email not found");
  }

  if (!user.passkeys || user.passkeys.length === 0) {
    throw new ApiError(400, "No passkeys registered for this account");
  }

  const options = await passkeyService.getAuthenticationOptions(user);
  
  res.cookie("loginChallenge", JSON.stringify({ challenge: options.challenge, email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 5 * 60 * 1000,
  });

  res.status(200).json(new ApiResponse(200, options, "Authentication options generated"));
});

const verifyPasskeyLogin = asyncHandler(async (req, res) => {
  const loginCookie = req.cookies.loginChallenge;
  if (!loginCookie) {
    throw new ApiError(400, "Authentication challenge expired or missing");
  }

  const { challenge: expectedChallenge, email } = JSON.parse(loginCookie);
  res.clearCookie("loginChallenge");

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { user: loggedInUser, accessToken, refreshToken } = await passkeyService.verifyAuthentication(
    user,
    req.body,
    expectedChallenge
  );

  res.cookie("jwt", accessToken, cookieOptions);
  res.cookie("refresh_token", refreshToken, refreshCookieOptions);
  
  res.status(200).json(
    new ApiResponse(200, { user: loggedInUser, token: accessToken }, "Login successful")
  );
});

const deletePasskey = asyncHandler(async (req, res) => {
  const { credentialID } = req.params;
  if (!credentialID) {
    throw new ApiError(400, "Credential ID is required");
  }

  const user = await passkeyService.removePasskey(req.user, credentialID);
  res.status(200).json(new ApiResponse(200, user, "Passkey removed successfully"));
});

const getPasskeySignupOptions = asyncHandler(async (req, res) => {
  let { email, name } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!name) {
    // Derive name from email: e.g. john.doe@test.com -> John Doe
    const emailPrefix = email.split("@")[0];
    name = emailPrefix
      .split(/[-._+]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "User";
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "An account with this email already exists. Please log in.");
  }

  const options = await passkeyService.getSignupOptions(email, name);

  res.cookie("regChallenge", JSON.stringify({ challenge: options.challenge, email, name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 5 * 60 * 1000,
  });

  res.status(200).json(new ApiResponse(200, options, "Signup options generated"));
});

const verifyPasskeySignup = asyncHandler(async (req, res) => {
  const regCookie = req.cookies.regChallenge;
  if (!regCookie) {
    throw new ApiError(400, "Registration challenge expired or missing");
  }

  const { challenge: expectedChallenge, email, name } = JSON.parse(regCookie);
  res.clearCookie("regChallenge");

  const { user, accessToken, refreshToken } = await passkeyService.verifySignup(
    email,
    name,
    req.body,
    expectedChallenge
  );

  res.cookie("jwt", accessToken, cookieOptions);
  res.cookie("refresh_token", refreshToken, refreshCookieOptions);

  res.status(201).json(
    new ApiResponse(201, { user, token: accessToken }, "Account created and logged in successfully via Passkey")
  );
});

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refresh_token;

  if (!token) {
    throw new ApiError(401, "Not authorized, no refresh token found");
  }

  const jwt = require("jsonwebtoken");
  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== token) {
      throw new ApiError(403, "Invalid refresh token");
    }

    // Generate new tokens
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("jwt", accessToken, cookieOptions);
    res.cookie("refresh_token", newRefreshToken, refreshCookieOptions);

    res.status(200).json(
      new ApiResponse(200, { token: accessToken }, "Token refreshed successfully")
    );
  } catch (error) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }
});

module.exports = {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  logoutUser,
  getMe,
  updateProfile,
  updatePassword,
  addAddress,
  deleteAddress,
  loginGoogle,
  verify2FALogin,
  toggle2FA,
  getPasskeyRegisterOptions,
  verifyPasskeyRegister,
  getPasskeyLoginOptions,
  verifyPasskeyLogin,
  deletePasskey,
  getPasskeySignupOptions,
  verifyPasskeySignup,
  refreshToken,
};