const mongoose = require("mongoose");
const Cake = require("../models/Cake");
const Category = require("../models/Category");
const Occasion = require("../models/Occasion");
const CakeType = require("../models/CakeType");
const ApiError = require("../utils/ApiError");

/**
 * Get all cakes with filtering, search, sort — supports MongoDB Atlas data references
 */
const getAllCakes = async (query) => {
  const {
    category, occasion, cakeType, search, flavor, minPrice, maxPrice,
    sort = "rating-desc", isBestSeller, isTodaySpecial, isFeatured, isTrending, isNewArrival,
    page = 1, limit = 20,
  } = query;

  const filter = { status: "active" };

  // 1. Dynamic Category Resolution
  if (category && category !== "All Cakes") {
    const cat = await Category.findOne({
      $or: [{ name: category }, { slug: category }, { _id: mongoose.isValidObjectId(category) ? category : null }]
    });
    if (cat) filter.categories = cat._id;
  }

  // 2. Dynamic Occasion Resolution
  if (occasion) {
    const occ = await Occasion.findOne({
      $or: [{ name: occasion }, { slug: occasion }]
    });
    if (occ) filter.occasions = occ._id;
  }

  // 3. Dynamic CakeType Resolution
  if (cakeType) {
    const type = await CakeType.findOne({
      $or: [{ name: cakeType }, { slug: cakeType }]
    });
    if (type) filter.cakeTypes = type._id;
  }

  // 4. Text / regex search
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // 5. Flavor filter inside variants array
  if (flavor && flavor !== "All Flavors") {
    filter["variants.flavor"] = { $regex: flavor, $options: "i" };
  }

  // 6. Price range
  if (maxPrice || minPrice) {
    filter.basePrice = {};
    if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    if (minPrice) filter.basePrice.$gte = Number(minPrice);
  }

  // 7. Promotion Flags
  if (isBestSeller === "true") filter.isBestSeller = true;
  if (isTodaySpecial === "true") filter.isTodaySpecial = true;
  if (isFeatured === "true") filter.isFeatured = true;
  if (isTrending === "true") filter.isTrending = true;
  if (isNewArrival === "true") filter.isNewArrival = true;

  // 8. Sorting map
  const sortMap = {
    "rating-desc": { rating: -1 },
    "price-asc": { basePrice: 1 },
    "price-desc": { basePrice: -1 },
    "name-asc": { name: 1 },
    "reviews-desc": { reviewsCount: -1 },
    "createdAt-desc": { createdAt: -1 },
  };
  const sortOption = sortMap[sort] || { rating: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [cakes, total] = await Promise.all([
    Cake.find(filter)
      .populate("categories", "name slug")
      .populate("occasions", "name slug")
      .populate("cakeTypes", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    Cake.countDocuments(filter),
  ]);

  return {
    cakes,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  };
};

/**
 * Get single cake by slug
 */
const getCakeBySlug = async (slug) => {
  const cake = await Cake.findOne({ slug, status: "active" })
    .populate("categories occasions cakeTypes");
  if (!cake) throw new ApiError(404, "Cake not found");
  return cake;
};

/**
 * Get cake by MongoDB _id
 */
const getCakeById = async (id) => {
  const cake = await Cake.findOne({ _id: id, status: "active" })
    .populate("categories occasions cakeTypes");
  if (!cake) throw new ApiError(404, "Cake not found");
  return cake;
};

/**
 * Admin: Create cake
 */
const createCake = async (data) => {
  const existing = await Cake.findOne({ slug: data.slug });
  if (existing) throw new ApiError(409, "A cake with this slug already exists");
  const cake = await Cake.create(data);
  return cake;
};

/**
 * Admin: Update cake
 */
const updateCake = async (id, data) => {
  const cake = await Cake.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!cake) throw new ApiError(404, "Cake not found");
  return cake;
};

/**
 * Admin: Delete cake (soft delete)
 */
const deleteCake = async (id) => {
  const cake = await Cake.findByIdAndUpdate(id, { status: "inactive" }, { new: true });
  if (!cake) throw new ApiError(404, "Cake not found");
  return cake;
};

// Fields to select for listing pages (excludes full description/customizations to save bandwidth)
const LIST_SELECT_FIELDS = "name slug basePrice discount thumbnail rating reviewsCount variants status isBestSeller isTodaySpecial isFeatured isTrending isNewArrival";

const getTrendingCakes = async (limit = 4) => {
  return await Cake.find({ status: "active", isTrending: true })
    .select(LIST_SELECT_FIELDS)
    .limit(Number(limit))
    .lean();
};

const getFeaturedCakes = async (limit = 8) => {
  return await Cake.find({ status: "active", isFeatured: true })
    .select(LIST_SELECT_FIELDS)
    .limit(Number(limit))
    .lean();
};

const getNewArrivalCakes = async (limit = 8) => {
  return await Cake.find({ status: "active", isNewArrival: true })
    .select(LIST_SELECT_FIELDS)
    .limit(Number(limit))
    .lean();
};

const getRecommendedCakes = async (limit = 6) => {
  return await Cake.find({ status: "active" })
    .sort({ rating: -1 })
    .select(LIST_SELECT_FIELDS)
    .limit(Number(limit))
    .lean();
};

const searchCakes = async (q, limit = 10) => {
  if (!q) return [];
  return await Cake.find(
    { status: "active", $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .select("name slug thumbnail basePrice rating reviewsCount")
    .limit(Number(limit))
    .lean();
};

const getRelatedCakes = async (cakeId, limit = 4) => {
  const currentCake = await Cake.findById(cakeId).select("categories cakeTypes").lean();
  if (!currentCake) throw new ApiError(404, "Cake not found");

  return await Cake.find({
    status: "active",
    _id: { $ne: cakeId },
    $or: [
      { categories: { $in: currentCake.categories || [] } },
      { cakeTypes: { $in: currentCake.cakeTypes || [] } }
    ]
  })
    .select(LIST_SELECT_FIELDS)
    .limit(Number(limit))
    .lean();
};

const getCakesByCategorySlug = async (slug, query) => {
  const cat = await Category.findOne({ slug });
  if (!cat) throw new ApiError(404, "Category not found");
  
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const [cakes, total] = await Promise.all([
    Cake.find({ status: "active", categories: cat._id })
      .select(LIST_SELECT_FIELDS)
      .skip(skip)
      .limit(limit)
      .lean(),
    Cake.countDocuments({ status: "active", categories: cat._id })
  ]);

  return {
    cakes,
    pagination: { total, page, pages: Math.ceil(total / limit), limit }
  };
};

const getCakesByOccasionSlug = async (slug, query) => {
  const occ = await Occasion.findOne({ slug });
  if (!occ) throw new ApiError(404, "Occasion not found");

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const [cakes, total] = await Promise.all([
    Cake.find({ status: "active", occasions: occ._id })
      .select(LIST_SELECT_FIELDS)
      .skip(skip)
      .limit(limit)
      .lean(),
    Cake.countDocuments({ status: "active", occasions: occ._id })
  ]);

  return {
    cakes,
    pagination: { total, page, pages: Math.ceil(total / limit), limit }
  };
};

const getCakesByCakeTypeSlug = async (slug, query) => {
  const type = await CakeType.findOne({ slug });
  if (!type) throw new ApiError(404, "Cake type not found");

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const [cakes, total] = await Promise.all([
    Cake.find({ status: "active", cakeTypes: type._id })
      .select(LIST_SELECT_FIELDS)
      .skip(skip)
      .limit(limit)
      .lean(),
    Cake.countDocuments({ status: "active", cakeTypes: type._id })
  ]);

  return {
    cakes,
    pagination: { total, page, pages: Math.ceil(total / limit), limit }
  };
};

module.exports = {
  getAllCakes,
  getCakeBySlug,
  getCakeById,
  createCake,
  updateCake,
  deleteCake,
  getTrendingCakes,
  getFeaturedCakes,
  getNewArrivalCakes,
  getRecommendedCakes,
  searchCakes,
  getRelatedCakes,
  getCakesByCategorySlug,
  getCakesByOccasionSlug,
  getCakesByCakeTypeSlug
};
