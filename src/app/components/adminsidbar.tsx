/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  ShoppingBag,
  ListOrdered,
  BarChart3,
  ShoppingCart,
  BellRing,
  DollarSign,
  Zap,
  PlusCircle, // Added for "Add New Product"
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

// ✅ AdminSidebarProps
interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// ----------------------------------------------------
// ✅ Admin মেনু স্ট্রাকচার (Add Product যোগ করা হয়েছে)
// ----------------------------------------------------
const sidebarGroups = [
  {
    title: "MANAGEMENT",
    items: [
      {
        href: "/dashboard/admin",
        icon: LayoutDashboard,
        label: "Admin Dashboard",
      },
      {
        label: "Products & Catalog",
        icon: ShoppingBag,
        isDropdown: true,
        defaultOpen: true,
        subItems: [
          {
            href: "/dashboard/admin/addProduct",
            label: "Add New Product",
            icon: PlusCircle,
          }, // ✅ New Item
          { href: "/dashboard/admin/all-products", label: "All Products" },
          { href: "/dashboard/admin/categories", label: "Categories" },
          { href: "/dashboard/admin/inventory", label: "Inventory" },
        ],
      },
      {
        label: "Orders & Shipping",
        icon: ListOrdered,
        isDropdown: true,
        subItems: [
          { href: "/dashboard/admin/orders", label: "New Orders" },
          { href: "/dashboard/admin/returns", label: "Returns/Refunds" },
          { href: "/dashboard/admin/shipping", label: "Shipping Zones" },
        ],
      },
      { href: "/dashboard/admin/users", icon: Users, label: "User Management" },
    ],
  },
  {
    title: "ANALYTICS & FINANCE",
    items: [
      {
        href: "/dashboard/admin/reports",
        icon: BarChart3,
        label: "Sales Reports",
      },
      {
        href: "/dashboard/admin/finance",
        icon: DollarSign,
        label: "Transactions",
      },
    ],
  },
  {
    title: "TOOLS",
    items: [
      {
        href: "/dashboard/admin/notifications",
        icon: BellRing,
        label: "Notifications",
      },
      {
        href: "/dashboard/admin/settings",
        icon: Settings,
        label: "General Settings",
      },
    ],
  },
];

// ----------------------------------------------------
// ✅ SidebarItem কম্পোনেন্ট (স্লিম ও মডার্ন ডিজাইন)
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
    (currentPath.startsWith(item.href) ||
      (item.isDropdown &&
        item.subItems.some((sub: any) => currentPath.startsWith(sub.href))));

  const linkClass = (
    active: boolean
  ) => `flex items-center space-x-3 py-2 px-3 rounded-md transition-all duration-200 text-sm font-medium 
 ${
   active
     ? "bg-red-600/20 text-red-300 border border-red-700/50" // ✅ অ্যাকটিভ স্টেট: আরও স্লিম
     : "text-gray-400 hover:bg-zinc-800 hover:text-white"
 }`;

  const iconClass = (active: boolean) =>
    active ? "text-red-500" : "text-gray-500 group-hover:text-red-400";

  if (item.isDropdown) {
    return (
      <div className="space-y-0.5 group">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`${linkClass(isActive)} w-full justify-between`}
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
      ? "bg-red-800/40 text-red-300 font-medium"
      : "text-gray-400 hover:bg-zinc-800 hover:text-white"
  }`}
              >
                {sub.icon && <sub.icon className="w-4 h-4 text-red-500" />}{" "}
                {/* ✅ সাব-আইটেমের জন্য আইকন */}
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
      className={`${linkClass(
        currentPath === item.href || currentPath.startsWith(item.href)
      )} group`}
    >
      <item.icon
        className={`w-5 h-5 transition-colors ${iconClass(
          currentPath === item.href || currentPath.startsWith(item.href)
        )}`}
      />
      <span className="text-white">{item.label}</span>
    </Link>
  );
};

// ----------------------------------------------------
// ✅ SidebarContent কম্পোনেন্ট (E-Mart Branding সহ)
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
        className="flex items-center space-x-2 text-2xl font-extrabold text-red-500 hover:text-red-400 transition"
      >
        <ShoppingCart className="w-6 h-6" /> <span>E-Mart</span>
      </Link>

      <button
        onClick={() => setIsOpen(false)}
        className="md:hidden text-gray-500 dark:text-gray-400 hover:text-white p-1 rounded-md transition-colors"
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
    {/* নেভিগেশন লিঙ্কস (স্লিম স্পেসিং) */}
    <div className="flex-1 space-y-4 p-4 pt-6 overflow-y-auto custom-scrollbar">
      {sidebarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1.5">
          {" "}
          {/* ✅ গ্রুপগুলির মধ্যে স্পেস কমানো */}
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
          <Zap className="w-4 h-4 text-red-500" />
        </div>

        <div>
          <p className="font-semibold text-white">E-Mart Admin</p>
          <p className="text-xs text-zinc-500">v1.0.0</p>
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

// ✅ AdminSidebar কম্পোনেন্ট
export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    setIsOpen(false);
    toast.success("Logged out successfully");
    router.replace("/");
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
