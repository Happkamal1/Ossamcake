const productService = require("../../services/admin/product.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const MESSAGES = require("../../constants/messages");

const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  res.status(200).json(new ApiResponse(200, result, MESSAGES.PRODUCTS_FETCHED));
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json(new ApiResponse(200, product, MESSAGES.PRODUCT_FETCHED));
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(new ApiResponse(201, product, MESSAGES.PRODUCT_CREATED));
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, product, MESSAGES.PRODUCT_UPDATED));
});

const softDeleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.softDeleteProduct(req.params.id);
  res.status(200).json(new ApiResponse(200, product, MESSAGES.PRODUCT_DELETED));
});

const hardDeleteProduct = asyncHandler(async (req, res) => {
  await productService.hardDeleteProduct(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Product permanently deleted"));
});

const toggleFlag = asyncHandler(async (req, res) => {
  const { flag, value } = req.body;
  const product = await productService.toggleFlag(req.params.id, flag, value);
  res.status(200).json(new ApiResponse(200, product, `${flag} updated successfully`));
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }
  
  const storageService = require("../../utils/storage.service");
  const result = await storageService.upload(req.file, "products");

  res.status(200).json(new ApiResponse(200, { url: result.url, publicId: result.publicId }, "Image uploaded successfully"));
});

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, softDeleteProduct, hardDeleteProduct, toggleFlag, uploadImage };
