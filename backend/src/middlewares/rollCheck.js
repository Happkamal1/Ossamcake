const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied! Not Authorized" });
    }
    next();
  };
};

module.exports = roleCheck
