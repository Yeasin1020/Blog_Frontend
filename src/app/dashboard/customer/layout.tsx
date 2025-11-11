/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Menu,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import Link from "next/link";
import UserSidebar from "@/app/components/customersidebar";
// নিশ্চিত করুন যে UserSidebar কম্পোনেন্টটি সঠিকভাবে ইমপোর্ট করা হয়েছে

// --- Types for Local Storage Data ---
interface User {
  id: string;
  name: string;
  email: string;
  role: "Customer" | "Admin" | "Guest";
  isApproved?: boolean;
}

const CustomerDashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Custom Base Color for UI Consistency
  const PRIMARY_COLOR = "#155DFC";

  // 1. Local Storage থেকে ইউজার ডেটা লোড করা
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("userToken");
      const storedInfo = localStorage.getItem("userInfo");

      if (storedToken && storedInfo) {
        const userInfo: User = JSON.parse(storedInfo);

        setCurrentUser({ ...userInfo });
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
      setHydrated(true); // Local Storage চেক সম্পন্ন
    }
  }, []);

  // 2. Auth এবং Authorization চেক (Customer-এর জন্য)
  useEffect(() => {
    if (!isLoading && hydrated) {
      if (!isAuthenticated || !currentUser) {
        // যদি অথেন্টিকেট না হয়, লগইন পেজে পাঠান
        router.replace("/login");
        return;
      }

      if (currentUser.role !== "Customer") {
        // যদি রোল 'Customer' না হয়, তাকে সঠিক ড্যাশবোর্ডে পাঠান বা হোমপেজে
        // Admin হলে Admin Dashboard এ পাঠানো উচিত, বা এখানে সেফটি হিসেবে শুধু /dashboard
        const redirectPath =
          currentUser.role === "Admin" ? "/dashboard/admin" : "/user/profile";
        router.replace(redirectPath);
        return;
      }
    }
  }, [currentUser, isLoading, hydrated, isAuthenticated, router]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    setIsAuthenticated(false);
    setCurrentUser(null);
    router.replace("/login");
  };

  // --- 3. Loading UI ---
  if (isLoading || !hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  // Final Render Check: যদি Auth চেক fail করে কিন্তু useEffect এখনও রুট না করে, তবে null রিটার্ন করা
  if (!isAuthenticated || currentUser?.role !== "Customer") {
    return null;
  }

  // --- 4. Main Customer Dashboard Layout (Auth Passed as Customer) ---

  return (
    <div className="flex min-h-screen bg-zinc-900 text-white">
      {/* 1. Mobile Top Header & Menu Button (Visible ONLY on mobile) */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4 z-40 shadow-xl">
        {/* Toggle Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="text-gray-300 hover:bg-zinc-700 p-2 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Brand Name */}
        <Link
          href="/"
          className="flex-shrink-0 text-xl font-bold transition"
          style={{ color: PRIMARY_COLOR }}
        >
          <ShoppingCart className="w-5 h-5 inline mr-1" />
          Customer Panel
        </Link>
        <div className="w-6 h-6"></div>
      </div>

      {/* 2. Customer Sidebar (Responsive) */}
      {/* Ensure you have a UserSidebar component defined in the correct path */}
      <UserSidebar
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
        userRole={currentUser.role} // Pass role if sidebar needs to change links
      />

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 w-full md:ml-64">
        {/* 3a. Desktop Top Navbar (Visible ONLY on md+ screens) */}
        <div className="hidden md:flex sticky top-0 left-0 w-full h-16 bg-zinc-900 border-b border-zinc-700 items-center justify-between px-6 z-30 shadow-2xl">
          <h1 className="text-xl font-bold text-gray-200">
            {/* Display Customer Welcome Message */}
            Welcome, {currentUser?.name.split(" ")[0] || "Customer"}
          </h1>
          <div className="flex items-center space-x-4">
            <span
              className="text-sm font-medium flex items-center"
              style={{ color: PRIMARY_COLOR }}
            >
              <UserIcon className="w-4 h-4 mr-1" />
              {currentUser?.email || "Customer"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
              title="Logout"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* 3b. Main Content Area */}
        <main
          className="w-full 
                      pt-4 md:pt-4 
                      pb-10 
                      min-h-[calc(100vh-64px)] overflow-x-hidden"
        >
          {/* Mobile padding top pt-16 to clear the fixed mobile header */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboardLayout;
