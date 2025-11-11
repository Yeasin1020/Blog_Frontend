"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Star,
  Zap,
  XCircle,
  CheckCircle,
  Package,
  ShoppingCart,
  Info,
} from "lucide-react";
import Link from "next/link";

// --- Custom Base Color (155DFC) ---
const PRIMARY_COLOR = "#155DFC"; // Base color for primary actions

// --- Typescript Interfaces (API Data Structure) ---
interface CombinedVariant {
  options: { name: string; value: string }[];
  stock: number;
  priceAdjustment: number;
  sku: string;
}
interface APIProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  countInStock: number;
  imageUrls: string[];
  category: string;
  brand: string;
  variantDefinitions: { name: string; values: string[] }[];
  combinedVariants: CombinedVariant[];
  rating: number;
  numReviews: number;
}
interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

// --- API Configuration ---
const API_URL = "https://ecommercebackend-teal.vercel.app/api/products";
const FALLBACK_IMAGE_URL =
  "https://placehold.co/400x400/94A3B8/FFFFFF?text=Product";
const MOCK_LOW_STOCK_THRESHOLD = 10;
// MOCK_RATING এবং MOCK_REVIEWS অপ্রয়োজনীয় (Unnecessary) কারণ এখন কন্ডিশনাল লজিক ব্যবহৃত হচ্ছে

// --- Helper Functions ---

const calculateDiscount = (original: number, discount: number | null) => {
  if (discount === null || discount >= original) return 0;
  const percentage = ((original - discount) / original) * 100;
  return Math.round(percentage);
};

/**
 * Render star icons based on rating and review count.
 * FIX: If numReviews is 0, stars are shown empty (outline).
 */
const renderRatingStars = (rating: number, numReviews: number) => {
  const effectiveRating = numReviews > 0 ? rating : 0; // Use 0 if no reviews
  const fullStars = Math.floor(effectiveRating);
  const starArray = []; // Determine fill color: yellow if reviewed, gray outline if not reviewed.
  const isReviewed = numReviews > 0;
  for (let i = 0; i < 5; i++) {
    const filled = i < fullStars;
    starArray.push(
      <Star
        key={i}
        className={`w-4 h-4 transition-colors duration-200 ${
          filled && isReviewed
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-400 fill-gray-400/20" // Gray outline for both unrated and empty slots
        }`}
      />
    );
  }
  return starArray;
};

const calculateTotalStock = (product: APIProduct) => {
  if (product.combinedVariants && product.combinedVariants.length > 0) {
    return product.combinedVariants.reduce(
      (sum, variant) => sum + variant.stock,
      0
    );
  }
  return product.countInStock;
};

// --- Local Storage Management ---
const loadStorage = (key: string) => {
  if (typeof window === "undefined") return [];
  const json = localStorage.getItem(key);
  return json ? JSON.parse(json) : [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const saveStorage = (key: string, items: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(items)); // Manually dispatch custom event to update Navbar/Cart badge
    window.dispatchEvent(new Event("localStorageChange"));
  }
};

