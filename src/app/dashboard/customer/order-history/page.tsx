/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ListOrdered,
  Truck,
  CheckCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CONFIG ---
const PRIMARY_COLOR = "#007BFF"; // Ektu brighter blue
const ACCENT_COLOR = "#38BDF8"; // Sky blue for secondary highlights
const FALLBACK_IMAGE_URL = "https://placehold.co/80x80/1E293B/FFFFFF?text=P";
const API_BASE = "https://ecommercebackend-teal.vercel.app/api";
const API_ORDERS = `${API_BASE}/orders/myorders`;
const API_PRODUCT_REVIEWS = (productId: string) =>
  `${API_BASE}/products/${productId}/reviews`;
const API_REVIEW_LIKE = (reviewId: string) =>
  `${API_BASE}/reviews/${reviewId}/like`;
const API_REVIEW_REPLY = (reviewId: string) =>
  `${API_BASE}/reviews/${reviewId}/reply`;

// --- TYPES ---
interface OrderItem {
  name: string;
  quantity: number;
  image?: string;
  price: number;
  product: { $oid: string } | string;
}

interface ShippingAddress {
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  note?: string;
}

interface OrderHistoryItem {
  _id: { $oid: string } | string;
  orderItems: OrderItem[];
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  itemsPrice?: number;
  shippingPrice?: number;
  taxPrice?: number;
  totalPrice?: number;
  isPaid?: boolean;
  isDelivered?: boolean;
  createdAt: { $date: string } | string;
  deliveredAt?: string;
}

// Review shapes returned by server (populated) - MODIFIED: likesCount removed, likes array added
interface ReviewShape {
  _id: string;
  user: { _id?: string; name?: string; email?: string } | string;
  rating: number;
  comment: string;
  likes: ({ $oid: string } | string)[]; // Array of user IDs/OIDs who liked it
  replies?: {
    _id?: string;
    user?: { _id?: string; name?: string; role?: string };
    message?: string;
    createdAt?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

// --- HELPERS ---
const loadAuthData = () => {
  if (typeof window === "undefined") return { user: null, token: null };
  const storedToken = localStorage.getItem("userToken");
  const storedInfo = localStorage.getItem("userInfo");
  if (storedToken && storedInfo)
    return { user: JSON.parse(storedInfo), token: storedToken };
  return { user: null, token: null };
};

const formatCurrency = (v?: number) => {
  if (typeof v !== "number") return "-";
  return `$${v.toFixed(2)}`;
};

const formatDateFriendly = (d: any) => {
  try {
    const dt = new Date(typeof d === "object" && d.$date ? d.$date : d);
    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
};

const getIdSuffix = (id: any) => {
  const s = typeof id === "object" && id.$oid ? id.$oid : String(id);
  // Using first 4 and last 4 chars for better unique display
  return `${s.slice(0, 4)}...${s.slice(-4)}`.toUpperCase();
};

const normalizeId = (id: any) => {
  return typeof id === "object" && id.$oid ? String(id.$oid) : String(id);
};

// --- Small UI pieces ---
const StatusBadge: React.FC<{ order: OrderHistoryItem }> = ({ order }) => {
  if (order.isDelivered) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-white shadow-md">
        <Truck className="w-3 h-3" /> Delivered
      </span>
    );
  }
  if (order.isPaid) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-700/80 text-white shadow-md">
        <CheckCircle className="w-3 h-3" /> Paid · Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-700/80 text-white shadow-md">
      <Clock className="w-3 h-3" /> Pending Payment
    </span>
  );
};

const OrderSkeleton = () => (
  <div className="bg-zinc-800 animate-pulse rounded-xl p-4 sm:p-6 border border-zinc-700 shadow-lg">
    <div className="flex justify-between items-center mb-4">
      <div className="h-5 w-40 bg-zinc-700 rounded" />
      <div className="h-5 w-24 bg-zinc-700 rounded" />
    </div>
    <div className="space-y-2">
      <div className="h-4 w-full bg-zinc-700 rounded" />
      <div className="h-4 w-5/6 bg-zinc-700 rounded" />
      <div className="h-4 w-4/6 bg-zinc-700 rounded" />
    </div>
  </div>
);

// --------------------------- Reviews UI Components ---------------------------

