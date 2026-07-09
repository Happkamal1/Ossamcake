const Occasion = require("../../models/Occasion");
const ApiError = require("../../utils/ApiError");
const { uniqueSlugify } = require("../../utils/slugify");
const { parsePagination, parseSort, parseSearch, buildPaginationMeta } = require("../../utils/queryBuilder");

const getAllOccasions = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const sort = parseSort(query.sort, "displayOrder:1");
  const filter = {};
  if (query.status === "active") filter.isActive = true;
  else if (query.status === "inactive") filter.isActive = false;
  const searchFilter = parseSearch(query.search, ["name"]);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [occasions, total] = await Promise.all([
    Occasion.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Occasion.countDocuments(filter),
  ]);
  return { occasions, pagination: buildPaginationMeta(total, page, limit) };
};

const getOccasionById = async (id) => {
  const occasion = await Occasion.findById(id).lean();
  if (!occasion) throw new ApiError(404, "Occasion not found");
  return occasion;
};

const createOccasion = async (data) => {
  if (!data.slug && data.name) data.slug = await uniqueSlugify(data.name, Occasion);
  const existing = await Occasion.findOne({ slug: data.slug });
  if (existing) throw new ApiError(409, "Occasion with this slug already exists");
  return await Occasion.create(data);
};

const updateOccasion = async (id, data) => {
  if (data.name && !data.slug) data.slug = await uniqueSlugify(data.name, Occasion, "slug", id);
  const occasion = await Occasion.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!occasion) throw new ApiError(404, "Occasion not found");
  return occasion;
};

const deleteOccasion = async (id) => {
  const occasion = await Occasion.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!occasion) throw new ApiError(404, "Occasion not found");
  return occasion;
};

module.exports = { getAllOccasions, getOccasionById, createOccasion, updateOccasion, deleteOccasion };
