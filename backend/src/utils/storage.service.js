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

  /**
   * @param {string} url — full URL stored in DB
   * @returns {string|null} publicId
   */
  extractPublicIdFromUrl(url) {
    throw new Error("StorageService.extractPublicIdFromUrl() must be implemented by a subclass.");
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
    // Prevent path traversal
    if (publicId.includes("..") || publicId.includes("~")) {
      console.warn(`[Security Warning] Attempted path traversal in delete: ${publicId}`);
      return;
    }
    // publicId is the relative URL path, convert to absolute path
    const absolutePath = path.join(__dirname, "../../", publicId);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  extractPublicIdFromUrl(url) {
    if (!url) return null;
    return url.startsWith("/") ? url : null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AWS S3
// ─────────────────────────────────────────────────────────────────────────────
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

class S3StorageService extends StorageService {
  constructor() {
    super();
    if (!process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
      throw new Error("S3 config missing: AWS_REGION and S3_BUCKET_NAME are required when STORAGE_DRIVER=s3");
    }
    // In production EC2 with an IAM role attached, you do not need to supply AWS access keys.
    // The AWS SDK will automatically fetch temporary credentials from the EC2 instance metadata.
    this.s3Client = new S3Client({ region: process.env.AWS_REGION });
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  async upload(file, folder = "general") {
    if (!file.buffer) {
      throw new Error("S3StorageService requires file.buffer. Make sure memoryStorage is used.");
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    const key = `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    // Format matches standard AWS S3 URL format
    const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      url,
      publicId: key,
    };
  }

  async delete(publicId) {
    // Prevent path traversal for S3 keys as well
    if (publicId.includes("..") || publicId.includes("~")) {
      console.warn(`[Security Warning] Attempted path traversal in S3 delete: ${publicId}`);
      return;
    }
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: publicId,
    });

    await this.s3Client.send(command);
  }

  extractPublicIdFromUrl(url) {
    if (!url) return null;
    if (url.includes(this.bucketName)) {
      if (url.includes(".amazonaws.com/")) {
        const parts = url.split(".amazonaws.com/");
        if (parts.length > 1) return parts[1].split("?")[0];
      }
      const parts = url.split(`${this.bucketName}/`);
      if (parts.length > 1) return parts[1].split("?")[0];
    }
    return null;
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
