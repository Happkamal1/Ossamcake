/**
 * OSSAMCAKE — Safe Media Migration Script (Local Filesystem → AWS S3)
 *
 * Scans MongoDB for local image references (/images/cakes/*, /images/categories/*, /images/occasions/*, /uploads/*),
 * verifies local filesystem existence, uploads to S3, and updates MongoDB.
 *
 * Usage:
 *   Dry Run (preview only, NO S3 or MongoDB writes):
 *     node backend/scripts/migrate-local-images-to-s3.js --dry-run
 *
 *   Live Migration:
 *     node backend/scripts/migrate-local-images-to-s3.js
 */

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const { S3Client, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

const Cake = require("../src/models/Cake");
const Category = require("../src/models/Category");
const Occasion = require("../src/models/Occasion");

// CLI Flags
const isDryRun = process.argv.includes("--dry-run");

// S3 Configuration
const region = process.env.AWS_REGION || "ap-south-1";
const bucketName = process.env.S3_BUCKET_NAME || "ossamcake-images-713877988783-ap-south-1-an";

if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in .env");
  process.exit(1);
}

if (!bucketName) {
  console.error("❌ ERROR: S3_BUCKET_NAME is missing in .env");
  process.exit(1);
}

// S3 Client setup matching storage.service.js
const s3ClientConfig = { region };
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3ClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}
const s3Client = new S3Client(s3ClientConfig);

// MIME type map
const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

// Filesystem base directories
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const FRONTEND_PUBLIC = path.resolve(PROJECT_ROOT, "frontend/public");
const BACKEND_UPLOADS = path.resolve(__dirname, "../uploads");

/**
 * Resolves a DB path reference (e.g. "/images/cakes/foo.jpg") to its local filesystem path and S3 key.
 */
function resolveMediaRef(ref) {
  if (!ref || typeof ref !== "string") return null;

  const normalized = ref.trim().replace(/\\/g, "/");

  // Already external S3 or HTTP URL
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return {
      type: "EXTERNAL",
      raw: normalized,
      isExternal: true,
    };
  }

  let localPath = null;
  let s3Key = null;
  let categoryFolder = null;

  // 1. /images/cakes/
  if (normalized.startsWith("/images/cakes/") || normalized.startsWith("images/cakes/")) {
    const filename = path.basename(normalized);
    localPath = path.join(FRONTEND_PUBLIC, "images/cakes", filename);
    s3Key = `products/${filename}`;
    categoryFolder = "products";
  }
  // 2. /images/categories/
  else if (normalized.startsWith("/images/categories/") || normalized.startsWith("images/categories/")) {
    const filename = path.basename(normalized);
    localPath = path.join(FRONTEND_PUBLIC, "images/categories", filename);
    s3Key = `categories/${filename}`;
    categoryFolder = "categories";
  }
  // 3. /images/occasions/
  else if (normalized.startsWith("/images/occasions/") || normalized.startsWith("images/occasions/")) {
    const filename = path.basename(normalized);
    localPath = path.join(FRONTEND_PUBLIC, "images/occasions", filename);
    s3Key = `occasions/${filename}`;
    categoryFolder = "occasions";
  }
  // 4. /uploads/products/
  else if (normalized.startsWith("/uploads/products/") || normalized.startsWith("uploads/products/")) {
    const filename = path.basename(normalized);
    localPath = path.join(BACKEND_UPLOADS, "products", filename);
    s3Key = `products/${filename}`;
    categoryFolder = "products";
  }
  // 5. /uploads/banners/
  else if (normalized.startsWith("/uploads/banners/") || normalized.startsWith("uploads/banners/")) {
    const filename = path.basename(normalized);
    localPath = path.join(BACKEND_UPLOADS, "banners", filename);
    s3Key = `banners/${filename}`;
    categoryFolder = "banners";
  }
  // 6. /uploads/avatars/
  else if (normalized.startsWith("/uploads/avatars/") || normalized.startsWith("uploads/avatars/")) {
    const filename = path.basename(normalized);
    localPath = path.join(BACKEND_UPLOADS, "avatars", filename);
    s3Key = `avatars/${filename}`;
    categoryFolder = "avatars";
  } else {
    // Other relative path
    const filename = path.basename(normalized);
    localPath = path.join(FRONTEND_PUBLIC, normalized.replace(/^\//, ""));
    s3Key = `misc/${filename}`;
    categoryFolder = "misc";
  }

  const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
  const exists = localPath ? fs.existsSync(localPath) : false;
  const ext = localPath ? path.extname(localPath).toLowerCase() : "";
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";
  const size = exists ? fs.statSync(localPath).size : 0;

  return {
    type: "LOCAL",
    raw: normalized,
    isExternal: false,
    localPath,
    exists,
    s3Key,
    s3Url,
    mimeType,
    size,
    categoryFolder,
  };
}

/**
 * Checks whether an object already exists in S3
 */
async function checkS3ObjectExists(key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return true;
  } catch (err) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    // For any permission or credential issue, warn and let upload attempt continue
    return false;
  }
}

