const Wishlist = require("../models/Wishlist");
const Cake = require("../models/Cake");
const ApiError = require("../utils/ApiError");

/**
 * Get user's wishlist with paginated cake data
 */
const getWishlist = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  let wishlist = await Wishlist.findOne({ user: userId });
  
  if (!wishlist) {
    return {
      cakes: [],
      pagination: {
        total: 0,
        page: Number(page),
        pages: 0,
        limit: Number(limit),
      },
    };
  }

  const total = wishlist.cakes.length;
  const skip = (Number(page) - 1) * Number(limit);

  // Optimized query: Query Cake collection directly using IDs in wishlist array
  const cakes = await Cake.find({ _id: { $in: wishlist.cakes }, status: "active" })
    .select("name slug basePrice images rating reviewsCount discount isBestSeller thumbnail")
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Map Mongoose _id to virtual id for frontend compatibility
  const mappedCakes = cakes.map(cake => ({
    ...cake,
    id: cake.slug || cake._id.toString()
  }));

  return {
    cakes: mappedCakes,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  };
};

/**
 * Add product to wishlist
 */
const addToWishlist = async (userId, productId) => {
  if (!productId) throw new ApiError(400, "Product ID is required");
  
  const cake = await Cake.findById(productId);
  if (!cake) throw new ApiError(404, "Product not found");

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, cakes: [productId] });
  } else {
    if (!wishlist.cakes.includes(productId)) {
      wishlist.cakes.push(productId);
      await wishlist.save();
    }
  }

  return await getWishlist(userId);
};

/**
 * Remove product from wishlist
 */
const removeFromWishlist = async (userId, productId) => {
  if (!productId) throw new ApiError(400, "Product ID is required");

  let wishlist = await Wishlist.findOne({ user: userId });
  if (wishlist) {
    wishlist.cakes = wishlist.cakes.filter((id) => id.toString() !== productId.toString());
    await wishlist.save();
  }

  return await getWishlist(userId);
};

/**
 * Clear wishlist
 */
const clearWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (wishlist) {
    wishlist.cakes = [];
    await wishlist.save();
  }
  return { cakes: [], pagination: { total: 0, page: 1, pages: 0, limit: 20 } };
};

/**
 * Legacy toggle endpoint for backward compatibility
 */
const toggleWishlist = async (userId, cakeId) => {
  const cake = await Cake.findById(cakeId);
  if (!cake) throw new ApiError(404, "Cake not found");

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, cakes: [cakeId] });
    return { action: "added", wishlist };
  }

  const index = wishlist.cakes.findIndex((id) => id.toString() === cakeId);

  if (index === -1) {
    wishlist.cakes.push(cakeId);
    await wishlist.save();
    return { action: "added", wishlist };
  } else {
    wishlist.cakes.splice(index, 1);
    await wishlist.save();
    return { action: "removed", wishlist };
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  toggleWishlist,
};
