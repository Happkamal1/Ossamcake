const CakeType = require("../../models/CakeType");
const ApiError = require("../../utils/ApiError");
const { uniqueSlugify } = require("../../utils/slugify");
const { parsePagination, parseSort, parseSearch, buildPaginationMeta } = require("../../utils/queryBuilder");

const getAllCakeTypes = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const sort = parseSort(query.sort, "name:1");
  const filter = {};
  if (query.status === "active") filter.isActive = true;
  else if (query.status === "inactive") filter.isActive = false;
  const searchFilter = parseSearch(query.search, ["name", "description"]);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [cakeTypes, total] = await Promise.all([
    CakeType.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    CakeType.countDocuments(filter),
  ]);
  return { cakeTypes, pagination: buildPaginationMeta(total, page, limit) };
};

const getCakeTypeById = async (id) => {
  const cakeType = await CakeType.findById(id).lean();
  if (!cakeType) throw new ApiError(404, "CakeType not found");
  return cakeType;
};

const createCakeType = async (data) => {
  if (!data.slug && data.name) data.slug = await uniqueSlugify(data.name, CakeType);
  const existing = await CakeType.findOne({ slug: data.slug });
  if (existing) throw new ApiError(409, "CakeType with this slug already exists");
  return await CakeType.create(data);
};

const updateCakeType = async (id, data) => {
  if (data.name && !data.slug) data.slug = await uniqueSlugify(data.name, CakeType, "slug", id);
  const cakeType = await CakeType.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!cakeType) throw new ApiError(404, "CakeType not found");
  return cakeType;
};

const deleteCakeType = async (id) => {
  const cakeType = await CakeType.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!cakeType) throw new ApiError(404, "CakeType not found");
  return cakeType;
};

module.exports = { getAllCakeTypes, getCakeTypeById, createCakeType, updateCakeType, deleteCakeType };
