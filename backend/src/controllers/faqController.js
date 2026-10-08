const FAQ = require("../models/FAQ");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Fallback FAQs if database has none seeded yet
const DEFAULT_FAQS = [
  {
    question: "Do you offer eggless options for your cakes?",
    answer: "Yes! Almost all our signature cakes can be customized to be 100% eggless. Simply select the 'Eggless' toggle on the cake details page before adding it to your cart.",
    category: "Cakes & Flavors",
    order: 1,
    isActive: true,
  },
  {
    question: "How far in advance do I need to place my order?",
    answer: "For our classic cakes, a 24-hour advance order is sufficient. For multi-tiered custom wedding cakes, we recommend booking at least 3 to 7 days in advance to ensure slot availability.",
    category: "Ordering",
    order: 2,
    isActive: true,
  },
  {
    question: "Do you deliver to my location and what are the charges?",
    answer: "We deliver across the metropolitan area in temperature-controlled delivery vans. Delivery is free for all orders above ₹800. For orders under ₹800, a flat shipping fee of ₹99 is charged.",
    category: "Delivery",
    order: 3,
    isActive: true,
  },
  {
    question: "Can I customize the message or add a photo to the cake?",
    answer: "Absolutely! Every cake details page allows you to type in a custom message (e.g., 'Happy Anniversary') and upload high-resolution JPEG/PNG files for our photo-iced cakes.",
    category: "Customization",
    order: 4,
    isActive: true,
  },
];

/**
 * @desc    Get all active FAQs for customer-facing pages
 * @route   GET /api/v1/faqs
 * @access  Public
 */
const getPublicFaqs = asyncHandler(async (req, res) => {
  let faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

  if (!faqs || faqs.length === 0) {
    // Auto-seed initial defaults so homepage never looks empty
    try {
      await FAQ.insertMany(DEFAULT_FAQS);
      faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    } catch {
      faqs = DEFAULT_FAQS;
    }
  }

  res.status(200).json(new ApiResponse(200, faqs, "FAQs fetched successfully"));
});

/**
 * @desc    Admin: Get all FAQs (active and inactive)
 * @route   GET /api/v1/admin/faqs
 * @access  Admin
 */
const getAdminFaqs = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = {};

  if (category && category !== "all") {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { question: { $regex: search, $options: "i" } },
      { answer: { $regex: search, $options: "i" } },
    ];
  }

  let faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 }).lean();

  if (faqs.length === 0 && !search && (!category || category === "all")) {
    try {
      await FAQ.insertMany(DEFAULT_FAQS);
      faqs = await FAQ.find({}).sort({ order: 1, createdAt: -1 }).lean();
    } catch {
      // ignore
    }
  }

  res.status(200).json(new ApiResponse(200, faqs, "Admin FAQs fetched successfully"));
});

/**
 * @desc    Admin: Create new FAQ
 * @route   POST /api/v1/admin/faqs
 * @access  Admin
 */
const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, category, order, isActive } = req.body;

  if (!question || !question.trim()) {
    throw new ApiError(400, "Question is required");
  }
  if (!answer || !answer.trim()) {
    throw new ApiError(400, "Answer is required");
  }

  const faq = await FAQ.create({
    question: question.trim(),
    answer: answer.trim(),
    category: category ? category.trim() : "General",
    order: Number(order) || 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json(new ApiResponse(201, faq, "FAQ created successfully"));
});

/**
 * @desc    Admin: Update existing FAQ
 * @route   PUT /api/v1/admin/faqs/:id
 * @access  Admin
 */
const updateFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { question, answer, category, order, isActive } = req.body;

  const updateFields = {};
  if (question !== undefined) updateFields.question = question.trim();
  if (answer !== undefined) updateFields.answer = answer.trim();
  if (category !== undefined) updateFields.category = category.trim();
  if (order !== undefined) updateFields.order = Number(order);
  if (isActive !== undefined) updateFields.isActive = Boolean(isActive);

  const faq = await FAQ.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  res.status(200).json(new ApiResponse(200, faq, "FAQ updated successfully"));
});

/**
 * @desc    Admin: Delete FAQ
 * @route   DELETE /api/v1/admin/faqs/:id
 * @access  Admin
 */
const deleteFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await FAQ.findByIdAndDelete(id);

  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  res.status(200).json(new ApiResponse(200, { _id: id }, "FAQ deleted successfully"));
});

/**
 * @desc    Admin: Toggle FAQ active status
 * @route   PATCH /api/v1/admin/faqs/:id/toggle-status
 * @access  Admin
 */
const toggleFaqStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await FAQ.findById(id);

  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  faq.isActive = !faq.isActive;
  await faq.save();

  res.status(200).json(new ApiResponse(200, faq, `FAQ ${faq.isActive ? "activated" : "deactivated"} successfully`));
});

module.exports = {
  getPublicFaqs,
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
};
