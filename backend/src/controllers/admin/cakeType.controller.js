const cakeTypeService = require("../../services/admin/cakeType.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");

const getAllCakeTypes = asyncHandler(async (req, res) => {
  const result = await cakeTypeService.getAllCakeTypes(req.query);
  res.status(200).json(new ApiResponse(200, result, MESSAGES.CAKE_TYPES_FETCHED));
});

const getCakeTypeById = asyncHandler(async (req, res) => {
  const cakeType = await cakeTypeService.getCakeTypeById(req.params.id);
  res.status(200).json(new ApiResponse(200, cakeType, "CakeType fetched successfully"));
});

const createCakeType = asyncHandler(async (req, res) => {
  const cakeType = await cakeTypeService.createCakeType(req.body);
  res.status(201).json(new ApiResponse(201, cakeType, MESSAGES.CAKE_TYPE_CREATED));
});

const updateCakeType = asyncHandler(async (req, res) => {
  const cakeType = await cakeTypeService.updateCakeType(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, cakeType, MESSAGES.CAKE_TYPE_UPDATED));
});

const deleteCakeType = asyncHandler(async (req, res) => {
  const cakeType = await cakeTypeService.deleteCakeType(req.params.id);
  res.status(200).json(new ApiResponse(200, cakeType, MESSAGES.CAKE_TYPE_DELETED));
});

module.exports = { getAllCakeTypes, getCakeTypeById, createCakeType, updateCakeType, deleteCakeType };
