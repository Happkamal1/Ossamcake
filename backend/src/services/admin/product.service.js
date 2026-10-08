const Cake = require("../../models/Cake");
const ApiError = require("../../utils/ApiError");
const { uniqueSlugify } = require("../../utils/slugify");
const {
  parsePagination,
  parseSort,
  parseSearch,
  buildPaginationMeta,
} = require("../../utils/queryBuilder");
const storageService = require("../../utils/storage.service");

/**
 * Helper to safely delete an image from storage given its URL
 */
const deleteImageFromUrl = async (url) => {
  if (!url) return;
  try {
    const publicId = storageService.extractPublicIdFromUrl(url);
    if (publicId) await storageService.delete(publicId);
  } catch (err) {
    console.error("Failed to delete image:", url, err);
  }
};

/**
 * Admin Product Service
 * Full CRUD with pagination, search, filtering, soft delete.
 * Public-facing product reads remain in services/cakeService.js (unchanged).
 */

const getAllProducts = async (query) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const sort = parseSort(query.sort, "createdAt:-1");

  const filter = {};

  // Status filter (admin can see inactive products too)
  if (query.status === "active") filter.status = "active";
  else if (query.status === "inactive") filter.status = "inactive";
  // else: no filter = show all

  // Category filter
  if (query.category) filter.categories = query.category;

  // Flags
  if (query.isBestSeller === "true") filter.isBestSeller = true;
  if (query.isFeatured === "true") filter.isFeatured = true;
  if (query.isTrending === "true") filter.isTrending = true;

  // Price range
  if (query.minPrice || query.maxPrice) {
    filter.basePrice = {};
    if (query.minPrice) filter.basePrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.basePrice.$lte = Number(query.maxPrice);
  }

  // Search on name + description
  const searchFilter = parseSearch(query.search, ["name", "description"]);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [products, total] = await Promise.all([
    Cake.find(filter)
      .populate("categories", "name slug")
      .populate("occasions", "name slug")
      .populate("cakeTypes", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Cake.countDocuments(filter),
  ]);

  return { products, pagination: buildPaginationMeta(total, page, limit) };
};

