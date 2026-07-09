const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in cookies OR headers
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  try {
    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from token and exclude password
    const currentUser = await User.findById(decoded._id).select("-password");
    if (!currentUser) {
      throw new ApiError(401, "The user belonging to this token no longer exists.");
    }

    // Attach user to req object
    req.user = currentUser;
    next();
  } catch (error) {
    throw new ApiError(401, "Not authorized, token failed or expired");
  }
});

// Middleware to restrict access by role
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }
    next();
  };
};

// authorize is an alias for restrictTo — same function, clearer name for admin routes
const authorize = restrictTo;

module.exports = { protect, restrictTo, authorize };
