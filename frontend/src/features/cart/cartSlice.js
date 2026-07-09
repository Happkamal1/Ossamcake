import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartApi } from "./cartApi";

// Helper: Map MongoDB cart structure to the frontend UI expectations
const mapCartItems = (items = []) => {
  return items.map((item) => ({
    id: item._id, // MongoDB cart item ID
    cakeId: item.cake?._id || item.cake,
    name: item.cake?.name || "",
    image: item.cake?.images?.[0] || item.cake?.thumbnail || item.cake?.image || "/images/cakes/custom-birthday.jpg",
    flavor: item.flavor || "Classic",
    weight: item.size || "1 kg",
    isEggless: item.isEggless || false,
    cakeMessage: item.cakeMessage || "",
    photoUpload: item.photoUrl || null,
    price: item.unitPrice,
    discount: item.discount || 0,
    quantity: item.quantity,
    deliveryDate: item.deliveryDate ? new Date(item.deliveryDate).toISOString().split("T")[0] : null,
    deliveryTimeSlot: item.deliveryTimeSlot || "",
    addons: item.addons || {},
  }));
};

// Async Thunks
export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await cartApi.getCart();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch cart");
  }
});

export const addToCartAsync = createAsyncThunk("cart/add", async (itemData, { rejectWithValue }) => {
  try {
    // Transform frontend item keys to backend keys
    const backendData = {
      cakeId: itemData.cakeId,
      flavor: itemData.flavor,
      size: itemData.weight,
      quantity: itemData.quantity || 1,
      unitPrice: itemData.price,
      discount: itemData.discount || 0,
      isEggless: itemData.isEggless || false,
      cakeMessage: itemData.cakeMessage || "",
      photoUrl: itemData.photoUpload || "",
      deliveryDate: itemData.deliveryDate,
      deliveryTimeSlot: itemData.deliveryTimeSlot,
      addons: itemData.addons || {},
    };
    const res = await cartApi.addToCart(backendData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to add item to cart");
  }
});

export const updateQuantityAsync = createAsyncThunk("cart/updateQty", async ({ id, newQty }, { rejectWithValue }) => {
  try {
    const res = await cartApi.updateQuantity(id, newQty);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update quantity");
  }
});

export const removeFromCartAsync = createAsyncThunk("cart/remove", async (itemId, { rejectWithValue }) => {
  try {
    const res = await cartApi.removeFromCart(itemId);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to remove item");
  }
});

export const clearCartAsync = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try {
    await cartApi.clearCart();
    return null;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to clear cart");
  }
});

export const applyCouponAsync = createAsyncThunk("cart/applyCoupon", async ({ code, subtotal }, { rejectWithValue }) => {
  try {
    const res = await cartApi.applyCoupon(code, subtotal);
    return res.data.data; // { coupon, discountAmount }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to apply coupon");
  }
});

const initialState = {
  cartItems: [],
  coupon: null,
  couponDiscount: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Reducers to clear errors or sync auth state logout
    resetCartState(state) {
      state.cartItems = [];
      state.coupon = null;
      state.couponDiscount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // Fetch Cart
      .addCase(fetchCart.pending, pending)
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = mapCartItems(action.payload?.items);
        state.coupon = action.payload?.appliedCoupon ? { code: action.payload.appliedCoupon } : null;
        state.couponDiscount = action.payload?.couponDiscount || 0;
      })
      .addCase(fetchCart.rejected, rejected)

      // Add to Cart
      .addCase(addToCartAsync.pending, pending)
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = mapCartItems(action.payload?.items);
        state.coupon = action.payload?.appliedCoupon ? { code: action.payload.appliedCoupon } : null;
        state.couponDiscount = action.payload?.couponDiscount || 0;
      })
      .addCase(addToCartAsync.rejected, rejected)

      // Update Qty
      .addCase(updateQuantityAsync.pending, pending)
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = mapCartItems(action.payload?.items);
        state.coupon = action.payload?.appliedCoupon ? { code: action.payload.appliedCoupon } : null;
        state.couponDiscount = action.payload?.couponDiscount || 0;
      })
      .addCase(updateQuantityAsync.rejected, rejected)

      // Remove from Cart
      .addCase(removeFromCartAsync.pending, pending)
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = mapCartItems(action.payload?.items);
        state.coupon = action.payload?.appliedCoupon ? { code: action.payload.appliedCoupon } : null;
        state.couponDiscount = action.payload?.couponDiscount || 0;
      })
      .addCase(removeFromCartAsync.rejected, rejected)

      // Clear Cart
      .addCase(clearCartAsync.pending, pending)
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.loading = false;
        state.cartItems = [];
        state.coupon = null;
        state.couponDiscount = 0;
      })
      .addCase(clearCartAsync.rejected, rejected)

      // Apply Coupon
      .addCase(applyCouponAsync.pending, pending)
      .addCase(applyCouponAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = { code: action.payload.coupon.code };
        state.couponDiscount = action.payload.discountAmount || 0;
      })
      .addCase(applyCouponAsync.rejected, rejected);
  },
});

export const { resetCartState } = cartSlice.actions;

// ---- Selectors ----
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCoupon = (state) => state.cart.coupon;
export const selectCouponDiscount = (state) => state.cart.couponDiscount;

export const selectSubtotal = (state) =>
  state.cart.cartItems.reduce((acc, item) => {
    const price = parseFloat(item.price);
    const discountAmt = item.discount ? (price * item.discount) / 100 : 0;
    return acc + (price - discountAmt) * item.quantity;
  }, 0);

export const selectDiscountAmount = (state) => state.cart.couponDiscount;

export const selectDeliveryCharge = (state) => {
  const subtotal = selectSubtotal(state);
  if (subtotal === 0) return 0;
  return subtotal > 80 ? 0 : 5.99;
};

export const selectGrandTotal = (state) => {
  const subtotal = selectSubtotal(state);
  const discount = selectDiscountAmount(state);
  const delivery = selectDeliveryCharge(state);
  return Math.max(0, subtotal - discount + delivery);
};

export default cartSlice.reducer;
