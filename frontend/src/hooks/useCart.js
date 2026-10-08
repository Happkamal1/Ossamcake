import { useSelector, useDispatch } from "react-redux";
import {
  addToCartAsync,
  removeFromCartAsync,
  updateQuantityAsync,
  clearCartAsync,
  applyCouponAsync,
  selectCartItems,
  selectCoupon,
  selectSubtotal,
  selectDiscountAmount,
  selectDeliveryCharge,
  selectTaxAmount,
  selectGrandTotal,
  fetchCart
} from "@/features/cart/cartSlice";

export function useCart() {
  const dispatch = useDispatch();

  const cartItems = useSelector(selectCartItems);
  const coupon = useSelector(selectCoupon);
  const subtotal = useSelector(selectSubtotal);
  const discountAmount = useSelector(selectDiscountAmount);
  const deliveryCharge = useSelector(selectDeliveryCharge);
  const taxAmount = useSelector(selectTaxAmount);
  const grandTotal = useSelector(selectGrandTotal);

  const getCart = () => dispatch(fetchCart());
  const addToCart = (newItem) => dispatch(addToCartAsync(newItem));
  const removeFromCart = (id) => dispatch(removeFromCartAsync(id));
  const updateQuantity = (id, newQty) => dispatch(updateQuantityAsync({ id, newQty }));
  const clearCart = () => dispatch(clearCartAsync());
  
  const applyCoupon = async (code) => {
    try {
      const res = await dispatch(applyCouponAsync({ code, subtotal })).unwrap();
      return { success: true, discountAmount: res.discountAmount };
    } catch (err) {
      return { success: false, message: err || "Invalid Coupon Code" };
    }
  };
  
  const removeCoupon = () => dispatch(applyCouponAsync({ code: "", subtotal: 0 }));

  return {
    cartItems,
    coupon,
    subtotal,
    discountAmount,
    deliveryCharge,
    taxAmount,
    grandTotal,
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
  };
}
