"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  X,
  AlertTriangle,
  ShoppingBag,
  Star,
  ShoppingCart,
  Trash2,
  CheckCircle,
} from "lucide-react";

// --- Custom Base Color ---
const PRIMARY_COLOR = "#155DFC";
const FALLBACK_IMAGE_URL =
  "https://placehold.co/100x100/94A3B8/FFFFFF?text=Product";
const MOCK_RATING = 4.5; // Mock rating for display

// --- Typescript Interfaces ---

interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

interface CartItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  selectedOptions: { name: string; value: string }[];
}

// --- Local Storage Management ---

const loadStorage = (key: string) => {
  if (typeof window === "undefined") return [];
  const json = localStorage.getItem(key);
  return json ? JSON.parse(json) : [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const saveStorage = (key: string, items: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event("localStorageChange"));
  }
};

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const router = useRouter();

  // --- Utility: Show Toast ---
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadWishlist = useCallback(() => {
    setWishlistItems(loadStorage("wishlistItems"));
    setLoading(false);
  }, []);

  useEffect(() => {
    // 1. স্ক্রলিং ফিক্স: কম্পোনেন্ট লোড হওয়ার সাথে সাথে পেজটিকে উপরে নিয়ে যাওয়া
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    // 2. Load Wishlist Data
    loadWishlist();
    window.addEventListener("localStorageChange", loadWishlist);

    return () => {
      window.removeEventListener("localStorageChange", loadWishlist);
    };
  }, [loadWishlist]); // dependency array is correct here

  // --- Handlers ---

  const handleRemoveItem = (id: string) => {
    const updatedWishlist = wishlistItems.filter((item) => item._id !== id);
    setWishlistItems(updatedWishlist);
    saveStorage("wishlistItems", updatedWishlist);
    showToast("Item removed from wishlist.", "error");
  };

  const handleMoveToCart = (item: WishlistItem) => {
    const cartItems: CartItem[] = loadStorage("cartItems");

    // Check if item already exists in cart (simple check by ID)
    const existingItem = cartItems.find(
      (cartItem: CartItem) => cartItem._id === item._id
    );

    if (existingItem) {
      existingItem.quantity += 1;
      showToast(`Quantity of ${item.name} updated in cart.`, "success");
    } else {
      cartItems.push({
        _id: item._id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        image: item.image,
        quantity: 1,
        selectedOptions: [], // Assuming base variant from this page
      });
      showToast(`${item.name} moved to cart!`, "success");
    }

    saveStorage("cartItems", cartItems);
    handleRemoveItem(item._id); // Remove from wishlist after moving

    // NAVIGATION: Move user to the Cart Page
    router.push("/cart");
  };

  const renderRatingStars = (rating: number) => {
    const effectiveRating = rating > 0 ? rating : MOCK_RATING;
    const fullStars = Math.floor(effectiveRating);
    const starArray = [];
    for (let i = 0; i < 5; i++) {
      starArray.push(
        <Star
          key={i}
          className={`w-4 h-4 transition-colors duration-200 ${
            i < fullStars
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300 fill-gray-300/20"
          }`}
        />
      );
    }
    return starArray;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4"
          style={{ borderColor: PRIMARY_COLOR }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-2 rounded-lg shadow-xl text-white transition-opacity duration-300 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-center">
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
          <Heart
            className="w-8 h-8 mr-3"
            style={{ color: PRIMARY_COLOR, fill: PRIMARY_COLOR }}
          />
          Your Wishlist ({wishlistItems.length})
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-lg border border-gray-200">
            <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
            <p className="text-xl font-semibold text-gray-700 mb-4">
              Your wishlist is empty!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 transition duration-150"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <ShoppingBag className="w-5 h-5 mr-2" /> Find Products to Love
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col sm:flex-row sm:justify-between border border-gray-200 transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Item Details and Image (Left/Top Section) */}
                <div className="flex items-center space-x-4 flex-1 min-w-0 mb-4 sm:mb-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100">
                    <Image
                      src={item.image || FALLBACK_IMAGE_URL}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="100px"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE_URL;
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </div>

                  <div className="flex flex-col min-w-0 pr-4">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-lg font-bold text-gray-900 hover:text-red-600 transition truncate"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">In Stock</p>
                    <p className="text-xl font-extrabold text-gray-700 mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center mt-1">
                      {renderRatingStars(MOCK_RATING)}
                    </div>
                  </div>
                </div>

                {/* Actions (Right/Bottom Section) */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 items-start sm:items-center ml-0 sm:ml-4 flex-shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Buttons Container (Mobile: Inline flex, sm: Stacked/Inline) */}
                  <div className="flex flex-row space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white rounded-lg shadow-sm transition duration-150 flex-1 hover:opacity-90 sm:text-sm sm:px-4"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2" />
                      Cart
                    </button>

                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg shadow-sm transition duration-150 hover:bg-red-50 flex-1 sm:text-sm sm:px-4"
                    >
                      <Trash2 className="w-4 h-4 mr-1 sm:mr-2" /> Remove
                    </button>
                  </div>

                  {/* Link to Details Page (FIXED: Now visible on both small and large screens) */}
                  <Link
                    href={`/products/${item.slug}`}
                    className="block text-sm text-gray-500 hover:text-gray-900 transition mt-2 sm:mt-0 w-full text-center sm:w-auto sm:text-right"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
