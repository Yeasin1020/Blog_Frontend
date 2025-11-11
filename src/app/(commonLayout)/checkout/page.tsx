/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  ListOrdered,
  CreditCard,
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  X,
  User as UserIcon,
  Phone,
  Hash,
  Trash2,
} from "lucide-react";

// --- API Configuration ---
const PRIMARY_COLOR = "#155DFC";
const FALLBACK_IMAGE_URL =
  "https://placehold.co/100x100/94A3B8/FFFFFF?text=Product";
const API_BASE_URL = "https://ecommercebackend-teal.vercel.app/api";
const SIGNUP_API = `${API_BASE_URL}/auth/signup`;
const ORDER_API = `${API_BASE_URL}/orders`;

// --- Typescript Interfaces ---
interface CartItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  selectedOptions: { name: string; value: string }[];
}

interface ShippingData {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  note: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

// --- Local Storage Management ---
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cartJson = localStorage.getItem("cartItems");
  return cartJson ? JSON.parse(cartJson) : [];
};

const loadUserInfo = (): UserInfo | null => {
  if (typeof window === "undefined") return null;
  const userInfoJson = localStorage.getItem("userInfo");
  const token = localStorage.getItem("userToken");

  if (userInfoJson) {
    try {
      const parsed = JSON.parse(userInfoJson);
      return { ...parsed, token: token ?? undefined };
    } catch {
      return token ? { id: "", name: "", email: "", role: "", token } : null;
    }
  }
  return token ? { id: "", name: "", email: "", role: "", token } : null;
};

const saveCartToStorage = (cartItems: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("localStorageChange"));
  }
};

const saveAuthToStorage = (data: {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}) => {
  if (typeof window !== "undefined") {
    const userInfo = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    localStorage.setItem("userToken", data.token);
  }
};

const clearCartInStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cartItems");
    window.dispatchEvent(new Event("localStorageChange"));
  }
};

