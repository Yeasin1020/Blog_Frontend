"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  AlertTriangle,
  ShoppingBag,
  CheckCircle,
  Tag, // Coupon icon
} from "lucide-react";

// --- Custom Base Color ---
const PRIMARY_COLOR = "#155DFC";
const FALLBACK_IMAGE_URL =
  "https://placehold.co/100x100/94A3B8/FFFFFF?text=Product";
const VALID_COUPON_CODE = "SAVE20"; // Mock Coupon Code
const COUPON_DISCOUNT_PERCENT = 20;

// --- Typescript Interfaces (Unchanged) ---
interface Option {
  name: string;
  value: string;
}

interface CartItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  selectedOptions: Option[];
}

// --- Local Storage Management (Unchanged) ---

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cartJson = localStorage.getItem("cartItems");
  return cartJson ? JSON.parse(cartJson) : [];
};

const saveCartToStorage = (cartItems: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("localStorageChange"));
  }
};

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // --- New Coupon States ---
  const [couponInput, setCouponInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // --- Utility: Show Toast ---
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCart = useCallback(() => {
    setCartItems(loadCartFromStorage());
    setLoading(false);
    // Optionally check local storage for applied coupon on load if supported
  }, []);

  useEffect(() => {
    loadCart();
    window.addEventListener("localStorageChange", loadCart);

    return () => {
      window.removeEventListener("localStorageChange", loadCart);
    };
  }, [loadCart]);

  // --- Calculations ---
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Apply discount calculation
  const couponDiscountAmount = useMemo(() => {
    if (discountPercent > 0) {
      return (subtotal * discountPercent) / 100;
    }
    return 0;
  }, [subtotal, discountPercent]);

  const discountedSubtotal = subtotal - couponDiscountAmount;
  const shippingCost = discountedSubtotal > 100 ? 0 : 10; // Mock Shipping Logic (based on discounted subtotal)
  const totalAmount = discountedSubtotal + shippingCost;

  // --- Cart Handlers (Updated) ---

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updatedCart = cartItems.map((item) => {
      if (item._id === id) {
        const newQuantity = item.quantity + delta;
        if (newQuantity >= 1) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    });

    const filteredCart = updatedCart.filter((item) => item.quantity > 0);
    setCartItems(filteredCart);
    saveCartToStorage(filteredCart);
  };

  const handleRemoveItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    saveCartToStorage(updatedCart);
    showToast("Item removed from cart.", "error");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }
    showToast("Proceeding to Checkout (Simulated)...", "success");
    console.log("Proceeding to Checkout with total:", totalAmount);
  };

  // --- Coupon Handler ---
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();

    if (isCouponApplied) {
      showToast("Coupon already applied.", "error");
      return;
    }

    if (code === VALID_COUPON_CODE) {
      setDiscountPercent(COUPON_DISCOUNT_PERCENT);
      setIsCouponApplied(true);
      showToast(`Coupon ${code} applied successfully!`, "success");
    } else {
      setDiscountPercent(0);
      setIsCouponApplied(false);
      showToast("Invalid coupon code.", "error");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountPercent(0);
    setIsCouponApplied(false);
    setCouponInput("");
    showToast("Coupon removed.", "error");
  };

  const renderItemOptions = (options: Option[]) => {
    if (options.length === 0) return null;
    return (
      <div className="text-xs text-gray-500 mt-1 space-y-1">
        {options.map((opt, index) => (
          <p key={index}>
            <span className="font-semibold">{opt.name}:</span> {opt.value}
          </p>
        ))}
      </div>
    );
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
      {/* Toast Notification (Unchanged) */}
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
              <X className="w-5 h-5 mr-2" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
          <ShoppingCart
            className="w-8 h-8 mr-3"
            style={{ color: PRIMARY_COLOR }}
          />
          Your Shopping Cart ({cartItems.length})
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-lg border border-gray-200">
            <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
            <p className="text-xl font-semibold text-gray-700 mb-4">
              Your cart is empty!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 transition duration-150"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <ShoppingBag className="w-5 h-5 mr-2" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={
                    item._id +
                    item.selectedOptions.map((o) => o.value).join("-")
                  }
                  className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex items-center justify-between border border-gray-200"
                >
                  {/* Item Details */}
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
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
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-lg font-bold text-gray-900 hover:text-red-600 transition truncate"
                      >
                        {item.name}
                      </Link>
                      {renderItemOptions(item.selectedOptions)}
                      <p className="text-md font-semibold text-gray-700 mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end space-y-3 ml-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden flex-shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-lg bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        readOnly // Quantity changes only via buttons for better UX
                        className="w-10 h-8 text-center text-gray-800 border-x border-gray-300 focus:outline-none bg-white"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item._id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-lg bg-gray-100 hover:bg-gray-200 transition"
                        // NOTE: Max stock check assumed in handleUpdateQuantity
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-500 hover:text-red-700 transition duration-150 flex items-center text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-3">
                  Order Summary
                </h2>

                {/* --- Coupon Code Input --- */}
                <form onSubmit={handleApplyCoupon} className="mb-6 space-y-3">
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="font-semibold text-gray-700">
                      Apply Coupon
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code (e.g., SAVE20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      disabled={isCouponApplied}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                    {!isCouponApplied ? (
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm text-white font-medium rounded-lg shadow-sm transition duration-150 disabled:bg-gray-400"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                        disabled={!couponInput.trim()}
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-4 py-2 text-sm text-white font-medium rounded-lg shadow-sm transition duration-150 bg-red-500 hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </form>

                {/* --- Pricing Details --- */}
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Discount Row */}
                  {couponDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Coupon Discount ({discountPercent}%)</span>
                      <span>-${couponDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">
                          Calculated at Checkout
                        </span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-gray-300 flex justify-between text-xl font-extrabold text-gray-900">
                    <span>Order Total</span>
                    <span className="text-2xl" style={{ color: PRIMARY_COLOR }}>
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full mt-6 py-3 text-white font-bold text-lg rounded-xl shadow-md transition duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  // Note: Link-এ disabled attribute কাজ করে না, তাই className-এ opacity যোগ করা হলো
                  // এবং onClick লজিকটিকে সরিয়ে দেওয়া হলো
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="block text-center mt-3 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
