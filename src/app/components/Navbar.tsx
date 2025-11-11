"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  LogOut,
  LogIn,
  LayoutDashboard,
  Search,
  ChevronDown,
  ArrowLeft,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Custom Base Color (155DFC) ---
const PRIMARY_COLOR = "#155DFC";

// --- Typescript Interfaces ---
interface NavLink {
  name: string;
  href: string;
}
interface Category {
  name: string;
  href: string;
}
interface User {
  isLoggedIn: boolean;
  role: "Customer" | "Admin" | "Guest";
  name: string;
}
interface NavbarProps {
  user: User;
  onLogin: () => void;
  onLogout: () => void;
  cartItemCount: number;
}

// --- Navigation Links and Categories ---
const mainLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/products" },
  { name: "Order Tracking", href: "/order-tracking" },
  { name: "Contact", href: "/contact" },
];

const categories: Category[] = [
  { name: "Electronics", href: "/products/electronics" },
  { name: "Apparel & Fashion", href: "/products/fashion" },
  { name: "Health & Beauty", href: "/products/health" },
  { name: "Home Appliances", href: "/products/home" },
];

// --- Local Storage Helpers ---
const loadCartCount = () => {
  if (typeof window === "undefined") return 0;
  try {
    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    return cartItems.reduce(
      (total: number, item: { quantity: number }) => total + item.quantity,
      0
    );
  } catch {
    return 0;
  }
};

const loadWishlistCount = () => {
  if (typeof window === "undefined") return 0;
  try {
    const wishlistItems = JSON.parse(
      localStorage.getItem("wishlistItems") || "[]"
    );
    return wishlistItems.length;
  } catch {
    return 0;
  }
};

