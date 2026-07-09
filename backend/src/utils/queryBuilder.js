/**
 * Query Builder Utility
 * Eliminates copy-paste pagination/sort/filter logic across all service files.
 *
 * Usage in a service:
 *   const { filter, sortOption, skip, limitNum } = buildQuery(req.query, ["name","description"]);
 *   const [docs, total] = await Promise.all([
 *     Model.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
 *     Model.countDocuments(filter),
 *   ]);
 */

/**
 * Parse pagination parameters from request query.
 * @param {string|number} page
 * @param {string|number} limit
 * @returns {{ page: number, limit: number, skip: number }}
 */
const parsePagination = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };
};

/**
 * Parse a sort string like "price:asc" or "rating:desc" into a Mongoose sort object.
 * @param {string} sort  — format: "field:direction" or "field" (defaults to asc)
 * @param {string} defaultSort — fallback sort field
 * @returns {Object}
 */
const parseSort = (sort, defaultSort = "createdAt:-1") => {
  if (!sort) {
    const [field, dir] = defaultSort.split(":");
    return { [field]: Number(dir) || -1 };
  }
  const [field, direction] = sort.split(":");
  const dir = direction === "asc" ? 1 : -1;
  return { [field]: dir };
};

/**
 * Build a text search filter from a search query string.
 * @param {string} search
 * @param {string[]} fields  — fields to search in (e.g. ["name","description"])
 * @returns {Object|null}
 */
const parseSearch = (search, fields = ["name"]) => {
  if (!search || !search.trim()) return null;
  const regex = { $regex: search.trim(), $options: "i" };
  if (fields.length === 1) return { [fields[0]]: regex };
  return { $or: fields.map((f) => ({ [f]: regex })) };
};

/**
 * Build a status filter. Defaults to active-only for public routes.
 * @param {string} status — "active" | "inactive" | "all"
 * @param {string} statusField — field name in the model (default: "isActive")
 * @param {boolean} adminMode — if true, "all" skips the filter
 * @returns {Object}
 */
const parseStatus = (status, statusField = "isActive", adminMode = false) => {
  if (adminMode && status === "all") return {};
  if (status === "inactive") return { [statusField]: false };
  return { [statusField]: true };
};

/**
 * Build a complete pagination metadata object for API responses.
 * @param {number} total  — total matching document count
 * @param {number} page
 * @param {number} limit
 * @returns {Object}
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

module.exports = {
  parsePagination,
  parseSort,
  parseSearch,
  parseStatus,
  buildPaginationMeta,
};
