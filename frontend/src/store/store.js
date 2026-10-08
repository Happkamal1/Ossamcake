import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import authReducer from '../features/auth/authSlice';
import adminReducer from '../features/admin/adminSlice';
import productReducer from '../features/products/productSlice';
import reviewReducer from '../features/reviews/reviewSlice';
import bannerReducer from '../features/banners/bannerSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import siteSettingsReducer from '../features/siteSettings/siteSettingsSlice';
import faqReducer from '../features/faqs/faqSlice';
import testimonialReducer from '../features/testimonials/testimonialSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    admin: adminReducer,
    products: productReducer,
    reviews: reviewReducer,
    banners: bannerReducer,
    notifications: notificationReducer,
    siteSettings: siteSettingsReducer,
    faqs: faqReducer,
    testimonials: testimonialReducer,
  },
});


