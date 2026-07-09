import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe, loginUser, logoutUser, registerUser } from "@/features/auth/authSlice";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  const login = async (email, password) => {
    const res = await dispatch(loginUser({ email, password }));
    if (res.meta.requestStatus === 'rejected') {
      throw new Error(res.payload?.message || res.payload || "Login failed");
    }
    return { success: true, user: res.payload.data.user };
  };

  const signup = async (firstName, lastName, email, password) => {
    const name = `${firstName} ${lastName}`;
    const res = await dispatch(registerUser({ name, email, password }));
    if (res.meta.requestStatus === 'rejected') {
      throw new Error(res.payload || "Registration failed");
    }
    return { success: true };
  };

  const logout = async () => {
    await dispatch(logoutUser());
  };

  const updateProfile = () => {
    // Optional placeholder to match context shape if needed
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
