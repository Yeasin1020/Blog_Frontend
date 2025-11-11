/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Menu,
  ShoppingCart,
  Zap,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
// নিশ্চিত করুন যে AdminSidebar কম্পোনেন্টটি সঠিকভাবে ইমপোর্ট করা হয়েছে
import UserSidebar from "@/app/components/adminsidbar";

// --- Types for Local Storage Data ---
interface User {
  id: string;
  name: string;
  email: string;
  role: "Customer" | "Admin" | "Guest";
  isApproved?: boolean;
}

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []); // একবার লোড হবে

  // 2. Auth এবং Authorization চেক (Admin-এর জন্য আপডেট করা হয়েছে)
  useEffect(() => {
    if (!isLoading && hydrated) {
      if (!isAuthenticated || !currentUser) {
        router.replace("/login");
        return;
      }

      if (currentUser.role !== "Admin") {
        router.replace("/dashboard");
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
  if (!isAuthenticated || currentUser?.role !== "Admin") {
    return null;
  }

  // --- 4. Main Admin Dashboard Layout (Auth Passed as Admin) ---

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
          className="flex-shrink-0 text-2xl font-extrabold text-red-500 transition"
        >
          <Zap className="w-6 h-6 inline mr-1" />
          Admin
        </Link>
        <div className="w-6 h-6"></div>
      </div>

      {/* 2. Admin Sidebar (Responsive) */}
      {/* Mobile: Overlay (controlled by state). Desktop (md+): Fixed and always visible. */}
      <UserSidebar
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 w-full md:ml-64">
        {/* 3a. Desktop Top Navbar (Visible ONLY on md+ screens) */}
        <div className="hidden md:flex sticky top-0 left-0 w-full h-16 bg-zinc-900 border-b border-zinc-700 items-center justify-between px-6 z-30 shadow-2xl">
          <h1 className="text-xl font-bold text-gray-200">
            {/* Dynamically display current page title if needed */}
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-red-400 flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              {currentUser?.name || "Admin User"}
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
                     min-h-[calc(100vh-64px)] overflow-x-hidden" // pt-4 ensures margin below desktop navbar
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
