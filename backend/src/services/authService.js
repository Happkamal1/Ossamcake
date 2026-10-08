const User = require("../models/User");
const OTP = require("../models/OTP");
const ApiError = require("../utils/ApiError");
const generateOTP = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

const checkOtpCooldown = async (email, type) => {
  const latestOtp = await OTP.findOne({ email, type }).sort({ createdAt: -1 });
  if (latestOtp) {
    const timeDiff = Date.now() - new Date(latestOtp.createdAt).getTime();
    if (timeDiff < 60000) { // 60 seconds cooldown
      throw new ApiError(429, `Please wait ${Math.ceil((60000 - timeDiff) / 1000)} seconds before requesting another OTP`);
    }
  }
};

const validateOtpWithAttempts = async (email, otp, type) => {
  const otpRecord = await OTP.findOne({ email, type });
  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (otpRecord.otp !== otp) {
    otpRecord.attempts = (otpRecord.attempts || 0) + 1;
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      throw new ApiError(429, "Too many failed attempts. OTP has been invalidated. Please request a new one.");
    }
    await otpRecord.save();
    throw new ApiError(400, `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`);
  }

  return otpRecord;
};

/**
 * Register a new user and send OTP
 */
const registerUser = async (userData) => {
  const { name, email, password, mobileNumber } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isEmailVerified) {
      throw new ApiError(409, "User with this email already exists and is verified");
    }
    // If not verified, we allow them to re-register / resend OTP
    // For simplicity, we can just delete the unverified user and recreate, or just update
    await User.findByIdAndDelete(existingUser._id);
  }

  // Create user (isEmailVerified defaults to false)
  const user = await User.create({
    name,
    email,
    password,
    mobileNumber,
  });

  // Generate OTP
  const otp = generateOTP();

  await checkOtpCooldown(email, "emailVerification");
  await OTP.deleteMany({ email, type: "emailVerification" });

  // Save OTP in DB
  await OTP.create({
    email,
    otp,
    type: "emailVerification",
  });

  // Send Email
  const emailHtml = `
    <h1>Verify Your Email</h1>
    <p>Your OTP is: <strong>${otp}</strong></p>
    <p>This OTP is valid for 10 minutes.</p>
  `;
  await sendEmail({
    to: email,
    subject: "Cake E-Commerce - Email Verification OTP",
    html: emailHtml,
  });

  // Return user without password
  const createdUser = await User.findById(user._id).select("-password");
  return createdUser;
};

/**
 * Verify Email using OTP
 */
const verifyEmail = async (email, otp) => {
  const otpRecord = await validateOtpWithAttempts(email, otp, "emailVerification");

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isEmailVerified = true;
  await user.save();

  // Delete OTP after successful verification
  await OTP.deleteOne({ _id: otpRecord._id });

  return true;
};

/**
 * Resend Email Verification OTP
 */
const resendOtp = async (email, type = "emailVerification") => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (type === "emailVerification" && user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  await checkOtpCooldown(email, type);

  // Delete any existing OTPs of this type for this email
  await OTP.deleteMany({ email, type });

  const otp = generateOTP();
  await OTP.create({ email, otp, type });

  // Send Email
  let emailHtml;
  let subject;
  if (type === "emailVerification") {
    emailHtml = `
      <h1>Verify Your Email</h1>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;
    subject = "Cake E-Commerce - Email Verification OTP";
  } else if (type === "login2FA") {
    emailHtml = `
      <h1>Login Two-Factor Authentication</h1>
      <p>Your 2FA OTP code is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;
    subject = "Cake E-Commerce - Login 2FA OTP";
  } else {
    throw new ApiError(400, "Invalid OTP type");
  }

  await sendEmail({
    to: email,
    subject,
    html: emailHtml,
  });

  return true;
};

/**
 * Login user and return user object
 */
