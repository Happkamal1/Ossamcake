const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/banner.controller");
const { uploadBannerImage } = require("../../middlewares/uploadMiddleware");

router.get("/", c.getAllBanners);
router.post("/", c.createBanner);
router.put("/:id", c.updateBanner);
router.delete("/:id", c.deleteBanner);

// Image management
router.post("/upload", uploadBannerImage, c.uploadImage);
router.delete("/image/:publicId", c.deleteImage);

module.exports = router;
