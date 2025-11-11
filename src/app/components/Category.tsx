"use client";
import React from "react";
import {
  ChevronRight,
  Zap,
  Shirt,
  Home,
  Heart,
  Monitor,
  Watch,
  Backpack,
  BookOpen,
  Car,
  Footprints,
} from "lucide-react";
import Link from "next/link";

// --- Typescript Interfaces ---
interface Category {
  name: string;
  href: string;
  icon: React.ElementType; // Lucide icon component
  color: string; // Tailwind color class for icon and text
}

// --- Sample Data (Unchanged) ---
const categories: Category[] = [
  {
    name: "Electronics & Gadgets",
    href: "/products/electronics",
    icon: Zap,
    color: "text-indigo-600",
  },
  {
    name: "Smartphones",
    href: "/products/phones",
    icon: Monitor,
    color: "text-blue-600",
  },
  {
    name: "Fashion (Men)",
    href: "/products/men-fashion",
    icon: Shirt,
    color: "text-green-600",
  },
  {
    name: "Fashion (Women)",
    href: "/products/women-fashion",
    icon: Heart,
    color: "text-pink-600",
  },
  {
    name: "Home & Kitchen",
    href: "/products/home",
    icon: Home,
    color: "text-yellow-600",
  },
  {
    name: "Health & Beauty",
    href: "/products/beauty",
    icon: Watch,
    color: "text-purple-600",
  },
  {
    name: "Sports & Fitness",
    href: "/products/sports",
    icon: Footprints,
    color: "text-red-600",
  },
  {
    name: "Bags & Luggage",
    href: "/products/bags",
    icon: Backpack,
    color: "text-teal-600",
  },
  {
    name: "Books & Media",
    href: "/products/books",
    icon: BookOpen,
    color: "text-gray-600",
  },
  {
    name: "Automotive",
    href: "/products/auto",
    icon: Car,
    color: "text-orange-600",
  },
];

// --- Main Category Spotlight Component ---
const CategorySpotlight: React.FC = () => {
  return (
    <section className="py-10 md:py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-6 sm:mb-8 pb-2 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Browse Top Categories
          </h2>
          <Link
            href="/products"
            className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition duration-150 text-sm" // Smaller link text
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Category Grid (Clean Icon Grid) */}
        {/* Responsive Grid: 4 cols on mobile (sm), 5 on tablet, 6 or 8 on large desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.slice(0, 8).map(
            (
              category // Limiting to 8 items for a compact look
            ) => (
              <Link
                key={category.name}
                href={category.href}
                // Card Styling: Centered, compact padding, slightly flatter shadow
                className="group flex flex-col items-center justify-center p-3 bg-white border border-gray-100 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg"
                style={{ minHeight: "110px", maxHeight: "130px" }} // Compact height
              >
                {/* Icon Container (Smaller Icon size) */}
                <div
                  className={`p-2 mb-1 rounded-full ring-2 ring-opacity-30 ${category.color} ring-current transition-all duration-300 group-hover:ring-opacity-70 group-hover:shadow-lg`}
                >
                  <category.icon className="w-5 h-5" />{" "}
                  {/* Reduced icon size */}
                </div>

                {/* Category Name (Thin and Small) */}
                <h3 className="text-xs font-medium text-center text-gray-700 group-hover:text-blue-600 transition-colors duration-300 leading-snug line-clamp-2 mt-1">
                  {category.name}
                </h3>
              </Link>
            )
          )}

          {/* Optional: Add "View All" Button as a card if grid is limited */}
          {categories.length > 8 && (
            <Link
              href="/products"
              className="group flex flex-col items-center justify-center p-3 sm:p-5 bg-gray-100 border border-gray-300 rounded-xl transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg hover:bg-gray-200 text-gray-700"
              style={{ minHeight: "110px", maxHeight: "130px" }}
            >
              <div className="p-2 mb-1 rounded-full ring-2 ring-opacity-30 text-gray-700 ring-gray-400 transition-all duration-300">
                <ChevronRight className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-center mt-1">
                View All ({categories.length} Total)
              </h3>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySpotlight;