// --- Main Navbar Component ---
const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    // 1. Body Overflow
    if (isSidebarOpen || isMobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // 2. Initial Load & Storage Listener Setup
    const updateCounts = () => {
      setCartCount(loadCartCount());
      setWishlistCount(loadWishlistCount());
    };

    updateCounts(); // Initial load

    window.addEventListener("storage", updateCounts);
    window.addEventListener("localStorageChange", updateCounts);

    return () => {
      window.removeEventListener("storage", updateCounts);
      window.removeEventListener("localStorageChange", updateCounts);
    };
  }, [isSidebarOpen, isMobileSearchOpen]);

  // Determines the correct dashboard route
  const getDashboardLink = (role: User["role"]) => {
    if (user.name === "Guest" || user.role === "Guest") return "/login";
    switch (role) {
      case "Admin":
        return "/dashboard/admin";
      case "Customer":
        return "/dashboard/customer";
      default:
        return "/user/profile";
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(searchQuery)}`);
      if (isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      }
    }
  };

  // --- Render Functions for Auth Buttons (Desktop Only) ---
  const renderAuthButtonsDesktop = () => {
    const displayName = user.isLoggedIn
      ? user.role === "Admin"
        ? "Admin"
        : user.name.split(" ")[0]
      : "Guest";

    if (user?.isLoggedIn) {
      return (
        <div className="hidden sm:flex items-center space-x-3">
          {/* Dashboard Link (Desktop) */}
          <Link
            href={getDashboardLink(user.role)}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-full hover:opacity-90 transition duration-150 shadow-md"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            <LayoutDashboard className="w-4 h-4 mr-1" />
            <span>{displayName}&apos;s Dashboard</span>
          </Link>
          {/* Logout Button (Desktop) */}
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-1.5 text-xs font-medium border rounded-full hover:bg-gray-50 transition duration-150 shadow-sm"
            style={{
              color: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              backgroundColor: "white",
            }}
          >
            <LogOut className="w-4 h-4 mr-1" style={{ color: PRIMARY_COLOR }} />
            <span>Logout</span>
          </button>
        </div>
      );
    } else {
      return (
        <div className="hidden sm:flex items-center space-x-2">
          <Link
            href="/login"
            onClick={onLogin}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-full hover:opacity-90 transition duration-150 shadow-md"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            <LogIn className="w-4 h-4 mr-1" />
            <span>Login / Sign Up</span>
          </Link>
        </div>
      );
    }
  };

  // --- Render Functions for Mobile Search Icon ---
  const renderMobileSearchIcon = () => {
    return (
      <button
        type="button"
        className="p-2 text-gray-600 hover:opacity-80 transition duration-150 sm:hidden"
        aria-label="Search"
        onClick={handleMobileSearchToggle}
        style={{ color: PRIMARY_COLOR }}
      >
        <Search className="w-5 h-5" />
      </button>
    );
  };

  // --- Render Functions for Cart Icon ---
  const renderCartIcon = () => {
    return (
      <Link
        href="/cart"
        className="p-2 text-gray-600 hover:opacity-80 transition duration-150 relative"
        style={{ color: PRIMARY_COLOR }}
      >
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[18px]">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>
    );
  };

  // --- Render Functions for Wishlist Icon ---
  const renderWishlistIcon = () => {
    return (
      <Link
        href="/wishlist"
        className="p-2 text-gray-600 hover:opacity-80 transition duration-150 relative"
        style={{ color: PRIMARY_COLOR }}
      >
        <Heart className="w-5 h-5" />
        {wishlistCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[18px]">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* 1. Mobile Full-Screen Search Modal */}
      <div
        className={`fixed top-0 left-0 h-16 w-full bg-white z-[60] shadow-lg transition-transform duration-300 ${
          isMobileSearchOpen ? "translate-y-0" : "-translate-y-full"
        } sm:hidden`}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center h-full px-4 space-x-2"
        >
          <button
            type="button"
            onClick={handleMobileSearchToggle}
            className="p-2 text-gray-600"
            aria-label="Close search"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 border border-gray-300 rounded-full focus:outline-none transition duration-150 shadow-sm focus:border-blue-500"
              style={{ borderColor: PRIMARY_COLOR }}
              autoFocus={isMobileSearchOpen}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </form>
      </div>

      {/* 2. Main Navbar */}
      <nav className="bg-white sticky top-0 z-50 shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* --- Top Bar (Logo, Search, Actions) --- */}
          <div className="flex justify-between items-center h-16">
            {/* 1. Left (Logo & Hamburger) */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleSidebarToggle}
                className="p-2 text-gray-500 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg lg:hidden"
                aria-label="Toggle menu"
                style={{ color: PRIMARY_COLOR }}
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              <Link
                href="/"
                className="flex-shrink-0 text-xl font-extrabold hover:opacity-90 transition"
                style={{ color: PRIMARY_COLOR }}
              >
                <ShoppingCart
                  className="w-5 h-5 inline mr-1"
                  style={{ color: PRIMARY_COLOR }}
                />
                E-Mart
              </Link>
            </div>
            {/* 2. Center (Search Bar - Desktop Only) */}
            <div className="hidden lg:block flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 border border-gray-300 rounded-full focus:outline-none transition duration-150 shadow-sm focus:border-blue-500"
                  style={{ borderColor: PRIMARY_COLOR }}
                />

                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
            </div>
            {/* 3. Right (Auth & Cart & Mobile Search) */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Icon (Opens the modal) */}
              {renderMobileSearchIcon()}

              {/* Wishlist Icon (New addition) */}
              {renderWishlistIcon()}

              {/* Cart Icon (Always visible) */}
              {renderCartIcon()}

              {/* Authentication Buttons (Desktop Only) */}
              {renderAuthButtonsDesktop()}
            </div>
          </div>
        </div>
        {/* --- Bottom Category Bar (Desktop Only) --- */}
        <div
          className="hidden lg:block"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center space-x-8">
            {/* Category Dropdown/Link */}
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              onMouseEnter={() => setIsCategoryOpen(true)} // Open on hover
              className="flex items-center text-sm font-bold text-white hover:opacity-90 px-3 py-1 rounded transition duration-150"
              style={{
                backgroundColor: isCategoryOpen
                  ? "rgba(255,255,255,0.2)"
                  : "transparent",
              }}
            >
              Categories
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${
                  isCategoryOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {/* Main Links */}
            {mainLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-blue-100 hover:text-white transition duration-150"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        {/* Desktop Category Dropdown (Mega Menu Placeholder) */}
        {isCategoryOpen && (
          <div
            onMouseLeave={() => setIsCategoryOpen(false)} // Close on mouse leave
            className="absolute left-0 right-0 z-40 bg-white shadow-xl border-t border-gray-200"
          >
            <div className="max-w-7xl mx-auto px-8 py-4 grid grid-cols-4 gap-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition"
                  style={{ color: PRIMARY_COLOR }}
                  onClick={() => setIsCategoryOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/products"
                className="font-bold hover:opacity-80 text-sm"
                style={{ color: PRIMARY_COLOR }}
              >
                View All Categories &rarr;
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* --- Mobile Sidebar Drawer (Full Screen Overlay) --- */}
      <div
        className={`fixed top-0 left-0 h-full w-full bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleSidebarToggle}
      >
        <div
          className={`bg-white w-72 max-w-[80%] h-full shadow-2xl transform transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()} // Prevent closing on inner click
        >
          {/* Sidebar Header */}
          <div className="flex justify-between items-center h-16 px-4 border-b border-gray-200">
            <span
              className="text-xl font-bold"
              style={{ color: PRIMARY_COLOR }}
            >
              E-Mart Menu
            </span>
            <button
              onClick={handleSidebarToggle}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-64px)]">
            {/* User Auth/Profile Links (Mobile/Sidebar Only) */}
            <div className="space-y-2 border-b pb-4">
              {user?.isLoggedIn ? (
                <>
                  <Link
                    href={getDashboardLink(user.role)}
                    onClick={handleSidebarToggle}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition duration-150"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    <span className="truncate">
                      {user.role === "Admin" ? "Admin" : user.name}&apos;s
                      Dashboard
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      onLogout();
                      handleSidebarToggle();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 transition duration-150"
                    style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                  >
                    <LogOut
                      className="w-5 h-5 mr-3"
                      style={{ color: PRIMARY_COLOR }}
                    />
                    Logout
                  </button>
                </>
              ) : (
                // Logged Out: Show Login/Sign Up link
                <Link
                  href="/login"
                  onClick={() => {
                    onLogin(); // Call the prop function
                    handleSidebarToggle(); // Close sidebar
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition duration-150"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <LogIn className="w-5 h-5 mr-3" />
                  Login / Sign Up
                </Link>
              )}
            </div>
            {/* Main Navigation Links */}
            <div className="space-y-1 border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Menu
              </h3>

              {mainLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={handleSidebarToggle}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition duration-150"
                  style={{ color: "inherit" }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            {/* Category Links */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                All Categories
              </h3>

              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={handleSidebarToggle}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition duration-150"
                  style={{ color: "inherit" }}
                >
                  {category.name}
                </Link>
              ))}

              <Link
                href="/products"
                onClick={handleSidebarToggle}
                className="block text-center mt-3 pt-3 border-t font-bold hover:opacity-80"
                style={{ color: PRIMARY_COLOR }}
              >
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
