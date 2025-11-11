"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag,
  List,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import Link from "next/link"; // ✅ Next.js Link imported

// --- Custom Base Color ---
const PRIMARY_COLOR = "#155DFC";
const LIGHT_HOVER_COLOR = "#E6F0FF"; // Custom light blue hover

// --- Typescript Interfaces ---
interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  colorScheme: "dark" | "light"; // Text color for background contrast
}
interface Category {
  name: string;
  href: string;
}

// --- Sample Data ---
const slides: Slide[] = [
  {
    id: 1,
    imageUrl:
      "https://placehold.co/1600x600/155DFC/FFFFFF?text=Ultimate+Deals+on+Gadgets",
    title: "The Ultimate Tech Upgrade is Here!",
    subtitle: "Massive discounts on smartphones, laptops, and accessories.",
    ctaText: "Shop Electronics",
    ctaLink: "/products/electronics",
    colorScheme: "light",
  },
  {
    id: 2,
    imageUrl:
      "https://placehold.co/1600x600/0047C4/FFFFFF?text=Exclusive+Winter+Collection",
    title: "Exclusive Winter Fashion Collection",
    subtitle: "Stylish apparel for men and women. Get 40% OFF.",
    ctaText: "View Fashion",
    ctaLink: "/products/fashion",
    colorScheme: "light",
  },
  {
    id: 3,
    imageUrl:
      "https://placehold.co/1600x600/FEE2E2/155DFC?text=Home+Appliance+Deals",
    title: "Upgrade Your Home Appliances",
    subtitle: "Best prices guaranteed on refrigerators and washing machines.",
    ctaText: "View Deals",
    ctaLink: "/products/home-appliance",
    colorScheme: "dark",
  },
];

const categories: Category[] = [
  { name: "Smartphones & Laptops", href: "/products/tech" },
  { name: "Men's Clothing", href: "/products/men-fashion" },
  { name: "Women's Clothing", href: "/products/women-fashion" },
  { name: "Home & Kitchen", href: "/products/home-kitchen" },
  { name: "Health & Wellness", href: "/products/health" },
  { name: "Sports & Outdoors", href: "/products/sports" },
  { name: "Toys & Games", href: "/products/toys" },
  { name: "Books & Media", href: "/products/books" },
  { name: "Automotive", href: "/products/auto" },
];

// --- Hero Slider Component ---
const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true); // Default open on desktop
  const totalSlides = slides.length;
  const autoSlideInterval = 6000; // 6 seconds

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50; // Minimum distance (pixels) to register a swipe

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoSlideInterval]);

  // --- Touch/Swipe Handlers ---
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = 0;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > minSwipeDistance;

    if (isSwipe) {
      if (distance > 0) {
        // Swiped Left (go to next slide)
        nextSlide();
      } else {
        // Swiped Right (go to previous slide)
        prevSlide();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Determine text colors based on slide background for better contrast
  const getTextColor = (scheme: "dark" | "light") =>
    scheme === "light" ? "text-white" : "text-gray-900";

  const getButtonColor = (scheme: "dark" | "light") => ({
    backgroundColor: PRIMARY_COLOR,
    color: "white", // Always white text on custom primary button
  });

  return (
    // Outer wrapper ensures the slider spans full width on mobile
    <div className="w-full my-4">
      <section className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        {/* --- 1. Category Sidebar (Desktop Only) --- */}
        <div className="hidden lg:block w-full lg:w-1/4 xl:w-1/5 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
          <h2
            className="flex items-center p-4 text-white font-bold text-lg"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            <List className="w-5 h-5 mr-3" /> Shop By Category
          </h2>

          <ul className="py-2">
            {categories.map((category) => (
              <li key={category.name}>
                {/* ✅ Link component for navigation */}
                <Link
                  href={category.href}
                  className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 transition duration-150 group"
                  // Applying custom hover color to the background
                  style={
                    {
                      "--tw-bg-opacity": 1,
                      transition: "background-color 150ms, color 150ms",
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = PRIMARY_COLOR;
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "rgb(55 65 81)"; // Tailwind gray-700
                  }}
                >
                  {category.name}

                  <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition duration-150" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* --- 2. Main Hero Slider (Swipe Enabled) --- */}
        <div
          className="relative w-full lg:w-3/4 xl:w-4/5 overflow-hidden shadow-xl rounded-xl cursor-grab"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Aspect Ratio Container (ensures responsive height) */}
          {/* Mobile: 16:9 (56.25% padding); Desktop: Taller (40% padding, or 10:4 ratio) */}
          <div className="relative pt-[56.25%] lg:pt-[40%] w-full">
            {/* --- Slider Wrapper --- */}
            <div
              className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="w-full flex-shrink-0 relative">
                  {/* --- Background Image --- */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/1600x600/cccccc/333333?text=Image+Not+Found";
                    }}
                  />

                  {/* --- Overlay and Content --- */}
                  <div
                    className={`absolute inset-0 flex items-center p-6 sm:p-12 lg:p-16 ${
                      slide.colorScheme === "light"
                        ? "bg-black bg-opacity-30" // Dark overlay for light text
                        : "bg-white bg-opacity-60" // Light overlay for dark text
                    }`}
                  >
                    <div className="max-w-lg">
                      <h1
                        className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 drop-shadow-lg leading-tight ${getTextColor(
                          slide.colorScheme
                        )}`}
                      >
                        {slide.title}
                      </h1>

                      <p
                        className={`text-base sm:text-xl mb-4 sm:mb-6 drop-shadow-md ${getTextColor(
                          slide.colorScheme
                        )}`}
                      >
                        {slide.subtitle}
                      </p>

                      {/* ✅ Link component for CTA */}
                      <Link
                        href={slide.ctaLink}
                        className={`inline-flex items-center px-6 py-3 text-base font-bold rounded-full shadow-lg transition duration-300 transform hover:scale-[1.03] hover:opacity-90`}
                        style={getButtonColor(slide.colorScheme)} // Custom primary color for CTA
                      >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        {slide.ctaText}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Slider Dots (Indicators) --- */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 shadow-md ${
                    currentSlide === index
                      ? "bg-white"
                      : "bg-gray-400 bg-opacity-50 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSlider;
