import { createContext, useState, useEffect, useContext } from "react";

const CartContext = createContext();

const VALID_COUPONS = {
  BDAY15: 15,
  WELCOME10: 10,
  SWEET20: 20
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cake_cart_items");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart items", e);
      }
    }
  }, []);

  // Save cart to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem("cake_cart_items", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      // Find if item with same configuration already exists
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.cakeId === newItem.cakeId &&
          item.flavor === newItem.flavor &&
          item.weight === newItem.weight &&
          item.isEggless === newItem.isEggless &&
          item.cakeMessage === newItem.cakeMessage
      );

      if (existingIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += newItem.quantity || 1;
        return updatedItems;
      }

      // Generate a unique ID for this cart line item
      const id = `${newItem.cakeId}-${Date.now()}`;
      return [...prevItems, { id, ...newItem }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem("cake_cart_items");
  };

  const applyCoupon = (code) => {
    const upperCode = code.trim().toUpperCase();
    if (VALID_COUPONS[upperCode] !== undefined) {
      const discountPercent = VALID_COUPONS[upperCode];
      setCoupon({ code: upperCode, discountPercent });
      return { success: true, discountPercent };
    }
    return { success: false, message: "Invalid Coupon Code" };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price);
      const discountAmount = item.discount ? (price * item.discount) / 100 : 0;
      const finalPrice = price - discountAmount;
      return acc + finalPrice * item.quantity;
    }, 0);
  };

  const getDiscountAmount = () => {
    if (!coupon) return 0;
    return (getSubtotal() * coupon.discountPercent) / 100;
  };

  const getDeliveryCharge = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal > 80 ? 0 : 5.99; // Free delivery over $80
  };

  const getGrandTotal = () => {
    return getSubtotal() - getDiscountAmount() + getDeliveryCharge();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        subtotal: getSubtotal(),
        discountAmount: getDiscountAmount(),
        deliveryCharge: getDeliveryCharge(),
        grandTotal: getGrandTotal()
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