const getProductById = async (id) => {
  const product = await Cake.findById(id)
    .populate("categories occasions cakeTypes")
    .lean();
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

const createProduct = async (data) => {
  // Auto-generate slug from name if not provided
  if (!data.slug && data.name) {
    data.slug = await uniqueSlugify(data.name, Cake);
  }
  const existing = await Cake.findOne({ slug: data.slug });
  if (existing) throw new ApiError(409, "A product with this slug already exists");

  const product = await Cake.create(data);
  return product;
};

const updateProduct = async (id, data) => {
  const existingProduct = await Cake.findById(id);
  if (!existingProduct) throw new ApiError(404, "Product not found");

  // Check if thumbnail changed
  const thumbnailChanged = data.thumbnail && data.thumbnail !== existingProduct.thumbnail;
  
  // Check if gallery changed
  let removedGalleryImages = [];
  if (data.gallery && Array.isArray(data.gallery)) {
    const oldGallery = existingProduct.gallery || [];
    removedGalleryImages = oldGallery.filter(url => !data.gallery.includes(url));
  }

  // If name changed but slug not provided, regenerate slug
  if (data.name && !data.slug) {
    data.slug = await uniqueSlugify(data.name, Cake, "slug", id);
  }
  
  const product = await Cake.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  // Safe cleanup: delete old images only AFTER successful update
  if (thumbnailChanged && existingProduct.thumbnail) {
    const isShared = await isReferencedElsewhere(existingProduct.thumbnail, id);
    if (!isShared) {
      await deleteImageFromUrl(existingProduct.thumbnail);
    }
  }
  if (removedGalleryImages.length > 0) {
    for (const url of removedGalleryImages) {
      const isShared = await isReferencedElsewhere(url, id);
      if (!isShared) {
        await deleteImageFromUrl(url);
      }
    }
  }

  return product;
};

// Toggle active/inactive status without deleting
const toggleStatus = async (id, targetStatus) => {
  const product = await Cake.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  const newStatus = targetStatus || (product.status === "active" ? "inactive" : "active");
  if (!["active", "inactive"].includes(newStatus)) {
    throw new ApiError(400, "Invalid status. Must be 'active' or 'inactive'");
  }

  product.status = newStatus;
  product.isActive = newStatus === "active";
  await product.save();

  return product;
};

// Soft delete — sets status to "inactive" instead of removing from DB
const softDeleteProduct = async (id) => {
  return toggleStatus(id, "inactive");
};

/**
 * Check if an image URL or S3 key is referenced by another Cake, Category, Occasion, or Banner
 */
const isReferencedElsewhere = async (url, excludeCakeId) => {
  if (!url) return false;
  const key = storageService.extractPublicIdFromUrl(url) || url;

  // Criteria matching either the full URL or the extracted S3 key
  const matchCriteria = [
    { thumbnail: url },
    { gallery: url },
  ];
  if (key && key !== url) {
    matchCriteria.push({ thumbnail: { $regex: key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } });
    matchCriteria.push({ gallery: { $regex: key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } });
  }

  // 1. Check other Cakes
  const otherCake = await Cake.findOne({
    _id: { $ne: excludeCakeId },
    $or: matchCriteria,
  }).select("_id name").lean();
  if (otherCake) return true;

  // 2. Check Categories
  const Category = require("../../models/Category");
  const otherCat = await Category.findOne({
    $or: [
      { image: url },
      ...(key && key !== url ? [{ image: { $regex: key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }] : []),
    ],
  }).select("_id name").lean();
  if (otherCat) return true;

  // 3. Check Occasions
  const Occasion = require("../../models/Occasion");
  const otherOcc = await Occasion.findOne({
    $or: [
      { image: url },
      ...(key && key !== url ? [{ image: { $regex: key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }] : []),
    ],
  }).select("_id name").lean();
  if (otherOcc) return true;

  // 4. Check Banners
  try {
    const Banner = require("../../models/Banner");
    const otherBanner = await Banner.findOne({
      $or: [
        { desktopImage: url },
        { tabletImage: url },
        { mobileImage: url },
        { image: url },
      ],
    }).select("_id title").lean();
    if (otherBanner) return true;
  } catch (err) {
    // Banner model optional
  }

  return false;
};

// Hard delete — permanent removal from DB and safe S3 media cleanup
const hardDeleteProduct = async (id) => {
  const product = await Cake.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  // Gather unique image URLs associated with this product
  const rawImages = [product.thumbnail, ...(Array.isArray(product.gallery) ? product.gallery : [])];
  const uniqueImages = [...new Set(rawImages.filter(Boolean))];

  // 1. Delete product from MongoDB first (ensure DB operation succeeds before media cleanup)
  await Cake.findByIdAndDelete(id);

  // 2. Identify and safely delete only exclusively owned/referenced S3 objects
  const cleanupReport = { deleted: [], skippedShared: [], errors: [] };

  for (const imageUrl of uniqueImages) {
    try {
      const isShared = await isReferencedElsewhere(imageUrl, id);
      if (isShared) {
        cleanupReport.skippedShared.push(imageUrl);
        console.log(`[Permanent Delete] Preserving shared media reference: ${imageUrl}`);
        continue;
      }

      await deleteImageFromUrl(imageUrl);
      cleanupReport.deleted.push(imageUrl);
      console.log(`[Permanent Delete] Safely deleted exclusive media: ${imageUrl}`);
    } catch (err) {
      // Never expose AWS credentials in logs or responses
      cleanupReport.errors.push({ url: imageUrl, error: err.message || "Deletion failed" });
      console.error(`[Permanent Delete Error] Failed to delete image ${imageUrl}:`, err.message || "Unknown error");
    }
  }

  return { id, name: product.name, cleanupReport };
};

// Toggle featured/trending/bestSeller flags
const toggleFlag = async (id, flag, value) => {
  const validFlags = ["isBestSeller", "isTodaySpecial", "isFeatured", "isTrending", "isNewArrival"];
  if (!validFlags.includes(flag)) throw new ApiError(400, `Invalid flag: ${flag}`);
  const product = await Cake.findByIdAndUpdate(id, { [flag]: value }, { new: true });
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleStatus,
  softDeleteProduct,
  hardDeleteProduct,
  toggleFlag,
};
