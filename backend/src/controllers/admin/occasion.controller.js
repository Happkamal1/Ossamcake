const occasionService = require("../../services/admin/occasion.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");

const getAllOccasions = asyncHandler(async (req, res) => {
  const result = await occasionService.getAllOccasions(req.query);
  res.status(200).json(new ApiResponse(200, result, MESSAGES.OCCASIONS_FETCHED));
});

const getOccasionById = asyncHandler(async (req, res) => {
  const occasion = await occasionService.getOccasionById(req.params.id);
  res.status(200).json(new ApiResponse(200, occasion, "Occasion fetched successfully"));
});

const createOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.createOccasion(req.body);
  res.status(201).json(new ApiResponse(201, occasion, MESSAGES.OCCASION_CREATED));
});

const updateOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.updateOccasion(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, occasion, MESSAGES.OCCASION_UPDATED));
});

const deleteOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.deleteOccasion(req.params.id);
  res.status(200).json(new ApiResponse(200, occasion, MESSAGES.OCCASION_DELETED));
});

module.exports = { getAllOccasions, getOccasionById, createOccasion, updateOccasion, deleteOccasion };
