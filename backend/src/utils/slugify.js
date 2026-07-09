/**
 * Slug Generator Utility
 * Converts any string into a URL-friendly slug.
 * Used for auto-generating slugs in admin create operations.
 *
 * Examples:
 *   slugify("Ariston Premium Signature Cake") → "ariston-premium-signature-cake"
 *   slugify("Birthday & Kids Cakes!") → "birthday-and-kids-cakes"
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")           // Replace & with 'and'
    .replace(/[^\w\s-]/g, "")      // Remove special characters
    .replace(/[\s_]+/g, "-")       // Replace spaces/underscores with -
    .replace(/--+/g, "-")          // Replace multiple - with single -
    .replace(/^-+/, "")            // Trim - from start
    .replace(/-+$/, "");           // Trim - from end
};

/**
 * Generate a unique slug by appending a numeric suffix if the base slug already exists.
 * @param {string} text           — source text to slugify
 * @param {Object} model          — Mongoose model to check uniqueness against
 * @param {string} slugField      — field name on the model (default: "slug")
 * @param {string|null} excludeId — _id to exclude when checking (for update operations)
 * @returns {Promise<string>}
 */
const uniqueSlugify = async (text, model, slugField = "slug", excludeId = null) => {
  const baseSlug = slugify(text);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { [slugField]: slug };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await model.findOne(query).lean();
    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = { slugify, uniqueSlugify };
