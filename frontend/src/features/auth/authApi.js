import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

const API = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  withCredentials: true,
});

const USER_API = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  withCredentials: true,
});

export const authApi = {
  register: (data) => API.post('/register', data),
  verifyEmail: (data) => API.post('/verify-email', data),
  resendOtp: (data) => API.post('/resend-otp', data),
  login: (data) => API.post('/login', data),
  forgotPassword: (data) => API.post('/forgot-password', data),
  verifyResetOtp: (data) => API.post('/verify-reset-otp', data),
  resetPassword: (data) => API.post('/reset-password', data),
  logout: () => API.post('/logout'),
  getMe: () => API.get('/me'),
  updateProfile: (data) => API.put('/profile', data),
  updatePassword: (data) => API.put('/update-password', data),
  addAddress: (data) => API.post('/addresses', data),
  deleteAddress: (id) => API.delete(`/addresses/${id}`),
  googleLogin: (idToken) => API.post('/google', { idToken }),
  toggle2FA: (data) => API.post('/2fa/toggle', data),
  verify2FALogin: (data) => API.post('/2fa/login-verify', data),
  getPasskeyRegisterOptions: () => API.get('/passkey/register-options'),
  verifyPasskeyRegister: (data) => API.post('/passkey/register-verify', data),
  getPasskeyLoginOptions: (data) => API.post('/passkey/login-options', data),
  verifyPasskeyLogin: (data) => API.post('/passkey/login-verify', data),
  deletePasskey: (id) => API.delete(`/passkey/${id}`),
  getPasskeySignupOptions: (data) => API.post('/passkey/signup-options', data),
  verifyPasskeySignup: (data) => API.post('/passkey/signup-verify', data),
};

export const userApi = {
  getProfile: () => USER_API.get('/profile'),
  updateProfile: (data) => USER_API.patch('/profile', data),
  uploadAvatar: (formData) => USER_API.post('/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  changePassword: (data) => USER_API.patch('/change-password', data),
  getSecurityInfo: () => USER_API.get('/security'),
  toggle2FA: (enable) => USER_API.patch('/security/2fa', { enable }),
  getPasskeys: () => USER_API.get('/passkeys'),
  deletePasskey: (id) => USER_API.delete(`/passkeys/${id}`),
  getAddresses: () => USER_API.get('/addresses'),
  createAddress: (data) => USER_API.post('/addresses', data),
  updateAddress: (id, data) => USER_API.patch(`/addresses/${id}`, data),
  deleteAddress: (id) => USER_API.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => USER_API.patch(`/addresses/${id}/default`),
};
