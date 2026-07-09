const Address = require("../models/Address");
const ApiError = require("../utils/ApiError");

/**
 * Get all addresses of a user
 */
const getAddresses = async (userId) => {
  return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

/**
 * Create a new address for a user
 * Max limit: 10 addresses. Ensures single default address rule.
 */
const createAddress = async (userId, addressData) => {
  // Check maximum address count
  const addressCount = await Address.countDocuments({ user: userId });
  if (addressCount >= 10) {
    throw new ApiError(400, "Maximum of 10 saved addresses reached");
  }

  // If this is the first address, automatically make it the default address
  let isDefault = addressData.isDefault || false;
  if (addressCount === 0) {
    isDefault = true;
  }

  // If new address is set to default, clear default status of existing ones
  if (isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }

  const newAddress = await Address.create({
    ...addressData,
    user: userId,
    isDefault,
  });

  return newAddress;
};

/**
 * Update an existing address of a user
 * Ensures single default address rule.
 */
const updateAddress = async (userId, addressId, addressData) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const willBeDefault = addressData.isDefault !== undefined ? addressData.isDefault : address.isDefault;

  if (willBeDefault && !address.isDefault) {
    // Flipped to default, clear others
    await Address.updateMany({ user: userId }, { isDefault: false });
  }

  // Update fields
  const fields = [
    "fullName",
    "mobileNumber",
    "alternateMobile",
    "addressLine1",
    "addressLine2",
    "landmark",
    "city",
    "state",
    "country",
    "pincode",
    "addressType",
  ];

  fields.forEach((field) => {
    if (addressData[field] !== undefined) {
      address[field] = addressData[field];
    }
  });

  address.isDefault = willBeDefault;
  await address.save();

  return address;
};

/**
 * Delete a user's address
 * If deleted address was the default, set another address as default.
 */
const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const wasDefault = address.isDefault;
  await Address.deleteOne({ _id: addressId, user: userId });

  // If we deleted the default address, make the latest address default
  if (wasDefault) {
    const latestAddress = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
    if (latestAddress) {
      latestAddress.isDefault = true;
      await latestAddress.save();
    }
  }

  return true;
};

/**
 * Set an address as the default address
 */
const setDefaultAddress = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Unset all default addresses for user
  await Address.updateMany({ user: userId }, { isDefault: false });

  // Set selected address as default
  address.isDefault = true;
  await address.save();

  return address;
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
