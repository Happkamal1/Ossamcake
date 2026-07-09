const path = require("path");
const fs = require("fs");

/**
 * StorageService — Abstract Storage Interface
 *
 * Controllers and services NEVER import disk/S3/Cloudinary directly.
 * They call storageService.upload() and storageService.delete().
 *
 * Switching storage backends in the future:
 *   STORAGE_DRIVER=local    → LocalStorageService (current default)
 *   STORAGE_DRIVER=s3       → S3StorageService (AWS, future)
 *   STORAGE_DRIVER=cloudinary → CloudinaryStorageService (future)
 */

class StorageService {
  /**
   * @param {Express.Multer.File} file  — multer file object
   * @param {string} folder             — destination folder name (e.g. "avatars", "products")
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async upload(file, folder = "general") {
    throw new Error("StorageService.upload() must be implemented by a subclass.");
  }

  /**
   * @param {string} publicId — identifier returned by upload()
   * @returns {Promise<void>}
   */
  async delete(publicId) {
    throw new Error("StorageService.delete() must be implemented by a subclass.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE (default)
// Files stored at: /uploads/<folder>/<filename>
// Served by express.static("/uploads") in app.js
// ─────────────────────────────────────────────────────────────────────────────
class LocalStorageService extends StorageService {
  async upload(file, folder = "general") {
    // multer already wrote the file to disk via uploadMiddleware
    // file.path is the absolute disk path
    // We generate the public URL from the path
    const relativePath = file.path.replace(/\\/g, "/");
    // Extract everything after "uploads/"
    const uploadsIndex = relativePath.indexOf("uploads/");
    const urlPath = uploadsIndex !== -1
      ? "/" + relativePath.substring(uploadsIndex)
      : `/uploads/${folder}/${file.filename}`;

    return {
      url: urlPath,          // e.g. "/uploads/avatars/avatar-1234.jpg"
      publicId: urlPath,     // Same as url for local storage
    };
  }

  async delete(publicId) {
    // publicId is the relative URL path, convert to absolute path
    const absolutePath = path.join(__dirname, "../../", publicId);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AWS S3 (future — activate by setting STORAGE_DRIVER=s3 in .env)
// ─────────────────────────────────────────────────────────────────────────────
class S3StorageService extends StorageService {
  async upload(file, folder = "general") {
    // TODO: Implement using @aws-sdk/client-s3 when ready
    // const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
    // const client = new S3Client({ region: process.env.AWS_REGION });
    // ...
    throw new Error("S3StorageService is not yet implemented. Set STORAGE_DRIVER=local.");
  }

  async delete(publicId) {
    throw new Error("S3StorageService is not yet implemented.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Driver Selection
// ─────────────────────────────────────────────────────────────────────────────
const driver = process.env.STORAGE_DRIVER || "local";

let storageService;
switch (driver) {
  case "s3":
    storageService = new S3StorageService();
    break;
  case "local":
  default:
    storageService = new LocalStorageService();
    break;
}

module.exports = storageService;
