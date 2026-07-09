const Banner = require("../../models/Banner");
const ApiError = require("../../utils/ApiError");
const { parsePagination, parseSort, buildPaginationMeta } = require("../../utils/queryBuilder");
const storageService = require("../../utils/storage.service");

const getAllBanners = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const sort = parseSort(query.sort, "displayOrder:1");
  const filter = {};

  if (query.position) filter.position = query.position;
  
  if (query.status === "active") {
    filter.status = "active";
  } else if (query.status === "inactive") {
    filter.status = "inactive";
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { subtitle: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  const [banners, total] = await Promise.all([
    Banner.find(filter).sort(sort).skip(skip).limit(limit).populate("createdBy updatedBy", "name email").lean(),
    Banner.countDocuments(filter),
  ]);
  return { banners, pagination: buildPaginationMeta(total, page, limit) };
};

// Public: get active banners for a specific position
const getActiveBanners = async (position) => {
  const now = new Date();
  const filter = {
    status: "active",
    ...(position ? { position } : {}),
    $or: [
      { startDate: null },
      { startDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  };
  return await Banner.find(filter).sort({ displayOrder: 1 }).lean();
};

const createBanner = async (data, userId) => {
  const bannerData = { ...data };
  if (userId) {
    bannerData.createdBy = userId;
    bannerData.updatedBy = userId;
  }
  return await Banner.create(bannerData);
};

const updateBanner = async (id, data, userId) => {
  const bannerData = { ...data };
  if (userId) {
    bannerData.updatedBy = userId;
  }

  // If drag-and-drop only updates displayOrder, we might just have that.
  // But if images are being replaced, we should delete the old ones.
  const oldBanner = await Banner.findById(id);
  if (!oldBanner) throw new ApiError(404, "Banner not found");

  // Clean up replaced images from storage
  if (bannerData.desktopImageId && oldBanner.desktopImageId && bannerData.desktopImageId !== oldBanner.desktopImageId) {
    await storageService.delete(oldBanner.desktopImageId);
  }
  if (bannerData.tabletImageId && oldBanner.tabletImageId && bannerData.tabletImageId !== oldBanner.tabletImageId) {
    await storageService.delete(oldBanner.tabletImageId);
  }
  if (bannerData.mobileImageId && oldBanner.mobileImageId && bannerData.mobileImageId !== oldBanner.mobileImageId) {
    await storageService.delete(oldBanner.mobileImageId);
  }

  const banner = await Banner.findByIdAndUpdate(id, bannerData, { new: true, runValidators: true });
  return banner;
};

const deleteBanner = async (id) => {
  const banner = await Banner.findById(id);
  if (!banner) throw new ApiError(404, "Banner not found");

  // Delete all associated files from storage service
  if (banner.desktopImageId) {
    await storageService.delete(banner.desktopImageId).catch(() => {});
  }
  if (banner.tabletImageId) {
    await storageService.delete(banner.tabletImageId).catch(() => {});
  }
  if (banner.mobileImageId) {
    await storageService.delete(banner.mobileImageId).catch(() => {});
  }

  await banner.deleteOne();
};

module.exports = { getAllBanners, getActiveBanners, createBanner, updateBanner, deleteBanner };
