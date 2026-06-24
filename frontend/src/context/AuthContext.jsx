import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

const MOCK_USER = {
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@example.com",
  phone: "+1 (555) 234-5678",
  address: "123 Maple Street, New York, NY 10001",
  birthdate: "1990-05-15",
  bio: "Cake lover since forever! I especially enjoy trying new flavors.",
  avatar: "/placeholder.svg?height=96&width=96",
  loyaltyPoints: 450
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("cake_auth_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error loading user", e);
      }
    } else {
      // Seed with initial mock user by default for ease of testing
      setUser(MOCK_USER);
      localStorage.setItem("cake_auth_user", JSON.stringify(MOCK_USER));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    // Simulating authentication delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    const loggedUser = {
      ...MOCK_USER,
      email: email,
      firstName: email.split("@")[0] || "Sarah",
      lastName: "User"
    };
    setUser(loggedUser);
    localStorage.setItem("cake_auth_user", JSON.stringify(loggedUser));
    setLoading(false);
    return { success: true };
  };

  const signup = async (firstName, lastName, email, password) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newUser = {
      ...MOCK_USER,
      firstName,
      lastName,
      email,
      loyaltyPoints: 100 // new signup bonus!
    };
    setUser(newUser);
    localStorage.setItem("cake_auth_user", JSON.stringify(newUser));
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cake_auth_user");
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("cake_auth_user", JSON.stringify(updatedUser));
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