// --- API Fetch Function ---
const fetchProducts = async (): Promise<APIProduct[]> => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      let errorMessage = `Server responded with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {}
      throw new Error(errorMessage);
    }

    const data: APIProduct[] = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error (CORS/Network likely):", error);
    return [];
  }
};

// --- Main Hot Deals Component ---
const HotDeal: React.FC = () => {
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null); // --- Utility: Show Toast ---

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }; // Load Data

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setLoading(false);
  }, []); // Effect to load products and listen for reviewsUpdated events

  useEffect(() => {
    loadProducts();

    const onReviewsUpdated = () => {
      // small delay to allow backend commit
      setTimeout(async () => {
        await loadProducts();
        showToast("Product reviews updated", "success");
      }, 250);
    };

    const onLocalStorageChange = () => {
      // Re-render to update the wishlist icon status (important for UX)
      setProducts((prev) => [...prev]);
    };

    window.addEventListener("reviewsUpdated", onReviewsUpdated);
    window.addEventListener("localStorageChange", onLocalStorageChange);

    return () => {
      window.removeEventListener("reviewsUpdated", onReviewsUpdated);
      window.removeEventListener("localStorageChange", onLocalStorageChange);
    };
  }, [loadProducts]); // --- HANDLER: Add/Remove from Wishlist (Toggle) ---

  const handleAddToWishlist = (e: React.MouseEvent, product: APIProduct) => {
    e.preventDefault();
    e.stopPropagation(); // Link click prevention

    const newItem: WishlistItem = {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.discountPrice || product.price,
      image: product.imageUrls[0] || FALLBACK_IMAGE_URL,
    };

    const currentWishlist: WishlistItem[] = loadStorage("wishlistItems");
    const exists = currentWishlist.some((item) => item._id === newItem._id);

    if (exists) {
      const updatedWishlist = currentWishlist.filter(
        (item) => item._id !== newItem._id
      );
      saveStorage("wishlistItems", updatedWishlist);
      showToast(`${product.name} removed from Wishlist.`, "error");
    } else {
      currentWishlist.push(newItem);
      saveStorage("wishlistItems", currentWishlist);
      showToast(`${product.name} added to Wishlist!`, "success");
    } // Manually force re-render to update icon state immediately

    setProducts((prev) => [...prev]);
  }; // Helper function to check if item is already in wishlist (for button styling)

  const isProductInWishlist = (productId: string): boolean => {
    if (typeof window === "undefined") return false;
    const currentWishlist: WishlistItem[] = loadStorage("wishlistItems");
    return currentWishlist.some((item) => item._id === productId);
  }; // Helper function to get stock status element

  const renderStockStatus = (stock: number) => {
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= MOCK_LOW_STOCK_THRESHOLD;

    let statusText = "In Stock";
    let statusClass = "text-green-600 bg-green-100";
    let statusIcon = <CheckCircle className="w-4 h-4 mr-1" />;

    if (isOutOfStock) {
      statusText = "Out of Stock";
      statusClass = "text-gray-700 bg-gray-200";
      statusIcon = <XCircle className="w-4 h-4 mr-1" />;
    } else if (isLowStock) {
      statusText = `Low Stock (${stock} left)`;
      statusClass = "text-orange-600 bg-orange-100";
      statusIcon = <Package className="w-4 h-4 mr-1" />;
    }

    return (
      <div
        className={`flex items-center px-2 py-0.5 text-xs font-bold rounded-full w-fit ${statusClass}`}
      >
        {statusIcon} {statusText}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center bg-gray-50">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: PRIMARY_COLOR }}
        />
      </div>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white transition-opacity duration-300 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-center">
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 mr-2" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8 sm:mb-10 pb-3 border-b border-gray-300">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Zap
              className="w-8 h-8 mr-2"
              style={{ color: PRIMARY_COLOR, fill: PRIMARY_COLOR }}
            />
            Hot Deals: Limited Stock
          </h2>

          <Link
            href="/products"
            className="flex items-center font-semibold transition duration-150 text-sm sm:text-base hover:opacity-80"
            style={{ color: PRIMARY_COLOR }}
          >
            Grab All Hot Deals &rarr;
          </Link>
        </div>

        {/* Product Grid (Responsive: 2 on mobile, 3 on tablet, 4 on desktop) */}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-10">
              No hot deals available right now. Please check back later!
            </p>
          ) : (
            products.map((product) => {
              const discount = calculateDiscount(
                product.price,
                product.discountPrice
              );
              const stock = calculateTotalStock(product);
              const isOutOfStock = stock <= 0;
              const productLink = `/products/${product.slug}`;
              const inWishlist = isProductInWishlist(product._id);

              return (
                <div
                  key={product._id}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:shadow-2xl flex flex-col ${
                    isOutOfStock ? "opacity-60" : "hover:translate-y-[-2px]"
                  }`}
                >
                  {/* Product Image Link (Top Section) */}

                  <div className="relative w-full aspect-[4/3] sm:aspect-square bg-gray-100 overflow-hidden">
                    <Link href={productLink} className="block w-full h-full">
                      <img
                        src={product.imageUrls[0] || FALLBACK_IMAGE_URL}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE_URL;
                        }}
                      />
                    </Link>
                    {/* Discount Badge */}

                    {discount > 0 && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-md z-10">
                        {discount}% OFF
                      </div>
                    )}
                  </div>
                  {/* Product Details (Bottom Section) */}

                  <div className="p-3 sm:p-4 flex flex-col flex-grow relative">
                    {/* Category */}
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {product.category}
                    </span>
                    {/* Name */}
                    <Link href={productLink} className="flex-grow">
                      <h3 className="mt-1 text-base font-bold text-gray-900 line-clamp-2 min-h-[40px] hover:text-red-700 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    {/* Rating */}
                    <div className="flex items-center mt-2 mb-1">
                      {product.numReviews > 0 ? (
                        <>
                          <div className="flex -space-x-1 mr-2">
                            {renderRatingStars(
                              product.rating,
                              product.numReviews
                            )}
                          </div>

                          <span className="text-xs text-gray-500">
                            ({product.numReviews}
                            {product.numReviews === 1 ? "Review" : "Reviews"})
                          </span>
                        </>
                      ) : (
                        // No real reviews yet
                        <div className="text-xs text-gray-500 italic">
                          Be the first to review
                        </div>
                      )}
                    </div>
                    {/* Pricing */}
                    <div className="flex items-center space-x-3 mb-1">
                      {product.discountPrice !== null &&
                      product.discountPrice < product.price ? (
                        <>
                          <p className="text-xl font-extrabold text-red-700">
                            ${product.discountPrice.toFixed(2)}
                          </p>

                          <p className="text-sm font-medium text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-xl font-extrabold text-gray-900">
                          ${product.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Stock Status AND Wishlist Button (Bottom Line, aligned) */}

                    <div className="mb-1 mt-auto flex justify-between items-center">
                      {/* Stock Status (Left) */}
                      {renderStockStatus(stock)}
                      {/* Floating Wishlist Button (Right) */}

                      <button
                        title={
                          inWishlist
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                        }
                        className={`p-2 rounded-full transition-all duration-200 z-10 ml-2 flex-shrink-0 
                ${
                  isOutOfStock
                    ? "bg-gray-300 disabled:cursor-not-allowed"
                    : "hover:bg-gray-100"
                }
               `}
                        onClick={(e) => handleAddToWishlist(e, product)}
                        disabled={isOutOfStock}
                      >
                        <Heart
                          className={`w-5 h-5`}
                          style={{
                            fill: inWishlist ? PRIMARY_COLOR : "none",
                            color: inWishlist ? PRIMARY_COLOR : "#6B7280",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default HotDeal;
