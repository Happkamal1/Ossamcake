import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, userApi } from './authApi';

// Thunks
export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authApi.register(userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyEmail(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Verification failed');
  }
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.resendOtp(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
  }
});

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (idToken, { rejectWithValue }) => {
  try {
    const response = await authApi.googleLogin(idToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Google Login failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
  try {
    const response = await authApi.login(userData);
    return response.data;
  } catch (error) {
    // Pass custom metadata with status code if possible
    return rejectWithValue({
      message: error.response?.data?.message || 'Login failed',
      status: error.response?.status
    });
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.forgotPassword(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to send reset OTP');
  }
});

export const verifyResetOtp = createAsyncThunk('auth/verifyResetOtp', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyResetOtp(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Invalid or expired OTP');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.resetPassword(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getMe();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const response = await userApi.updateProfile(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (formData, { rejectWithValue }) => {
  try {
    const response = await userApi.uploadAvatar(formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
  }
});

export const updatePassword = createAsyncThunk('auth/updatePassword', async (data, { rejectWithValue }) => {
  try {
    const response = await userApi.changePassword(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to change password');
  }
});

export const fetchAddresses = createAsyncThunk('auth/fetchAddresses', async (_, { rejectWithValue }) => {
  try {
    const response = await userApi.getAddresses();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
  }
});

export const addAddress = createAsyncThunk('auth/addAddress', async (data, { rejectWithValue }) => {
  try {
    const response = await userApi.createAddress(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add address');
  }
});

export const updateAddress = createAsyncThunk('auth/updateAddress', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await userApi.updateAddress(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update address');
  }
});

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (id, { rejectWithValue }) => {
  try {
    const response = await userApi.deleteAddress(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
  }
});

export const setDefaultAddress = createAsyncThunk('auth/setDefaultAddress', async (id, { rejectWithValue }) => {
  try {
    const response = await userApi.setDefaultAddress(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to set default address');
  }
});

export const verify2FALogin = createAsyncThunk('auth/verify2FALogin', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.verify2FALogin(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '2FA login verification failed');
  }
});

export const toggle2FA = createAsyncThunk('auth/toggle2FA', async (data, { rejectWithValue }) => {
  try {
    const response = await userApi.toggle2FA(data.enable);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to toggle 2FA');
  }
});

export const getPasskeyRegisterOptions = createAsyncThunk('auth/getPasskeyRegisterOptions', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getPasskeyRegisterOptions();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch passkey registration options');
  }
});

export const verifyPasskeyRegister = createAsyncThunk('auth/verifyPasskeyRegister', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyPasskeyRegister(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to verify passkey registration');
  }
});

export const getPasskeyLoginOptions = createAsyncThunk('auth/getPasskeyLoginOptions', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.getPasskeyLoginOptions(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch passkey login options');
  }
});

export const verifyPasskeyLogin = createAsyncThunk('auth/verifyPasskeyLogin', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyPasskeyLogin(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to verify passkey login');
  }
});

export const deletePasskey = createAsyncThunk('auth/deletePasskey', async (id, { rejectWithValue }) => {
  try {
    const response = await userApi.deletePasskey(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete passkey');
  }
});


export const getPasskeySignupOptions = createAsyncThunk('auth/getPasskeySignupOptions', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.getPasskeySignupOptions(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch passkey signup options');
  }
});

export const verifyPasskeySignup = createAsyncThunk('auth/verifyPasskeySignup', async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyPasskeySignup(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to verify passkey signup');
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  tempEmail: null,
  isAuthModalOpen: false,
  currentAuthScreen: 'login', // 'login', 'register', 'verifyEmail', 'forgotPassword', 'verifyResetOtp', 'resetPassword'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTempEmail: (state, action) => {
      state.tempEmail = action.payload;
    },
    clearTempEmail: (state) => {
      state.tempEmail = null;
    },
    openAuthModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.currentAuthScreen = action.payload || 'login';
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    setAuthScreen: (state, action) => {
      state.currentAuthScreen = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data?.require2FA) {
          state.isAuthenticated = false;
          state.user = null;
        } else {
          state.isAuthenticated = true;
          state.user = action.payload.data.user;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
      })
      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Addresses
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload.data;
        }
      })
      // Add Address
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.user) {
          if (!state.user.addresses) state.user.addresses = [];
          state.user.addresses.push(action.payload.data);
        }
      })
      // Delete Address
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.user && state.user.addresses) {
          state.user.addresses = state.user.addresses.filter(a => a._id !== action.meta.arg);
        }
      })
      // Update Address
      .addCase(updateAddress.fulfilled, (state, action) => {
        if (state.user && state.user.addresses) {
          state.user.addresses = state.user.addresses.map(a => 
            a._id === action.payload.data._id ? action.payload.data : a
          );
        }
      })
      // Set Default Address
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        if (state.user && state.user.addresses) {
          state.user.addresses = state.user.addresses.map(a => ({
            ...a,
            isDefault: a._id === action.payload.data._id
          }));
        }
      })
      // 2FA Verification
      .addCase(verify2FALogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FALogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
      })
      .addCase(verify2FALogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle 2FA
      .addCase(toggle2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggle2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(toggle2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Passkey Register
      .addCase(verifyPasskeyRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPasskeyRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(verifyPasskeyRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Passkey Login
      .addCase(verifyPasskeyLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPasskeyLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
      })
      .addCase(verifyPasskeyLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Passkey
      .addCase(deletePasskey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePasskey.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(deletePasskey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Passkey Signup
      .addCase(verifyPasskeySignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPasskeySignup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
      })
      .addCase(verifyPasskeySignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setTempEmail, clearTempEmail, openAuthModal, closeAuthModal, setAuthScreen } = authSlice.actions;
export default authSlice.reducer;