const loginUser = async (email, password) => {
  // Find user by email and explicitly select password
  const user = await User.findOne({ email }).select("+password");
  
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new ApiError(403, "Email not verified.");
  }

  // Check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.accountStatus !== "active") {
    throw new ApiError(403, `Account is ${user.accountStatus}. Please contact support.`);
  }

  // 2FA check
  if (user.is2FAEnabled) {
    await checkOtpCooldown(email, "login2FA");
    const otp = generateOTP();
    await OTP.deleteMany({ email, type: "login2FA" });
    await OTP.create({ email, otp, type: "login2FA" });

    const emailHtml = `
      <h1>Login Two-Factor Authentication</h1>
      <p>Your 2FA OTP code is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;
    await sendEmail({
      to: email,
      subject: "Cake E-Commerce - Login 2FA OTP",
      html: emailHtml,
    });

    return { require2FA: true, email };
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  // Return user without password and the token
  const loggedInUser = await User.findById(user._id).select("-password");

  return { user: loggedInUser, accessToken, refreshToken };
};

/**
 * Handle social login (Google or Facebook)
 */
const loginWithSocial = async (provider, providerId, email, name, avatar) => {
  if (!email) {
    throw new ApiError(400, "Email address is required from your social account");
  }

  let user = await User.findOne({ email });

  if (user) {
    // Account Linking Logic:
    if (provider === "google") {
      user.googleId = providerId;
    }

    user.isEmailVerified = true;

    if (!user.profileImage && avatar) {
      user.profileImage = avatar;
    }

    await user.save();
  } else {
    // Create new account automatically
    const createData = {
      name,
      email,
      provider,
      isEmailVerified: true,
      profileImage: avatar || "",
    };

    if (provider === "google") {
      createData.googleId = providerId;
    }

    user = await User.create(createData);
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const loggedInUser = await User.findById(user._id).select("-password");

  return { user: loggedInUser, accessToken, refreshToken };
};

const loginWithGoogle = async (idToken) => {
  const { verifyGoogleToken } = require("./googleService");
  const socialData = await verifyGoogleToken(idToken);
  return await loginWithSocial(
    "google",
    socialData.googleId,
    socialData.email,
    socialData.name,
    socialData.avatar
  );
};


/**
 * Forgot Password - Send OTP
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await checkOtpCooldown(email, "passwordReset");

  await OTP.deleteMany({ email, type: "passwordReset" });

  const otp = generateOTP();
  await OTP.create({ email, otp, type: "passwordReset" });

  const emailHtml = `
    <h1>Reset Your Password</h1>
    <p>Your OTP to reset your password is: <strong>${otp}</strong></p>
    <p>This OTP is valid for 10 minutes.</p>
  `;
  await sendEmail({
    to: email,
    subject: "Cake E-Commerce - Password Reset OTP",
    html: emailHtml,
  });

  return true;
};

/**
 * Verify Reset Password OTP
 */
const verifyResetOtp = async (email, otp) => {
  await validateOtpWithAttempts(email, otp, "passwordReset");
  return true;
};

/**
 * Reset Password
 */
const resetPassword = async (email, otp, newPassword) => {
  const otpRecord = await validateOtpWithAttempts(email, otp, "passwordReset");

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = newPassword;
  await user.save();

  await OTP.deleteOne({ _id: otpRecord._id });

  return true;
};

/**
 * Update user profile details
 */
const updateUserProfile = async (userId, updateData) => {
  const { name, mobileNumber, birthdate, bio } = updateData;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name !== undefined) user.name = name;
  if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;
  if (birthdate !== undefined) user.birthdate = birthdate;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  return await User.findById(userId).select("-password");
};

/**
 * Update user password
 */
const updateUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isCorrect) {
    throw new ApiError(400, "Incorrect current password");
  }

  user.password = newPassword;
  await user.save();

  return true;
};

/**
 * Add delivery address
 */
const addUserAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.addresses.push(addressData);
  await user.save();

  return user.addresses;
};

/**
 * Delete delivery address
 */
const deleteUserAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId);
  await user.save();

  return user.addresses;
};

/**
 * Get user profile by ID
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

const verify2FALogin = async (email, otp) => {
  const otpRecord = await validateOtpWithAttempts(email, otp, "login2FA");

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete OTP after successful verification
  await OTP.deleteOne({ _id: otpRecord._id });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save();
  const loggedInUser = await User.findById(user._id).select("-password");

  return { user: loggedInUser, accessToken, refreshToken };
};

const toggle2FA = async (userId, enable) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.is2FAEnabled = enable;
  await user.save();

  return await User.findById(userId).select("-password");
};


module.exports = {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  addUserAddress,
  deleteUserAddress,
  loginWithGoogle,
  verify2FALogin,
  toggle2FA,
};
