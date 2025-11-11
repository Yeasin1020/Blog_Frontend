// app/components/NavbarClientWrapper.tsx

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";

// --- Type Definitions ---
interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: "Customer" | "Admin" | "Guest";
}

interface User {
  isLoggedIn: boolean;
  role: "Customer" | "Admin" | "Guest";
  name: string;
}

const defaultUserInfo: UserInfo = {
  id: "",
  name: "Guest",
  email: "",
  role: "Guest",
};

// --- Navbar Client Wrapper Component (State Management) ---
export default function NavbarClientWrapper() {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true); // ✅ New Loading State
  const router = useRouter();

  // 1. Check Local Storage and Hydrate State
  useEffect(() => {
    const checkAuthStatus = () => {
      const storedToken = localStorage.getItem("userToken");
      const storedInfo = localStorage.getItem("userInfo");

      if (storedToken && storedInfo) {
        try {
          const info = JSON.parse(storedInfo);
          setUserInfo({
            ...info,
            role: info.role || "Customer",
            name: info.name || "User",
            id: info.id,
            email: info.email,
          });
          setCartItemCount(3); // Example cart count
        } catch (e) {
          // Invalid data in storage
          console.error("Failed to parse user info:", e);
          localStorage.removeItem("userToken");
          localStorage.removeItem("userInfo");
          setUserInfo(defaultUserInfo);
        }
      }
      setIsLoading(false); // ✅ Local Storage check is complete
    };

    checkAuthStatus();

    // Add a small interval/listener to quickly pick up changes from /login or /signup
    // Since we are not using Context, the only way to pick up changes is on mount or manual reload/router.refresh
    // For production, the context is better, but this handles the mount state fix.
  }, []);

  // 2. Login Handler (Redirects to /login, which updates Local Storage)
  const handleLogin = useCallback(() => {
    // This is called when the user clicks 'Login/Sign Up' on the Navbar
    router.push("/login");
  }, [router]);

  // 3. Logout Handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    setUserInfo(defaultUserInfo);
    setCartItemCount(0);
    router.push("/"); // Redirect to home page
  }, [router]);

  // Construct the simplified 'user' prop required by the Navbar component
  const userProp: User = {
    isLoggedIn: !!userInfo.id,
    role: userInfo.role,
    name: userInfo.name,
  };

  // Show a minimal placeholder while loading state (Local Storage is being checked)
  if (isLoading) {
    // Prevent flashing Login/Signup buttons by delaying the render
    return (
      <nav className="bg-white sticky top-0 z-50 shadow-lg border-b border-gray-100 h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
        <div className="flex items-center space-x-4">
          <div className="h-6 w-6 bg-gray-200 animate-pulse rounded-full"></div>
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-full hidden sm:block"></div>
        </div>
      </nav>
    );
  }

  return (
    <Navbar
      user={userProp}
      onLogin={handleLogin}
      onLogout={handleLogout}
      cartItemCount={cartItemCount}
    />
  );
}

// Export NavbarClientWrapper as the default export for use in layout.tsx
// (Ensure your layout.tsx imports this as 'Navbar' or 'NavbarWrapper')
