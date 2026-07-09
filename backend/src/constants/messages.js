/**
 * Centralised API Response Messages
 * Eliminates duplicate string literals across controllers and services.
 */
const MESSAGES = {
  // Auth
  REGISTER_SUCCESS: "Registration successful. Please verify your email.",
  LOGIN_SUCCESS: "Logged in successfully.",
  LOGOUT_SUCCESS: "Logged out successfully.",
  EMAIL_VERIFIED: "Email verified successfully.",
  OTP_SENT: "OTP sent to your email.",
  PASSWORD_RESET: "Password has been reset successfully.",

  // User
  PROFILE_FETCHED: "Profile retrieved successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PASSWORD_CHANGED: "Password changed successfully.",
  AVATAR_UPLOADED: "Avatar uploaded successfully.",
  ADDRESS_CREATED: "Address created successfully.",
  ADDRESS_UPDATED: "Address updated successfully.",
  ADDRESS_DELETED: "Address deleted successfully.",

  // Products
  PRODUCTS_FETCHED: "Products fetched successfully.",
  PRODUCT_FETCHED: "Product fetched successfully.",
  PRODUCT_CREATED: "Product created successfully.",
  PRODUCT_UPDATED: "Product updated successfully.",
  PRODUCT_DELETED: "Product deleted successfully.",

  // Categories
  CATEGORIES_FETCHED: "Categories fetched successfully.",
  CATEGORY_CREATED: "Category created successfully.",
  CATEGORY_UPDATED: "Category updated successfully.",
  CATEGORY_DELETED: "Category deleted successfully.",

  // Occasions
  OCCASIONS_FETCHED: "Occasions fetched successfully.",
  OCCASION_CREATED: "Occasion created successfully.",
  OCCASION_UPDATED: "Occasion updated successfully.",
  OCCASION_DELETED: "Occasion deleted successfully.",

  // CakeTypes
  CAKE_TYPES_FETCHED: "Cake types fetched successfully.",
  CAKE_TYPE_CREATED: "Cake type created successfully.",
  CAKE_TYPE_UPDATED: "Cake type updated successfully.",
  CAKE_TYPE_DELETED: "Cake type deleted successfully.",

  // Orders
  ORDER_PLACED: "Order placed successfully.",
  ORDERS_FETCHED: "Orders fetched successfully.",
  ORDER_FETCHED: "Order fetched successfully.",
  ORDER_STATUS_UPDATED: "Order status updated successfully.",

  // Reviews
  REVIEWS_FETCHED: "Reviews fetched successfully.",
  REVIEW_CREATED: "Review submitted successfully.",
  REVIEW_UPDATED: "Review updated successfully.",
  REVIEW_DELETED: "Review deleted successfully.",

  // Coupons
  COUPON_VALID: "Coupon applied successfully.",
  COUPON_INVALID: "Coupon is invalid or expired.",
  COUPON_CREATED: "Coupon created successfully.",
  COUPON_UPDATED: "Coupon updated successfully.",
  COUPON_DELETED: "Coupon deleted successfully.",

  // Banners
  BANNERS_FETCHED: "Banners fetched successfully.",
  BANNER_CREATED: "Banner created successfully.",
  BANNER_UPDATED: "Banner updated successfully.",
  BANNER_DELETED: "Banner deleted successfully.",

  // Cart
  CART_FETCHED: "Cart fetched successfully.",
  ITEM_ADDED: "Item added to cart.",
  ITEM_UPDATED: "Cart item updated.",
  ITEM_REMOVED: "Item removed from cart.",
  CART_CLEARED: "Cart cleared.",

  // Wishlist
  WISHLIST_FETCHED: "Wishlist fetched successfully.",
  WISHLIST_TOGGLED: "Wishlist updated.",

  // Dashboard
  DASHBOARD_FETCHED: "Dashboard data fetched successfully.",

  // Admin Users
  USERS_FETCHED: "Users fetched successfully.",
  USER_UPDATED: "User updated successfully.",
  USER_SUSPENDED: "User has been suspended.",
  USER_ACTIVATED: "User has been activated.",

  // Generic
  NOT_FOUND: "Resource not found.",
  UNAUTHORIZED: "Not authorized, please login.",
  FORBIDDEN: "You do not have permission to perform this action.",
  SERVER_ERROR: "An internal server error occurred.",
  VALIDATION_FAILED: "Validation failed.",
};

module.exports = MESSAGES;
