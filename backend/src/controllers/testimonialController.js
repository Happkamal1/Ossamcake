const Testimonial = require("../models/Testimonial");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Fallback testimonials if database has none seeded yet
const DEFAULT_TESTIMONIALS = [
  {
    name: "Aisha Rahman",
    role: "Bride",
    rating: 5,
    message: "The Elegant Pearl wedding cake was the talk of our reception! Not only was it breath-takingly beautiful, but the layers of Champagne Vanilla Bean were incredibly moist and delicious.",
    avatar: "AR",
    order: 1,
    isActive: true,
  },
  {
    name: "Liam O'Connor",
    role: "Birthday Parent",
    rating: 5,
    message: "Ordered the Custom Confetti cake for my son's 5th birthday. The design was exactly what we wanted, and it was so delicious that both kids and adults asked for seconds!",
    avatar: "LO",
    order: 2,
    isActive: true,
  },
  {
    name: "Sophia Chen",
    role: "Anniversary Host",
    rating: 5,
    message: "The Ariston Signature cake is hands down the best chocolate cake I have ever tasted in New York. The gold dust detail makes it feel so premium. Well worth every penny!",
    avatar: "SC",
    order: 3,
    isActive: true,
  },
];

/**
 * @desc    Get all active Testimonials for customer-facing pages
 * @route   GET /api/v1/testimonials
 * @access  Public
 */
const getPublicTestimonials = asyncHandler(async (req, res) => {
  let testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

  if (!testimonials || testimonials.length === 0) {
    try {
      await Testimonial.insertMany(DEFAULT_TESTIMONIALS);
      testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    } catch {
      testimonials = DEFAULT_TESTIMONIALS;
    }
  }

  // Format to ensure frontend compatibility (providing both `message` and `text`)
  const formatted = testimonials.map((t) => ({
    ...t,
    text: t.message,
    avatar: t.avatar || (t.name ? t.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "CU"),
  }));

  res.status(200).json(new ApiResponse(200, formatted, "Testimonials fetched successfully"));
});

/**
 * @desc    Admin: Get all Testimonials (active and inactive)
 * @route   GET /api/v1/admin/testimonials
 * @access  Admin
 */
const getAdminTestimonials = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
      { role: { $regex: search, $options: "i" } },
    ];
  }

  let testimonials = await Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).lean();

  if (testimonials.length === 0 && !search) {
    try {
      await Testimonial.insertMany(DEFAULT_TESTIMONIALS);
      testimonials = await Testimonial.find({}).sort({ order: 1, createdAt: -1 }).lean();
    } catch {
      // ignore
    }
  }

  const formatted = testimonials.map((t) => ({
    ...t,
    text: t.message,
  }));

  res.status(200).json(new ApiResponse(200, formatted, "Admin Testimonials fetched successfully"));
});

/**
 * @desc    Admin: Create new Testimonial
 * @route   POST /api/v1/admin/testimonials
 * @access  Admin
 */
const createTestimonial = asyncHandler(async (req, res) => {
  const { name, role, rating, message, text, avatar, image, order, isActive } = req.body;

  const resolvedMessage = message || text;
  if (!name || !name.trim()) {
    throw new ApiError(400, "Customer name is required");
  }
  if (!resolvedMessage || !resolvedMessage.trim()) {
    throw new ApiError(400, "Testimonial message is required");
  }

  const generatedAvatar = avatar?.trim() || (name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "CU");

  const testimonial = await Testimonial.create({
    name: name.trim(),
    role: role ? role.trim() : "Customer",
    rating: Number(rating) || 5,
    message: resolvedMessage.trim(),
    avatar: generatedAvatar,
    image: image ? image.trim() : "",
    order: Number(order) || 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  const formatted = {
    ...testimonial.toObject(),
    text: testimonial.message,
  };

  res.status(201).json(new ApiResponse(201, formatted, "Testimonial created successfully"));
});

/**
 * @desc    Admin: Update existing Testimonial
 * @route   PUT /api/v1/admin/testimonials/:id
 * @access  Admin
 */
const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, rating, message, text, avatar, image, order, isActive } = req.body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = name.trim();
  if (role !== undefined) updateFields.role = role.trim();
  if (rating !== undefined) updateFields.rating = Number(rating);
  if (message !== undefined || text !== undefined) updateFields.message = (message || text).trim();
  if (avatar !== undefined) updateFields.avatar = avatar.trim();
  if (image !== undefined) updateFields.image = image.trim();
  if (order !== undefined) updateFields.order = Number(order);
  if (isActive !== undefined) updateFields.isActive = Boolean(isActive);

  const testimonial = await Testimonial.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  const formatted = {
    ...testimonial.toObject(),
    text: testimonial.message,
  };

  res.status(200).json(new ApiResponse(200, formatted, "Testimonial updated successfully"));
});

/**
 * @desc    Admin: Delete Testimonial
 * @route   DELETE /api/v1/admin/testimonials/:id
 * @access  Admin
 */
const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findByIdAndDelete(id);

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  res.status(200).json(new ApiResponse(200, { _id: id }, "Testimonial deleted successfully"));
});

/**
 * @desc    Admin: Toggle Testimonial active status
 * @route   PATCH /api/v1/admin/testimonials/:id/toggle-status
 * @access  Admin
 */
const toggleTestimonialStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  testimonial.isActive = !testimonial.isActive;
  await testimonial.save();

  const formatted = {
    ...testimonial.toObject(),
    text: testimonial.message,
  };

  res.status(200).json(new ApiResponse(200, formatted, `Testimonial ${testimonial.isActive ? "activated" : "deactivated"} successfully`));
});

module.exports = {
  getPublicTestimonials,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
};
