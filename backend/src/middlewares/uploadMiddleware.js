const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");

// Define upload directory
const uploadDir = path.join(__dirname, "../../uploads/avatars");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to determine storage
const getStorage = (diskConfig) => {
  if (process.env.STORAGE_DRIVER === "s3") {
    return multer.memoryStorage();
  }
  return multer.diskStorage(diskConfig);
};

// Storage configuration
const storage = getStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only .jpg, .jpeg, .png and .webp formats are allowed!"), false);
  }
};

// Multer upload middleware instance for avatar
const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
}).single("avatar"); // field name: avatar

// Define product upload directory
const productUploadDir = path.join(__dirname, "../../uploads/products");

// Ensure product upload directory exists
if (!fs.existsSync(productUploadDir)) {
  fs.mkdirSync(productUploadDir, { recursive: true });
}

// Product Storage configuration
const productStorage = getStorage({
  destination: (req, file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// Multer upload middleware instance for products
const uploadProductImage = multer({
  storage: productStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
}).single("image"); // field name: image

// Define banner upload directory
const bannerUploadDir = path.join(__dirname, "../../uploads/banners");

// Ensure banner upload directory exists
if (!fs.existsSync(bannerUploadDir)) {
  fs.mkdirSync(bannerUploadDir, { recursive: true });
}

// Banner Storage configuration
const bannerStorage = getStorage({
  destination: (req, file, cb) => {
    cb(null, bannerUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `banner-${uniqueSuffix}${ext}`);
  },
});

// Multer upload middleware instance for banners
const uploadBannerImage = multer({
  storage: bannerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
}).single("image"); // field name: image

module.exports = {
  uploadAvatar,
  uploadDir,
  uploadProductImage,
  productUploadDir,
  uploadBannerImage,
  bannerUploadDir,
};
