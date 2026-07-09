const Cake = require("../../models/Cake");
const ApiError = require("../../utils/ApiError");
const { uniqueSlugify } = require("../../utils/slugify");
const {
  parsePagination,
  parseSort,
  parseSearch,
  buildPaginationMeta,
} = require("../../utils/queryBuilder");

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
  // If name changed but slug not provided, regenerate slug
  if (data.name && !data.slug) {
    data.slug = await uniqueSlugify(data.name, Cake, "slug", id);
  }
  const product = await Cake.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

// Soft delete — sets status to "inactive" instead of removing from DB
const softDeleteProduct = async (id) => {
  const product = await Cake.findByIdAndUpdate(
    id,
    { status: "inactive", isActive: false },
    { new: true }
  );
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

// Hard delete — permanent removal (admin decision only)
const hardDeleteProduct = async (id) => {
  const product = await Cake.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, "Product not found");
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
  softDeleteProduct,
  hardDeleteProduct,
  toggleFlag,
};
