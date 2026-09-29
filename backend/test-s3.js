require('dotenv').config();

// Force S3 driver for testing
process.env.STORAGE_DRIVER = 's3';
if (!process.env.AWS_REGION) process.env.AWS_REGION = 'ap-south-1';
if (!process.env.S3_BUCKET_NAME) process.env.S3_BUCKET_NAME = 'ossamcake-images-713877988783-ap-south-1-an';

const storageService = require('./src/utils/storage.service');

async function runTest() {
  console.log("Starting S3 Storage Service Test...");

  try {
    // 1. Create a dummy file buffer to simulate multer
    const dummyBuffer = Buffer.from('This is a test image content for OssamCake S3 migration.', 'utf-8');
    const dummyFile = {
      buffer: dummyBuffer,
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg'
    };

    // 2. Upload image
    console.log("\n[TEST] Uploading test image to S3...");
    const result = await storageService.upload(dummyFile, 'test');
    console.log("Upload successful! Result:", result);
    
    // 3. Verify returned URL and publicId
    if (!result.url || !result.publicId) {
      throw new Error("Missing url or publicId in response");
    }
    
    console.log("\n[TEST] Verifying returned URL format...");
    console.log("URL:", result.url);
    console.log("PublicId:", result.publicId);

    // 4. Delete image
    console.log(`\n[TEST] Deleting test image from S3 with publicId: ${result.publicId}`);
    await storageService.delete(result.publicId);
    console.log("Delete successful!");

    console.log("\n✅ All S3 operations tested successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    if (error.name === 'CredentialsProviderError') {
      console.log("\nNote: AWS Credentials are required to run this test locally.");
      console.log("On the EC2 production server, IAM roles handle this automatically.");
      console.log("To run locally, export AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your terminal.");
    }
  }
}

runTest();
