const generateOTP = () => {
  // Generates a 6-digit random OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

module.exports = generateOTP;