/**
 * Scan all directory files to find any unreferenced media
 */
function findUnreferencedFiles(referencedLocalPaths) {
  const foldersToInspect = [
    { dir: path.join(FRONTEND_PUBLIC, "images/cakes"), folder: "products" },
    { dir: path.join(FRONTEND_PUBLIC, "images/categories"), folder: "categories" },
    { dir: path.join(FRONTEND_PUBLIC, "images/occasions"), folder: "occasions" },
  ];

  const unreferenced = [];

  for (const { dir, folder } of foldersToInspect) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      if (fs.statSync(fullPath).isFile()) {
        const isReferenced = referencedLocalPaths.has(path.normalize(fullPath).toLowerCase());
        if (!isReferenced) {
          unreferenced.push({
            filename: f,
            localPath: fullPath,
            size: fs.statSync(fullPath).size,
            folder,
          });
        }
      }
    }
  }

  return unreferenced;
}

async function runMigration() {
  const modeLabel = isDryRun ? "DRY-RUN (NO WRITES WILL OCCUR)" : "LIVE MIGRATION";
  console.log(`\n===============================================================`);
  console.log(`🚀 OSSAMCAKE MEDIA MIGRATION TO AWS S3 — ${modeLabel}`);
  console.log(`===============================================================`);
  console.log(`• S3 Region:     ${region}`);
  console.log(`• S3 Bucket:     ${bucketName}`);
  console.log(`• Mode:          ${isDryRun ? "DRY RUN (Preview only)" : "LIVE EXECUTION"}`);

  // Connect to DB
  console.log(`\n[DB] Connecting to MongoDB Atlas...`);
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`[DB] Connected successfully.`);

  // Migration Tracking
  const reportItems = [];
  const referencedLocalPaths = new Set();
  const uniqueFilesToUpload = new Map(); // s3Key -> file details
  const documentsToUpdate = []; // list of DB updates to execute

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SCAN PRODUCTS (Cake)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n[1/3] Scanning Products (Cake)...`);
  const cakes = await Cake.find({}).lean();
  console.log(`      Found ${cakes.length} total products in database.`);

  for (const cake of cakes) {
    let docChanged = false;
    const updatePayload = {};

    // A. Check Thumbnail
    if (cake.thumbnail) {
      const resolved = resolveMediaRef(cake.thumbnail);
      if (resolved.isExternal) {
        reportItems.push({
          collection: "Cake",
          documentId: cake._id.toString(),
          name: cake.name,
          field: "thumbnail",
          oldValue: cake.thumbnail,
          status: "SKIPPED_ALREADY_EXTERNAL",
        });
      } else {
        if (resolved.exists) {
          referencedLocalPaths.add(path.normalize(resolved.localPath).toLowerCase());
          if (!uniqueFilesToUpload.has(resolved.s3Key)) {
            uniqueFilesToUpload.set(resolved.s3Key, resolved);
          }
          docChanged = true;
          updatePayload.thumbnail = resolved.s3Url;
          reportItems.push({
            collection: "Cake",
            documentId: cake._id.toString(),
            name: cake.name,
            field: "thumbnail",
            oldValue: cake.thumbnail,
            localPath: resolved.localPath,
            s3Key: resolved.s3Key,
            newValue: resolved.s3Url,
            size: resolved.size,
            mimeType: resolved.mimeType,
            status: "PENDING_MIGRATION",
          });
        } else {
          reportItems.push({
            collection: "Cake",
            documentId: cake._id.toString(),
            name: cake.name,
            field: "thumbnail",
            oldValue: cake.thumbnail,
            localPath: resolved.localPath,
            status: "MISSING_LOCAL_FILE",
          });
        }
      }
    }

    // B. Check Gallery
    if (cake.gallery && Array.isArray(cake.gallery) && cake.gallery.length > 0) {
      const newGallery = [];
      let galleryChanged = false;

      for (let i = 0; i < cake.gallery.length; i++) {
        const item = cake.gallery[i];
        const resolved = resolveMediaRef(item);

        if (resolved.isExternal) {
          newGallery.push(item);
          reportItems.push({
            collection: "Cake",
            documentId: cake._id.toString(),
            name: cake.name,
            field: `gallery[${i}]`,
            oldValue: item,
            status: "SKIPPED_ALREADY_EXTERNAL",
          });
        } else {
          if (resolved.exists) {
            referencedLocalPaths.add(path.normalize(resolved.localPath).toLowerCase());
            if (!uniqueFilesToUpload.has(resolved.s3Key)) {
              uniqueFilesToUpload.set(resolved.s3Key, resolved);
            }
            newGallery.push(resolved.s3Url);
            galleryChanged = true;
            reportItems.push({
              collection: "Cake",
              documentId: cake._id.toString(),
              name: cake.name,
              field: `gallery[${i}]`,
              oldValue: item,
              localPath: resolved.localPath,
              s3Key: resolved.s3Key,
              newValue: resolved.s3Url,
              size: resolved.size,
              mimeType: resolved.mimeType,
              status: "PENDING_MIGRATION",
            });
          } else {
            newGallery.push(item); // Keep original if local file missing
            reportItems.push({
              collection: "Cake",
              documentId: cake._id.toString(),
              name: cake.name,
              field: `gallery[${i}]`,
              oldValue: item,
              localPath: resolved.localPath,
              status: "MISSING_LOCAL_FILE",
            });
          }
        }
      }

      if (galleryChanged) {
        docChanged = true;
        updatePayload.gallery = newGallery;
      }
    }

    if (docChanged) {
      documentsToUpdate.push({
        model: Cake,
        collection: "Cake",
        _id: cake._id,
        name: cake.name,
        original: { thumbnail: cake.thumbnail, gallery: cake.gallery },
        updatePayload,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. SCAN CATEGORIES (Category)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n[2/3] Scanning Categories...`);
  const categories = await Category.find({}).lean();
  console.log(`      Found ${categories.length} total categories in database.`);

  for (const cat of categories) {
    if (cat.image) {
      const resolved = resolveMediaRef(cat.image);
      if (resolved.isExternal) {
        reportItems.push({
          collection: "Category",
          documentId: cat._id.toString(),
          name: cat.name,
          field: "image",
          oldValue: cat.image,
          status: "SKIPPED_ALREADY_EXTERNAL",
        });
      } else {
        if (resolved.exists) {
          referencedLocalPaths.add(path.normalize(resolved.localPath).toLowerCase());
          if (!uniqueFilesToUpload.has(resolved.s3Key)) {
            uniqueFilesToUpload.set(resolved.s3Key, resolved);
          }
          documentsToUpdate.push({
            model: Category,
            collection: "Category",
            _id: cat._id,
            name: cat.name,
            original: { image: cat.image },
            updatePayload: { image: resolved.s3Url },
          });
          reportItems.push({
            collection: "Category",
            documentId: cat._id.toString(),
            name: cat.name,
            field: "image",
            oldValue: cat.image,
            localPath: resolved.localPath,
            s3Key: resolved.s3Key,
            newValue: resolved.s3Url,
            size: resolved.size,
            mimeType: resolved.mimeType,
            status: "PENDING_MIGRATION",
          });
        } else {
          reportItems.push({
            collection: "Category",
            documentId: cat._id.toString(),
            name: cat.name,
            field: "image",
            oldValue: cat.image,
            localPath: resolved.localPath,
            status: "MISSING_LOCAL_FILE",
          });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. SCAN OCCASIONS (Occasion)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n[3/3] Scanning Occasions...`);
  const occasions = await Occasion.find({}).lean();
  console.log(`      Found ${occasions.length} total occasions in database.`);

  for (const occ of occasions) {
    if (occ.image) {
      const resolved = resolveMediaRef(occ.image);
      if (resolved.isExternal) {
        reportItems.push({
          collection: "Occasion",
          documentId: occ._id.toString(),
          name: occ.name,
          field: "image",
          oldValue: occ.image,
          status: "SKIPPED_ALREADY_EXTERNAL",
        });
      } else {
        if (resolved.exists) {
          referencedLocalPaths.add(path.normalize(resolved.localPath).toLowerCase());
          if (!uniqueFilesToUpload.has(resolved.s3Key)) {
            uniqueFilesToUpload.set(resolved.s3Key, resolved);
          }
          documentsToUpdate.push({
            model: Occasion,
            collection: "Occasion",
            _id: occ._id,
            name: occ.name,
            original: { image: occ.image },
            updatePayload: { image: resolved.s3Url },
          });
          reportItems.push({
            collection: "Occasion",
            documentId: occ._id.toString(),
            name: occ.name,
            field: "image",
            oldValue: occ.image,
            localPath: resolved.localPath,
            s3Key: resolved.s3Key,
            newValue: resolved.s3Url,
            size: resolved.size,
            mimeType: resolved.mimeType,
            status: "PENDING_MIGRATION",
          });
        } else {
          reportItems.push({
            collection: "Occasion",
            documentId: occ._id.toString(),
            name: occ.name,
            field: "image",
            oldValue: occ.image,
            localPath: resolved.localPath,
            status: "MISSING_LOCAL_FILE",
          });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. FIND UNREFERENCED FILES
  // ─────────────────────────────────────────────────────────────────────────────
  const unreferencedFiles = findUnreferencedFiles(referencedLocalPaths);

  // Calculate totals
  let totalBytes = 0;
  for (const f of uniqueFilesToUpload.values()) {
    totalBytes += f.size;
  }
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log(`\n===============================================================`);
  console.log(`📊 AUDIT & MIGRATION SUMMARY`);
  console.log(`===============================================================`);
  console.log(`• Total MongoDB Documents Scanned:    ${cakes.length + categories.length + occasions.length}`);
  console.log(`• Documents to Update:                ${documentsToUpdate.length}`);
  console.log(`• Unique Local Files to Upload:       ${uniqueFilesToUpload.size} (${totalMB} MB)`);
  console.log(`• Missing Local Files:                ${reportItems.filter(r => r.status === "MISSING_LOCAL_FILE").length}`);
  console.log(`• Already External / S3 (Skipped):    ${reportItems.filter(r => r.status === "SKIPPED_ALREADY_EXTERNAL").length}`);
  console.log(`• Unreferenced Files in Folders:      ${unreferencedFiles.length}`);

  // Display Unique Files to Migrate
  console.log(`\n📦 UNIQUE FILES TO MIGRATE TO S3 (${uniqueFilesToUpload.size}):`);
  let idx = 1;
  for (const [key, item] of uniqueFilesToUpload.entries()) {
    const sizeKB = (item.size / 1024).toFixed(1);
    console.log(`  ${idx++}. [${item.mimeType}] ${item.s3Key} (${sizeKB} KB)`);
    console.log(`     From: ${item.localPath}`);
    console.log(`     To:   ${item.s3Url}`);
  }

  // Display Documents to Update
  console.log(`\n📝 MONGODB DOCUMENTS TO UPDATE (${documentsToUpdate.length}):`);
  documentsToUpdate.forEach((d, i) => {
    console.log(`  ${i + 1}. [${d.collection}] "${d.name}" (ID: ${d._id})`);
    if (d.updatePayload.thumbnail) console.log(`     thumbnail: ${d.original.thumbnail}  →  ${d.updatePayload.thumbnail}`);
    if (d.updatePayload.gallery) console.log(`     gallery[0]: ${d.original.gallery?.[0]}  →  ${d.updatePayload.gallery[0]}`);
    if (d.updatePayload.image) console.log(`     image: ${d.original.image}  →  ${d.updatePayload.image}`);
  });

  // Display Unreferenced Files if any
  if (unreferencedFiles.length > 0) {
    console.log(`\n⚠️  UNREFERENCED FILES (In folders but NOT referenced in MongoDB — Will NOT be uploaded):`);
    unreferencedFiles.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.folder}/${u.filename} (${(u.size / 1024).toFixed(1)} KB) - ${u.localPath}`);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. DRY-RUN VS LIVE EXECUTION
  // ─────────────────────────────────────────────────────────────────────────────
  if (isDryRun) {
    console.log(`\n===============================================================`);
    console.log(`🛡️  DRY-RUN CONFIRMATIONS:`);
    console.log(`===============================================================`);
    console.log(`✅ NO S3 uploads were performed.`);
    console.log(`✅ NO MongoDB documents were modified.`);
    console.log(`✅ NO local filesystem files were deleted or moved.`);
    console.log(`✅ All ${uniqueFilesToUpload.size} files were verified to physically exist on disk.`);
    console.log(`✅ Total payload ready for migration: ${totalMB} MB across ${documentsToUpdate.length} documents.`);

    // Write dry-run migration-report.json
    const reportPath = path.resolve(__dirname, "migration-report.json");
    const reportData = {
      timestamp: new Date().toISOString(),
      mode: "DRY_RUN",
      scannedDocuments: cakes.length + categories.length + occasions.length,
      documentsToUpdateCount: documentsToUpdate.length,
      uniqueFilesToUploadCount: uniqueFilesToUpload.size,
      totalBytesToUpload: totalBytes,
      totalMBToUpload: totalMB,
      missingFilesCount: reportItems.filter(r => r.status === "MISSING_LOCAL_FILE").length,
      alreadyExternalCount: reportItems.filter(r => r.status === "SKIPPED_ALREADY_EXTERNAL").length,
      unreferencedFilesCount: unreferencedFiles.length,
      unreferencedFiles,
      items: reportItems,
    };
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), "utf-8");
    console.log(`\n📄 Dry-run report generated: backend/scripts/migration-report.json`);
    console.log(`\n[STOP] Dry-run complete. Awaiting user approval for LIVE execution.`);

    await mongoose.disconnect();
    return;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. LIVE MIGRATION EXECUTION (Only reached when NOT in dry-run)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n===============================================================`);
  console.log(`⚡ PROCEEDING WITH LIVE MIGRATION...`);
  console.log(`===============================================================`);

  // Step A: Create Pre-migration Backup
  const timestamp = Date.now();
  const backupPath = path.resolve(__dirname, `backup-pre-migration-${timestamp}.json`);
  const backupData = documentsToUpdate.map(d => ({
    collection: d.collection,
    documentId: d._id.toString(),
    name: d.name,
    original: d.original,
    proposedUpdate: d.updatePayload,
  }));
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), "utf-8");
  console.log(`💾 Backup created: backend/scripts/backup-pre-migration-${timestamp}.json`);

  // Step B: Upload Unique Files to S3
  console.log(`\n[S3] Uploading ${uniqueFilesToUpload.size} unique files to S3 bucket "${bucketName}"...`);
  let uploadedCount = 0;
  let s3Errors = 0;
  const s3UploadStatus = new Map();

  for (const [key, item] of uniqueFilesToUpload.entries()) {
    try {
      // Check if already in S3
      const alreadyExists = await checkS3ObjectExists(key);
      if (alreadyExists) {
        console.log(`   ⏩ [EXISTS] S3 object already present: ${key}`);
        s3UploadStatus.set(key, true);
        continue;
      }

      const fileBuffer = fs.readFileSync(item.localPath);
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: item.mimeType,
      });

      await s3Client.send(putCommand);

      // Verify S3 object exists using HeadObjectCommand
      const verified = await checkS3ObjectExists(key);
      if (!verified) {
        throw new Error(`HeadObject verification failed for S3 object: ${key}`);
      }

      console.log(`   ✅ [UPLOADED & VERIFIED] ${key} (${(item.size / 1024).toFixed(1)} KB)`);
      s3UploadStatus.set(key, true);
      uploadedCount++;
    } catch (err) {
      console.error(`   ❌ [FAILED] Could not upload or verify ${key}:`, err.message);
      s3UploadStatus.set(key, false);
      s3Errors++;
    }
  }

  // Step C: Update MongoDB Documents (Only for files that successfully uploaded)
  console.log(`\n[DB] Updating ${documentsToUpdate.length} MongoDB documents...`);
  let dbUpdatedCount = 0;
  let dbErrors = 0;

  for (const doc of documentsToUpdate) {
    try {
      // Verify all required S3 uploads succeeded for this document
      let canUpdate = true;
      if (doc.updatePayload.thumbnail) {
        const key = resolveMediaRef(doc.original.thumbnail)?.s3Key;
        if (key && s3UploadStatus.get(key) === false) {
          canUpdate = false;
        }
      }
      if (doc.updatePayload.image) {
        const key = resolveMediaRef(doc.original.image)?.s3Key;
        if (key && s3UploadStatus.get(key) === false) {
          canUpdate = false;
        }
      }
      if (doc.updatePayload.gallery) {
        for (const originalGalleryItem of doc.original.gallery || []) {
          const resolved = resolveMediaRef(originalGalleryItem);
          if (!resolved || resolved.isExternal) {
            continue;
          }
          if (resolved.s3Key && s3UploadStatus.get(resolved.s3Key) === false) {
            canUpdate = false;
            break;
          }
        }
      }

      if (!canUpdate) {
        console.warn(`   ⚠️  [SKIPPED] S3 upload failed for ${doc.collection} "${doc.name}", skipping DB update.`);
        continue;
      }

      await doc.model.updateOne({ _id: doc._id }, { $set: doc.updatePayload });
      console.log(`   ✅ [UPDATED] [${doc.collection}] "${doc.name}" updated with S3 URLs.`);
      dbUpdatedCount++;
    } catch (err) {
      console.error(`   ❌ [DB ERROR] Failed to update ${doc.collection} "${doc.name}":`, err.message);
      dbErrors++;
    }
  }

  // Step D: Write Live Migration Report
  const finalReportPath = path.resolve(__dirname, "migration-report.json");
  const finalReport = {
    timestamp: new Date().toISOString(),
    mode: "LIVE",
    scannedDocuments: cakes.length + categories.length + occasions.length,
    documentsToUpdateCount: documentsToUpdate.length,
    documentsSuccessfullyUpdated: dbUpdatedCount,
    uniqueFilesCount: uniqueFilesToUpload.size,
    newlyUploadedToS3: uploadedCount,
    s3Errors,
    dbErrors,
    backupFile: path.basename(backupPath),
    items: reportItems.map(item => {
      if (item.s3Key) {
        return {
          ...item,
          status: s3UploadStatus.get(item.s3Key) ? "MIGRATED_SUCCESSFULLY" : "FAILED",
        };
      }
      return item;
    }),
  };
  fs.writeFileSync(finalReportPath, JSON.stringify(finalReport, null, 2), "utf-8");

  console.log(`\n===============================================================`);
  console.log(`🎉 LIVE MIGRATION COMPLETED!`);
  console.log(`===============================================================`);
  console.log(`• Files Uploaded to S3:       ${uploadedCount}`);
  console.log(`• MongoDB Documents Updated:  ${dbUpdatedCount}`);
  console.log(`• S3 Upload Errors:           ${s3Errors}`);
  console.log(`• DB Update Errors:           ${dbErrors}`);
  console.log(`• Detailed Report:            backend/scripts/migration-report.json`);
  console.log(`• Pre-migration Backup:       backend/scripts/${path.basename(backupPath)}`);
  console.log(`===============================================================`);

  await mongoose.disconnect();
}

runMigration().catch(err => {
  console.error("FATAL ERROR during migration script:", err);
  process.exit(1);
});