const ReviewsList: React.FC<{
  productId: string;
  token?: string | null;
  currentUserId?: string | null;
  isAdmin?: boolean;
}> = ({ productId, token, currentUserId, isAdmin }) => {
  const [reviews, setReviews] = useState<ReviewShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replying, setReplying] = useState<Record<string, string>>({}); // map reviewId -> reply text
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});

  const meId = currentUserId ? String(currentUserId) : null;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_PRODUCT_REVIEWS(productId));
      if (!res.ok) throw new Error("Failed fetching reviews");
      const data: ReviewShape[] = await res.json();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Optimistic like / unlike toggle
  const toggleLike = async (reviewId: string) => {
    if (!token) return alert("Please login to like reviews.");
    if (!meId) return alert("Unknown user. Please login again.");

    // find current review and determine if currently liked by me
    const cur = reviews.find((r) => String(r._id) === reviewId);
    // Check if the current user's ID (normalized) is present in the likes array (normalized)
    const likedNow = cur
      ? Array.isArray(cur.likes)
        ? cur.likes.some((u) => normalizeId(u) === meId)
        : false
      : false;

    // optimistic update
    setReviews((prev) =>
      prev.map((r) => {
        if (String(r._id) !== reviewId) return r;
        const likedByArr = Array.isArray(r.likes) ? [...r.likes] : [];
        const newLikes = likedNow
          ? likedByArr.filter((u) => normalizeId(u) !== meId)
          : [...likedByArr, meId];

        return { ...r, likes: newLikes };
      })
    );

    // mark busy
    setActionBusy((s) => ({ ...s, [reviewId]: true }));

    try {
      const res = await fetch(API_REVIEW_LIKE(reviewId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        // Revert optimistic change on failure
        const body = await res.json().catch(() => ({}));
        console.error("Like failed response:", body);
        throw new Error(body.message || "Failed to toggle like");
      }
      // success -> re-fetch to sync with server (safer)
      // fetchReviews(); // Disabled to rely purely on optimistic update unless failed
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to toggle like. Reverting changes.");
      // on error, re-fetch to restore true state
      await fetchReviews().catch(() => {});
    } finally {
      setActionBusy((s) => ({ ...s, [reviewId]: false }));
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!token) return alert("Please login as admin to reply.");
    if (!isAdmin) return alert("Only admins can reply.");
    const message = replying[reviewId]?.trim();
    if (!message) return;
    setActionBusy((s) => ({ ...s, [reviewId]: true }));
    try {
      const res = await fetch(API_REVIEW_REPLY(reviewId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to reply");
      }
      setReplying((s) => ({ ...s, [reviewId]: "" }));
      await fetchReviews();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed reply");
    } finally {
      setActionBusy((s) => ({ ...s, [reviewId]: false }));
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center text-sm text-gray-400 py-3">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading reviews…
      </div>
    );
  if (error)
    return (
      <div className="text-sm text-red-400 p-3 bg-red-900/20 rounded">
        <AlertTriangle className="w-4 h-4 inline-block mr-2" />
        Error loading reviews.
      </div>
    );
  if (!reviews.length)
    return (
      <div className="text-sm text-gray-400 p-3 bg-zinc-700/20 rounded">
        <MessageCircle className="w-4 h-4 inline-block mr-2" />
        No reviews yet — be the first!
      </div>
    );

  return (
    <div className="space-y-4">
      {reviews.map((r) => {
        const reviewId = String(r._id);
        const reviewerName =
          typeof r.user === "string"
            ? "User"
            : (r.user as any).name || "Anonymous";
        const totalLikes = r.likes?.length ?? 0;
        const liked =
          Array.isArray(r.likes) && meId
            ? r.likes.some((uid) => normalizeId(uid) === meId)
            : false;
        const busy = !!actionBusy[reviewId];

        return (
          <div
            key={reviewId}
            className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="text-base font-semibold truncate text-white">
                    {reviewerName}
                  </div>
                  <div className="text-xs text-gray-400">
                    · {formatDateFriendly(r.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="inline-flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 fill-current ${
                          i < r.rating ? "text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-sm font-semibold ml-1">
                      {r.rating}.0
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-200 mt-3 whitespace-pre-wrap">
                  {r.comment}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => toggleLike(reviewId)}
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors duration-200 ${
                      liked
                        ? "bg-red-700/70 text-white hover:bg-red-600"
                        : "bg-zinc-700/50 text-gray-300 hover:bg-zinc-700/80"
                    }`}
                    disabled={busy || !token}
                  >
                    {busy ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Heart className="w-3 h-3 fill-current" />
                    )}
                    <span>{totalLikes}</span>
                  </button>
                  {/* Optionally add message button for non-admin users if you want them to reply too */}
                </div>

                {/* Replies */}
                {r.replies && r.replies.length > 0 && (
                  <div className="mt-4 space-y-2 border-l-2 border-sky-500/50 pl-3">
                    {r.replies.map((rep: any) => (
                      <div key={rep._id} className="bg-zinc-900/50 p-3 rounded">
                        <div className="flex items-center justify-between">
                          <div
                            className="text-xs font-bold"
                            style={{ color: ACCENT_COLOR }}
                          >
                            {rep.user?.name || "Admin"}
                            <span className="text-gray-400 ml-2 font-normal">
                              · {formatDateFriendly(rep.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                          {rep.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin reply box */}
              {isAdmin && (
                <div className="w-full sm:w-64 flex-shrink-0 mt-2">
                  <textarea
                    value={replying[reviewId] ?? ""}
                    onChange={(e) =>
                      setReplying((s) => ({ ...s, [reviewId]: e.target.value }))
                    }
                    className="w-full rounded p-2 bg-zinc-700/50 border border-zinc-600 text-sm text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-sky-500 transition"
                    placeholder="Reply as admin..."
                    rows={2}
                    disabled={busy}
                  />
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      onClick={() => submitReply(reviewId)}
                      disabled={busy || !replying[reviewId]?.trim()}
                      className="text-xs px-3 py-1 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700 transition disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="w-3 h-3 inline-block animate-spin mr-1" />
                      ) : (
                        "Reply"
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setReplying((s) => ({ ...s, [reviewId]: "" }))
                      }
                      disabled={busy}
                      className="text-xs px-3 py-1 rounded border border-zinc-600 text-gray-300 hover:bg-zinc-700/50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ReviewForm: React.FC<{
  productId: string;
  token?: string | null;
  onSaved?: () => void;
}> = ({ productId, token, onSaved }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submitReview = async () => {
    if (!token) return alert("Please login to review.");
    if (!comment.trim()) return alert("Please write a comment.");
    setBusy(true);
    try {
      const res = await fetch(API_PRODUCT_REVIEWS(productId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to save review");
      }
      setComment("");
      setRating(5);
      onSaved?.();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error saving review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 bg-zinc-800/40 p-4 rounded-lg border border-zinc-700 shadow-inner">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="text-sm font-semibold text-white">Your Rating:</div>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="bg-zinc-700/50 border border-zinc-600 rounded p-1 text-sm text-white focus:ring-1 focus:ring-sky-500 transition"
        >
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>
              {v} star{v > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review..."
        className="w-full mt-3 p-3 rounded bg-zinc-700/50 border border-zinc-600 text-sm text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-sky-500 transition"
        rows={3}
      />

      <div className="flex gap-3 justify-end mt-3">
        <button
          onClick={() => {
            setComment("");
            setRating(5);
          }}
          className="px-4 py-2 text-sm rounded border border-zinc-600 text-gray-300 hover:bg-zinc-700/50 transition"
          disabled={busy}
        >
          Cancel
        </button>
        <button
          onClick={submitReview}
          disabled={busy || !token || !comment.trim()}
          className="px-4 py-2 text-sm rounded bg-sky-600 text-white font-semibold hover:bg-sky-700 transition disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 inline-block animate-spin mr-1" />
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </div>
  );
};

// --------------------------- Main Page ---------------------------

const OrderHistoryPage: React.FC = () => {
  const router = useRouter();
  const auth = useMemo(loadAuthData, []);
  const token = auth.token;
  const currentUserId = auth.user
    ? (auth.user as any).id ?? (auth.user as any)._id ?? null
    : null;
  const isAdmin = (auth.user as any)?.role === "Admin";

  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0); // to force reviews lists to refresh after save

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError("You are not logged in. Please sign in to view orders.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_ORDERS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.status === 401 || res.status === 403) {
        // Clear token on expired session
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        throw new Error("Session expired. Please log in again.");
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to fetch orders.");
      }

      const data: OrderHistoryItem[] = await res.json();
      // Sort newest first
      setOrders(
        data.sort(
          (a, b) =>
            Number(
              new Date(normalizeId((b.createdAt as any).$date || b.createdAt))
            ) -
            Number(
              new Date(normalizeId((a.createdAt as any).$date || a.createdAt))
            )
        )
      );
    } catch (err: any) {
      console.error("Orders fetch error:", err);
      setError(err.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [token]); // removed router from dependency array

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (orderId: string) => {
    setExpandedMap((s) => ({ ...s, [orderId]: !s[orderId] }));
  };

  // helper to trigger review lists refresh after save
  const triggerReviewsRefresh = () => {
    // Immediate state update is fine in a custom function
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 p-4 sm:p-6 md:p-8">
      {/* Adjusted max-width for better mobile centering */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <ListOrdered className="w-9 h-9" style={{ color: PRIMARY_COLOR }} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Your Orders History
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Expand orders for details, track status, and leave product
                reviews.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 transition text-sm font-medium text-white shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" /> Continue Shopping
            </Link>

            <button
              onClick={fetchOrders}
              className="px-3 py-2 text-sm rounded-lg border border-zinc-700 text-gray-300 hover:bg-zinc-800 transition"
              aria-label="Refresh orders"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        )}

        {/* Error / Empty */}
        {!loading && (error || orders.length === 0) && (
          <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700 text-center shadow-2xl">
            <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/40 mb-5">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              {error ? "Error loading orders" : "No orders yet"}
            </h2>
            <p className="text-base text-gray-400 mb-6">
              {error ??
                "Looks like you haven't placed any orders yet. Start your journey!"}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/products"
                className="px-6 py-3 bg-sky-600 rounded-lg text-white text-base font-semibold hover:bg-sky-700 transition shadow-lg"
              >
                Start Shopping
              </Link>
              {error && (
                <button
                  onClick={fetchOrders}
                  className="px-6 py-3 border border-zinc-600 rounded-lg text-base text-gray-300 hover:bg-zinc-700 transition"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((ord) => {
              const idRaw = (ord._id as any)?.$oid ?? ord._id;
              const id = String(idRaw);
              const expanded = !!expandedMap[id];
              const itemsCount = ord.orderItems?.length ?? 0;

              // calculate safe totals (prefer provided fields)
              const itemsPrice =
                typeof ord.itemsPrice === "number"
                  ? ord.itemsPrice
                  : ord.orderItems?.reduce(
                      (s, it) => s + (it.price ?? 0) * (it.quantity ?? 1),
                      0
                    ) ?? 0;
              const shippingPrice =
                typeof ord.shippingPrice === "number" ? ord.shippingPrice : 0;
              const taxPrice =
                typeof ord.taxPrice === "number" ? ord.taxPrice : 0;
              const totalPrice =
                typeof ord.totalPrice === "number"
                  ? ord.totalPrice
                  : itemsPrice + shippingPrice + taxPrice;

              return (
                <article
                  key={id}
                  className="bg-zinc-800 rounded-xl border border-zinc-700 shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-700/30">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-mono text-gray-300 font-semibold">
                          #{getIdSuffix(id)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold truncate text-white">
                            Order on{" "}
                            {formatDateFriendly(
                              (ord.createdAt as any)?.$date ?? ord.createdAt
                            )}
                          </h3>
                          <span className="text-sm text-gray-400 hidden sm:inline">
                            · {itemsCount} items
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mt-1 sm:mt-0 truncate">
                          Method: {ord.paymentMethod ?? "N/A"}
                        </p>
                        <div className="mt-2 sm:hidden">
                          <StatusBadge order={ord} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div
                          className="text-lg font-extrabold text-white"
                          style={{ color: ACCENT_COLOR }}
                        >
                          {formatCurrency(totalPrice)}
                        </div>
                        <div className="text-xs text-gray-400">Total</div>
                      </div>

                      <div className="hidden sm:block">
                        <StatusBadge order={ord} />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Mobile/Desktop expand button */}
                        <button
                          onClick={() => toggleExpand(id)}
                          aria-expanded={expanded}
                          aria-controls={`order-${id}`}
                          className="p-2 rounded-full text-white hover:bg-zinc-700/50 transition border border-zinc-700"
                        >
                          {expanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable body */}
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        id={`order-${id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 sm:px-6 sm:pb-6 border-t border-zinc-700 bg-zinc-800/80"
                      >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 pt-5">
                          {/* Items & review area (Span 2 columns on desktop) */}
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-400 font-semibold mb-3 border-b border-zinc-700 pb-2">
                              Items Ordered ({itemsCount})
                            </p>

                            {/* Items list */}
                            <div className="space-y-4">
                              {ord.orderItems?.map((it, i) => {
                                const prodId = normalizeId(it.product);

                                return (
                                  <div
                                    key={`${id}-${i}`}
                                    className="flex flex-col sm:flex-row gap-4 bg-zinc-900/50 p-3 rounded-lg border border-zinc-700"
                                  >
                                    <div className="w-full sm:w-28 h-28 rounded-md overflow-hidden bg-zinc-700 flex items-center justify-center shrink-0 shadow-md">
                                      <img
                                        src={it.image || FALLBACK_IMAGE_URL}
                                        alt={it.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div className="min-w-0">
                                          <div className="text-sm font-bold text-white truncate">
                                            {it.name}
                                          </div>
                                          <div className="text-xs text-gray-400 mt-1">
                                            Qty: {it.quantity} @{" "}
                                            {formatCurrency(it.price)} each
                                          </div>
                                        </div>

                                        <div className="text-sm font-extrabold text-white flex-shrink-0">
                                          {formatCurrency(
                                            (it.price || 0) * (it.quantity || 1)
                                          )}
                                        </div>
                                      </div>

                                      {/* Review Section */}
                                      <div
                                        id={`reviews-for-${prodId}-${id}`}
                                        className="mt-4 pt-3 border-t border-zinc-800"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="text-xs text-gray-300 font-semibold">
                                            Product Reviews
                                          </div>
                                          <Link
                                            href={`/product/${prodId}`}
                                            className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
                                          >
                                            View Product Page{" "}
                                            <ExternalLink className="w-3 h-3" />
                                          </Link>
                                        </div>

                                        <ReviewForm
                                          productId={prodId}
                                          token={token}
                                          onSaved={triggerReviewsRefresh} // Trigger parent refresh key
                                        />
                                        <div className="mt-3">
                                          <ProductReviewsWrapper
                                            productId={prodId}
                                            token={token}
                                            currentUserId={currentUserId}
                                            isAdmin={isAdmin}
                                            refreshKeyTrigger={refreshKey}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right column: price breakdown + address + actions (1 column on desktop) */}
                          <div className="flex flex-col gap-6">
                            {/* Summary */}
                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700 shadow-md">
                              <p className="text-sm text-gray-400 font-bold mb-3 border-b border-zinc-700 pb-2">
                                Order Summary
                              </p>
                              <div className="text-sm text-gray-300 flex justify-between">
                                <span>Items Subtotal</span>
                                <span>{formatCurrency(itemsPrice)}</span>
                              </div>
                              <div className="text-sm text-gray-300 flex justify-between mt-1">
                                <span>Shipping</span>
                                <span>{formatCurrency(shippingPrice)}</span>
                              </div>
                              <div className="text-sm text-gray-300 flex justify-between mt-1">
                                <span>Tax</span>
                                <span>{formatCurrency(taxPrice)}</span>
                              </div>
                              <div
                                className="border-t border-zinc-700 mt-3 pt-3 text-lg font-extrabold flex justify-between text-white"
                                style={{ color: PRIMARY_COLOR }}
                              >
                                <span>Order Total</span>
                                <span>{formatCurrency(totalPrice)}</span>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700 shadow-md text-sm">
                              <p className="text-sm text-gray-400 font-bold mb-3 border-b border-zinc-700 pb-2">
                                Shipping & Contact
                              </p>
                              <div className="text-gray-200 space-y-1">
                                <div className="font-semibold">
                                  {ord.shippingAddress?.address ?? "N/A"}
                                </div>
                                <div className="text-sm">
                                  {ord.shippingAddress?.city ?? ""}{" "}
                                  {ord.shippingAddress?.postalCode
                                    ? `• ${ord.shippingAddress.postalCode}`
                                    : ""}
                                </div>
                                <div className="text-sm">
                                  {ord.shippingAddress?.country ?? ""}
                                </div>
                                {ord.shippingAddress?.note && (
                                  <div className="mt-2 text-xs text-gray-400 italic bg-zinc-800 p-2 rounded">
                                    Note: {ord.shippingAddress.note}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                              <Link
                                href={`/dashboard/customer/orders/${id}`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-zinc-600 hover:bg-zinc-700/50 transition text-base font-semibold text-white"
                              >
                                View Detailed Order{" "}
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              <button
                                onClick={() => {
                                  window.open(
                                    `/dashboard/customer/orders/${id}/receipt`,
                                    "_blank"
                                  );
                                }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-sky-600 text-white text-base font-semibold hover:bg-sky-700 transition shadow-lg"
                              >
                                Download Invoice
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------
    Helper wrapper components
    ------------------------- */

const ProductReviewsWrapper: React.FC<{
  productId: string;
  token?: string | null;
  currentUserId?: string | null;
  isAdmin?: boolean;
  refreshKeyTrigger?: number;
}> = ({ productId, token, currentUserId, isAdmin, refreshKeyTrigger }) => {
  // Key the child by productId + refreshKeyTrigger to force re-mount and re-fetch when refreshKeyTrigger changes
  // We use this to force a refresh on the ReviewsList after a new Review is submitted.
  const key = `${productId}-${refreshKeyTrigger ?? 0}`;
  return (
    <ReviewsList
      key={key}
      productId={productId}
      token={token}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
};

export default OrderHistoryPage;