// --- Main Checkout Component ---
const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingData>({
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
    note: "",
  });

  const loggedInUser = useMemo(() => loadUserInfo(), []);
  const [authInfo, setAuthInfo] = useState({
    name: loggedInUser?.name || "",
    email: loggedInUser?.email || "",
    password: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [bkashInfo, setBkashInfo] = useState({
    phoneNumber: "",
    transactionId: "",
  });

  const [loading, setLoading] = useState(true);
  const [isOrderPlacing, setIsOrderPlacing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const router = useRouter();

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const items = loadCartFromStorage();
    setCartItems(items);
    setLoading(false);

    if (items.length === 0) {
      // If cart empty, redirect after short message
      showToast("Your cart is empty — redirecting to products...", "info");
      setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          window.location.pathname === "/checkout"
        ) {
          router.push("/products");
        }
      }, 1400);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router]);

  // --- Pricing Calculations ---
  // NOTE: shippingPrice and taxPrice are intentionally 0 — backend will provide them later
  const itemsPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const shippingPrice = 0;
  const taxPrice = 0;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // --- Validation Checks ---
  const isShippingValid =
    shippingInfo.address.trim() !== "" &&
    shippingInfo.city.trim() !== "" &&
    shippingInfo.postalCode.trim() !== "" &&
    shippingInfo.country.trim() !== "";

  const isAuthRequired = !loggedInUser;
  const isAuthValid =
    !isAuthRequired ||
    (authInfo.name.trim() !== "" &&
      authInfo.email.trim() !== "" &&
      authInfo.password.length >= 6);

  const isBkashValid =
    paymentMethod !== "Bkash" ||
    (bkashInfo.phoneNumber.trim().length >= 10 &&
      bkashInfo.transactionId.trim().length === 10);

  const isFormValid = isShippingValid && isAuthValid && isBkashValid;

  // --- Cart Mutations (quantity update & remove) ---
  const updateQuantity = (itemId: string, quantity: number) => {
    const next = cartItems.map((it) =>
      it._id === itemId ? { ...it, quantity: Math.max(1, quantity) } : it
    );
    setCartItems(next);
    saveCartToStorage(next);
  };

  const changeQuantityBy = (itemId: string, delta: number) => {
    const found = cartItems.find((it) => it._id === itemId);
    if (!found) return;
    const newQty = Math.max(1, found.quantity + delta);
    updateQuantity(itemId, newQty);
  };

  const removeItem = (itemId: string) => {
    const next = cartItems.filter((it) => it._id !== itemId);
    setCartItems(next);
    saveCartToStorage(next);
    showToast("Item removed from cart", "info");
    if (next.length === 0) {
      setTimeout(() => router.push("/products"), 600);
    }
  };

  // --- Event Handlers ---
  const handleShippingChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthInfo({
      ...authInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleBkashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBkashInfo({
      ...bkashInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid) {
      showToast(
        "Please complete all required fields (Shipping/Auth/Payment).",
        "error"
      );
      return;
    }

    if (cartItems.length === 0) {
      showToast("Cannot place order with an empty cart.", "error");
      return;
    }

    setIsOrderPlacing(true);
    let finalToken = loggedInUser?.token;
    let finalUserId = loggedInUser?.id;

    try {
      // STEP 1: AUTHENTICATION (If user is not logged in)
      if (!loggedInUser) {
        showToast("Authenticating / creating account...", "info");
        const authResponse = await fetch(SIGNUP_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authInfo.name,
            email: authInfo.email,
            password: authInfo.password,
          }),
        });

        const authData = await authResponse.json();

        if (!authResponse.ok || !authData.token) {
          showToast(
            authData.message || "Authentication failed. Check your details.",
            "error"
          );
          setIsOrderPlacing(false);
          return;
        }

        // Save new user info/token to local storage
        saveAuthToStorage(authData);
        finalToken = authData.token;
        finalUserId = authData._id;
      }

      // STEP 2: CONSTRUCT FINAL ORDER DATA
      const contactEmail = loggedInUser?.email || authInfo.email;
      const contactPhone =
        paymentMethod === "Bkash" ? bkashInfo.phoneNumber : undefined;

      const orderData: any = {
        user: finalUserId,
        contactEmail: finalUserId ? undefined : contactEmail,
        contactPhone: finalUserId ? undefined : contactPhone,
        orderItems: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          product: item._id,
        })),
        shippingAddress: shippingInfo,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        transactionDetails: paymentMethod === "Bkash" ? bkashInfo : undefined,
      };

      // STEP 3: PLACE ORDER
      showToast("Placing order...", "info");
      const orderResponse = await fetch(ORDER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: finalToken ? `Bearer ${finalToken}` : "",
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        showToast(
          orderResult.message || "Order placement failed due to server error.",
          "error"
        );
        setIsOrderPlacing(false);
        return;
      }

      // Success: clear cart & redirect to order success
      showToast(`Order #${orderResult.order._id.slice(-6)} placed!`, "success");
      clearCartInStorage();
      setCartItems([]);
      router.push("/dashboard/customer/order-history");
    } catch (error) {
      console.error("place order error", error);
      showToast("A network error occurred.", "error");
    } finally {
      setIsOrderPlacing(false);
    }
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

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 p-3 rounded-lg shadow-xl text-white transition-opacity duration-300 ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : toast.type === "error" ? (
              <X className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <ListOrdered className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />
            Checkout & Place Order
          </h1>
          <div className="text-sm text-gray-600">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in cart
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                <UserIcon
                  className="w-5 h-5"
                  style={{ color: PRIMARY_COLOR }}
                />
                Account & Contact
              </h2>

              {loggedInUser ? (
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800">
                  Welcome back,{" "}
                  <span className="font-semibold">{loggedInUser.name}</span> (
                  {loggedInUser.email}). Your order will be linked to this
                  account.
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Provide name, email and password. If an account with this
                    email exists, it will be used. Otherwise, one will be
                    created automatically.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={authInfo.name}
                      onChange={handleAuthChange}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={authInfo.email}
                      onChange={handleAuthChange}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                    <div className="md:col-span-2">
                      <input
                        type="password"
                        name="password"
                        placeholder="Password (min 6 chars)"
                        value={authInfo.password}
                        onChange={handleAuthChange}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Shipping */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                <MapPin className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                Shipping Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  placeholder="Street address"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                />
                <input
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  placeholder="City / District"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                />
                <input
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingChange}
                  placeholder="Postal code"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                />
                <select
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                >
                  <option>Bangladesh</option>
                  <option>India</option>
                  <option>United States</option>
                </select>
                <div className="md:col-span-2">
                  <textarea
                    name="note"
                    value={shippingInfo.note}
                    onChange={handleShippingChange as any}
                    placeholder="Delivery note (optional)"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 w-full min-h-[80px]"
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                <CreditCard
                  className="w-5 h-5"
                  style={{ color: PRIMARY_COLOR }}
                />
                Payment
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === "Cash on Delivery"
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Delivery"
                    checked={paymentMethod === "Cash on Delivery"}
                    onChange={() => setPaymentMethod("Cash on Delivery")}
                    style={{ accentColor: PRIMARY_COLOR }}
                  />
                  <div className="font-medium">Cash on Delivery (COD)</div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === "Bkash"
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Bkash"
                    checked={paymentMethod === "Bkash"}
                    onChange={() => setPaymentMethod("Bkash")}
                    style={{ accentColor: PRIMARY_COLOR }}
                  />
                  <div className="font-medium">Bkash (Mobile)</div>
                </label>

                {paymentMethod === "Bkash" && (
                  <div className="p-4 border border-dashed rounded-lg bg-gray-50">
                    <p className="text-sm text-red-600 mb-2">
                      Send BDT {totalPrice.toFixed(2)} to merchant number
                      (MOCK), then enter details:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          name="phoneNumber"
                          value={bkashInfo.phoneNumber}
                          onChange={handleBkashChange}
                          placeholder="Bkash phone number"
                          className="p-3 pl-10 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-red-100"
                        />
                      </div>
                      <div className="relative">
                        <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          name="transactionId"
                          value={bkashInfo.transactionId}
                          onChange={handleBkashChange}
                          placeholder="Transaction ID (10 chars)"
                          maxLength={10}
                          className="p-3 pl-10 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-red-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar: Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                Order Summary
              </h3>

              {/* Items list */}
              {/* Selected options — show color swatch for color codes, text otherwise (TS-safe) */}
              {/* Items list */}
              <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <Image
                            src={FALLBACK_IMAGE_URL}
                            alt="product"
                            width={64}
                            height={64}
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate text-sm font-medium text-gray-800">
                            {item.name}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                          <div className="flex items-center border rounded-md overflow-hidden">
                            <button
                              onClick={() => changeQuantityBy(item._id, -1)}
                              className="px-2 py-1"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const v = parseInt(e.target.value || "1", 10);
                                if (!isNaN(v) && v >= 1)
                                  updateQuantity(item._id, v);
                              }}
                              className="w-12 text-center outline-none bg-transparent"
                              min={1}
                            />
                            <button
                              onClick={() => changeQuantityBy(item._id, 1)}
                              className="px-2 py-1"
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => removeItem(item._id)}
                              className="text-red-500 hover:text-red-600 flex items-center gap-1"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        </div>

                        {/* Selected options — show color swatch for color codes, text otherwise (TS-safe) */}
                        <div className="mt-1 text-xs text-gray-500 flex flex-wrap items-center gap-2">
                          {item.selectedOptions?.map((opt, idx: number) => {
                            const val = String(opt?.value ?? "").trim();
                            const hexMatch = val.match(
                              /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
                            );

                            const expandHex = (shortHex: string) =>
                              shortHex.length === 3
                                ? shortHex
                                    .split("")
                                    .map((ch) => ch + ch)
                                    .join("")
                                : shortHex;

                            const isHex = Boolean(hexMatch);

                            if (isHex) {
                              const raw = hexMatch![1]; // 3 or 6 chars
                              const full = expandHex(raw);
                              const hex = `#${full}`;

                              let isLight = false;
                              try {
                                const r = parseInt(full.substring(0, 2), 16);
                                const g = parseInt(full.substring(2, 4), 16);
                                const b = parseInt(full.substring(4, 6), 16);
                                const brightness =
                                  (r * 299 + g * 587 + b * 114) / 1000;
                                isLight = brightness > 200;
                              } catch {
                                isLight = false;
                              }

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2"
                                  title={`${opt.name}: ${hex}`}
                                >
                                  <span className="text-[11px] font-medium text-gray-600 mr-1">
                                    {opt.name}
                                  </span>
                                  <span
                                    aria-label={`${opt.name} color ${hex}`}
                                    role="img"
                                    className="w-5 h-5 rounded-full border inline-block"
                                    style={{
                                      backgroundColor: hex,
                                      borderColor: isLight
                                        ? "#d1d5db"
                                        : "rgba(0,0,0,0.12)",
                                    }}
                                  />
                                </div>
                              );
                            }

                            // not a color hex — render label:value text
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <span className="text-[11px] font-medium text-gray-600">
                                  {opt.name}:
                                </span>
                                <span className="text-xs text-gray-500">
                                  {val}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 p-3 text-center">
                    No items in cart.
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-2 text-gray-700 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span className="font-medium">${itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium">
                    ${shippingPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (VAT/GST)</span>
                  <span className="font-medium">${taxPrice.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600">Total</div>
                    <div
                      className="text-2xl font-extrabold"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      ${totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Place order */}
              <button
                onClick={handlePlaceOrder}
                disabled={
                  !isFormValid || isOrderPlacing || cartItems.length === 0
                }
                className="w-full py-3 rounded-lg text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                {isOrderPlacing
                  ? "Placing Order..."
                  : `Place Order • $${totalPrice.toFixed(2)}`}
              </button>

              <Link
                href="/cart"
                className="block text-center mt-3 text-sm text-gray-600 hover:text-gray-900"
              >
                &larr; Back to Cart to edit
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
