/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  LogOut,
  X,
  ChevronDown,
  ChevronUp,
  ListOrdered,
  Heart, // Wishlist
  User as UserIcon,
  ShoppingBag,
  ShoppingCart,
  MapPin, // Addresses
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

// --- Custom Base Color (Consistent with Layout) ---
const PRIMARY_COLOR = "#155DFC"; // Base color for Customer UI

// ✅ CustomerSidebarProps
interface CustomerSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userRole?: string; // Optional prop to ensure type safety
}

// ----------------------------------------------------
// ✅ কাস্টমার মেনু স্ট্রাকচার
// ----------------------------------------------------
const sidebarGroups = [
  {
    title: "ACCOUNT MANAGEMENT",
    items: [
      {
        href: "/dashboard/customer",
        icon: UserIcon,
        label: "My Profile",
      },
      {
        label: "My Orders & History",
        icon: ListOrdered,
        isDropdown: true,
        defaultOpen: true,
        subItems: [
          { href: "/dashboard/customer/order-history", label: "Order History" },
          { href: "/dashboard/customer/returns", label: "Return Requests" },
        ],
      },
      { href: "/wishlist", icon: Heart, label: "My Wishlist" },
      { href: "/cart", icon: ShoppingCart, label: "Shopping Cart" },
    ],
  },
  {
    title: "SETTINGS & SUPPORT",
    items: [
      {
        href: "/dashboard/customer/addresses",
        icon: MapPin,
        label: "Saved Addresses",
      },
      {
        href: "/dashboard/customer/settings",
        icon: Settings,
        label: "Account Settings",
      },
      {
        href: "/contact",
        icon: ShoppingBag, // Using ShoppingBag as a generic icon for external links
        label: "Contact Support",
      },
    ],
  },
];

// ----------------------------------------------------
// ✅ SidebarItem কম্পোনেন্ট (AdminSidebar থেকে কপি করা)
// ----------------------------------------------------
const SidebarItem = ({
  item,
  currentPath,
  setIsOpen,
}: {
  item: any;
  currentPath: string;
  setIsOpen: (open: boolean) => void;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(
    item.defaultOpen || false
  );

  const isActive =
    item.href &&
    (currentPath === item.href || // Exact match
      (item.isDropdown &&
        item.subItems.some((sub: any) => currentPath.startsWith(sub.href))));

  const linkClass = (
    active: boolean
  ) => `flex items-center space-x-3 py-2 px-3 rounded-md transition-all duration-200 text-sm font-medium 
  ${
    active
      ? "text-white border border-blue-700/50" // ✅ অ্যাকটিভ স্টেট: বেস কালার ব্যবহার করে ব্যাকগ্রাউন্ড
      : "text-gray-400 hover:bg-zinc-800 hover:text-white"
  }`;

  const activeBgStyle = isActive ? { backgroundColor: PRIMARY_COLOR } : {};

  const iconClass = (active: boolean) =>
    active ? "text-white" : "text-gray-500 group-hover:text-white"; // White icon on active link

  if (item.isDropdown) {
    return (
      <div className="space-y-0.5 group">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`${linkClass(isActive)} w-full justify-between`}
          style={activeBgStyle}
          aria-expanded={isDropdownOpen}
        >
          <div className="flex items-center space-x-3">
            <item.icon
              className={`w-5 h-5 ${iconClass(isActive)} transition-colors`}
            />
            <span className="text-white">{item.label}</span>
          </div>

          {isDropdownOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-8 space-y-0.5 overflow-hidden"
          >
            {item.subItems.map((sub: any) => (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 py-1.5 px-3 rounded-md text-sm transition-colors duration-200 
                ${
                  currentPath.startsWith(sub.href)
                    ? "font-medium text-white" // Active sub-item text
                    : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                }`}
                style={
                  currentPath.startsWith(sub.href)
                    ? { backgroundColor: "rgba(255,255,255,0.1)" }
                    : {}
                } // Light hover bg for sub-item
              >
                {sub.icon && <sub.icon className="w-4 h-4 text-red-500" />}{" "}
                <span>{sub.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={() => setIsOpen(false)}
      className={`${linkClass(currentPath === item.href)} group`}
      style={isActive ? activeBgStyle : {}}
    >
      <item.icon
        className={`w-5 h-5 transition-colors ${iconClass(
          currentPath === item.href
        )}`}
      />
      <span className="text-white">{item.label}</span>
    </Link>
  );
};

// ----------------------------------------------------
// ✅ SidebarContent কম্পোনেন্ট
// ----------------------------------------------------
const SidebarContent = ({
  pathname,
  handleLogout,
  setIsOpen,
}: {
  pathname: string;
  handleLogout: () => void;
  setIsOpen: (open: boolean) => void;
}) => (
  <div className="flex flex-col h-full bg-zinc-950">
    {/* Sidebar Header/Close Button (E-Mart Branding) */}
    <div className="flex items-center justify-between h-16 border-b border-zinc-800 px-4">
      <Link
        href="/"
        className="flex items-center space-x-2 text-2xl font-extrabold transition"
        style={{ color: PRIMARY_COLOR }}
      >
        <ShoppingCart className="w-6 h-6" /> <span>E-Mart</span>
      </Link>

      <button
        onClick={() => setIsOpen(false)}
        className="md:hidden text-gray-500 hover:text-white p-1 rounded-md transition-colors"
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
    {/* নেভিগেশন লিঙ্কস */}
    <div className="flex-1 space-y-4 p-4 pt-6 overflow-y-auto custom-scrollbar">
      {sidebarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider ml-3 mb-2">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map((item: any, itemIndex) => (
              <SidebarItem
                key={itemIndex}
                item={item}
                currentPath={pathname}
                setIsOpen={setIsOpen}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
    {/* বটম সেকশন (Fixed Logo/Info) */}
    <div className="p-4 border-t border-zinc-800 mt-auto flex flex-col space-y-3">
      {/* লোগো সেকশন */}
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
          <UserIcon className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
        </div>

        <div>
          <p className="font-semibold text-white">E-Mart Customer</p>
          <p className="text-xs text-zinc-500">Shop Smarter</p>
        </div>
      </div>
      {/* লগআউট বাটন (স্লিম) */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-red-400 hover:bg-zinc-800 transition-colors duration-200 font-medium group"
      >
        <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-400" />
        <span className="text-white group-hover:text-red-400">Logout</span>
      </button>
    </div>
  </div>
);

// ✅ CustomerSidebar কম্পোনেন্ট
export default function UserSidebar({
  isOpen,
  setIsOpen,
}: CustomerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    setIsOpen(false);
    toast.success("Logged out successfully");
    router.replace("/login"); // Redirect to login after customer logout
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-zinc-950 border-r border-zinc-800 hidden md:flex flex-col z-40 shadow-xl">
        <SidebarContent
          pathname={pathname}
          handleLogout={handleLogout}
          setIsOpen={setIsOpen}
        />
      </nav>
      {/* Mobile Off-canvas Sidebar & Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-zinc-950 shadow-2xl md:hidden z-50"
          >
            <SidebarContent
              pathname={pathname}
              handleLogout={handleLogout}
              setIsOpen={setIsOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 md:hidden z-40"
          ></motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
