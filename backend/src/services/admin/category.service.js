const Category = require("../../models/Category");
const ApiError = require("../../utils/ApiError");
const { uniqueSlugify } = require("../../utils/slugify");
const { parsePagination, parseSort, parseSearch, buildPaginationMeta } = require("../../utils/queryBuilder");

const getAllCategories = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const sort = parseSort(query.sort, "displayOrder:1");
  const filter = {};
  if (query.status === "active") filter.isActive = true;
  else if (query.status === "inactive") filter.isActive = false;
  const searchFilter = parseSearch(query.search, ["name"]);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [categories, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Category.countDocuments(filter),
  ]);
  return { categories, pagination: buildPaginationMeta(total, page, limit) };
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id).lean();
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};

const createCategory = async (data) => {
  if (!data.slug && data.name) data.slug = await uniqueSlugify(data.name, Category);
  const existing = await Category.findOne({ slug: data.slug });
  if (existing) throw new ApiError(409, "Category with this slug already exists");
  return await Category.create(data);
};

const updateCategory = async (id, data) => {
  if (data.name && !data.slug) data.slug = await uniqueSlugify(data.name, Category, "slug", id);
  const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
