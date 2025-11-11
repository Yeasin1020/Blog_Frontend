/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Truck,
  Package,
  Tag,
  Layers,
  Star,
  Info,
  Zap,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Heart,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Verified,
  Loader2,
  XCircle as XCircleIcon, // Renaming XCircle to avoid conflict if needed, though not strictly required here
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ------------------------------------------------------------------
  NOTE
  Full product details page including ReviewsPanel.
  NEW UI: Responsive improvements and toast notifications (react-toastify)
  Replaced alert(...) with toast(...) for better UX.
  ------------------------------------------------------------------ */

const API_BASE = "https://ecommercebackend-teal.vercel.app/api";
const API_URL = `${API_BASE}/products`;
const API_REVIEW_LIKE = (reviewId: string) =>
  `${API_BASE}/reviews/${reviewId}/like`;
const API_REVIEW_REPLY = (reviewId: string) =>
  `${API_BASE}/reviews/${reviewId}/reply`;

const FALLBACK_IMAGE_URL =
  "https://placehold.co/800x600/94A3B8/FFFFFF?text=No+Image";
const PRIMARY_COLOR = "#155DFC"; // Blue

/* ----------------- types ----------------- */

type Option = { name: string; value: string };
type Specification = { key: string; value: string };
type CombinedVariant = {
  options: Option[];
  sku: string;
  stock: number;
  priceAdjustment: number;
  hexCode?: string;
  variantImageUrl?: string;
};

type VariantDefinition = { name: string; values: string[] };

type ProductDetail = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  countInStock: number;
  description: string;
  longDescription?: string;
  imageUrls: string[];
  category?: string;
  brand?: string;
  material?: string;
  warranty?: string;
  specifications: Specification[];
  variantDefinitions: VariantDefinition[];
  combinedVariants: CombinedVariant[];
  rating?: number;
  numReviews?: number;
  isFreeShipping?: boolean;
};

type CartItem = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  selectedOptions: Option[];
};

type WishlistItem = {
  _id: string;
  name: string;
  slug: string;
  price: string | number;
  image: string;
};

type ReviewShape = {
  _id: string;
  user: { _id?: string; name?: string; role?: string } | string;
  rating: number;
  comment: string;
  likesCount?: number;
  likedBy?: string[];
  replies?: {
    _id?: string;
    user?: { name?: string };
    message?: string;
    createdAt?: string;
  }[];
  createdAt?: string;
};

/* ----------------- helpers ----------------- */

const loadStorage = (key: string) => {
  if (typeof window === "undefined") return [];
  try {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

const saveStorage = (key: string, items: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(items));
  }
};

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

const loadAuth = () => {
  if (typeof window === "undefined") return { token: null, user: null };
  const token = localStorage.getItem("userToken");
  const info = localStorage.getItem("userInfo");
  return { token: token ?? null, user: info ? JSON.parse(info) : null };
};

/* ----------------- API ----------------- */

const fetchProductBySlug = async (
  slug: string
): Promise<ProductDetail | null> => {
  try {
    const res = await fetch(`${API_URL}/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ProductDetail;
  } catch (e) {
    console.error("fetchProductBySlug error", e);
    return null;
  }
};

const mapReviewsData = (reviews: any[]): ReviewShape[] => {
  return reviews.map((review) => {
    const mappedLikedBy = Array.isArray(review.likes)
      ? (review.likes
          .map((like: any) =>
            typeof like === "string" ? like : like?.$oid || like?._id || ""
          )
          .filter(Boolean) as string[])
      : review.likedBy || [];

    return {
      ...review,
      likedBy: mappedLikedBy,
      likesCount: mappedLikedBy.length,
      _id: review._id?.$oid || review._id,
      user: review.user?.$oid || review.user,
      replies: review.replies?.map((reply: any) => ({
        ...reply,
        user:
          reply.user && typeof reply.user === "object"
            ? reply.user.name
              ? reply.user
              : { name: "Admin" }
            : { name: "Admin" },
      })),
    } as ReviewShape;
  });
};

const fetchReviewsByProductId = async (
  productId: string
): Promise<ReviewShape[]> => {
  try {
    const res = await fetch(`${API_URL}/${productId}/reviews`, {
      cache: "no-store",
    });
    if (!res.ok) return [];

    const rawReviews = (await res.json()) as any[];
    const mappedReviews = mapReviewsData(rawReviews);
    return mappedReviews;
  } catch (e) {
    console.error("fetchReviewsByProductId", e);
    return [];
  }
};

/* ----------------- ReviewsPanel component (NEW UI) ----------------- */

function ReviewsPanel({
  productId,
  token,
  currentUserId,
  isAdmin,
}: {
  productId: string;
  token: string | null;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const [reviews, setReviews] = useState<ReviewShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // NEW STATE: To track busy status for liking/unliking a specific review
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const revs = await fetchReviewsByProductId(productId);
      setReviews(revs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
    const onReviewsUpdated = () => setTimeout(load, 200);
    window.addEventListener("reviewsUpdated", onReviewsUpdated);
    return () => window.removeEventListener("reviewsUpdated", onReviewsUpdated);
  }, [load]);

  const toggleLike = async (reviewId: string) => {
    if (!token) return toast.info("Please login to like reviews.");

    const normalizedId = String(reviewId);

    // Set busy state immediately (Optimistic UI update start)
    setActionBusy((s) => ({ ...s, [normalizedId]: true }));

    setReviews((prev) =>
      prev.map((r) => {
        if (String(r._id) !== normalizedId) return r;
        const existing = r.likedBy || [];
        const has = existing.some((id) => String(id) === String(currentUserId));

        let newLikedBy: string[] = [];
        if (has)
          newLikedBy = existing.filter(
            (id) => String(id) !== String(currentUserId)
          );
        else
          newLikedBy = [...existing, currentUserId as string].filter(
            Boolean
          ) as string[];

        return {
          ...r,
          likedBy: newLikedBy,
          likesCount: newLikedBy.length,
        };
      })
    );

    // Asynchronous API call
    try {
      const res = await fetch(API_REVIEW_LIKE(reviewId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to toggle like");
      }

      // Success: Reload to sync with server state or rely on optimistic update
      // For simplicity and safety, we reload the whole review list here.
      await load();
    } catch (e: any) {
      console.error("toggleLike error, reverting state", e);
      toast.error(e?.message ?? "Failed to like. Reverting state.");
      // Force reload on failure to revert optimistic change
      await load();
    } finally {
      // Clear busy state
      setActionBusy((s) => ({ ...s, [normalizedId]: false }));
    }
  };

  const submitReply = async (reviewId: string, message: string) => {
    if (!token) return toast.info("Please login as admin to reply.");
    if (!isAdmin) return toast.warn("Only admins can reply.");
    if (!message.trim()) return;

    const normalizedId = String(reviewId);
    setActionBusy((s) => ({ ...s, [normalizedId]: true })); // Use actionBusy for reply too

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
      await load();
      toast.success("Reply posted");
    } catch (e: any) {
      console.error("submitReply", e);
      toast.error(e?.message ?? "Failed to reply");
    } finally {
      setActionBusy((s) => ({ ...s, [normalizedId]: false }));
    }
  };

  const { averageRating, totalRatings, starCounts } = useMemo(() => {
    let sum = 0;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviews.length === 0)
      return { averageRating: 0, totalRatings: 0, starCounts: counts };

    reviews.forEach((r) => {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating as keyof typeof counts]++;
      }
    });

    const avg = reviews.length > 0 ? sum / reviews.length : 0;
    return {
      averageRating: avg,
      totalRatings: reviews.length,
      starCounts: counts,
    };
  }, [reviews]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 mt-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-6 border-b border-gray-200">
        <div className="flex-shrink-0 text-center md:text-left">
          <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            {averageRating.toFixed(1)}
            <span className="text-lg sm:text-xl font-normal text-gray-500">
              /5
            </span>
          </p>
          <div className="flex justify-center md:justify-start mt-2">
            {/* Assuming renderRatingStars is a function */}
            {renderRatingStars(averageRating)}
          </div>
          <p className="text-sm text-gray-600 mt-1">{totalRatings} Ratings</p>
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 gap-2 mt-4 md:mt-0 md:ml-8">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star as keyof typeof starCounts];
            const percentage =
              totalRatings === 0 ? 0 : (count / totalRatings) * 100;
            return (
              <div key={star} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 w-4">
                  {star}
                </span>
                {/* Assuming Star is imported from lucide-react */}
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-3 sm:mb-0">
          Product Reviews
        </h3>
        {/* Responsive Sort & Filter controls (replace existing block with this) */}
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm w-full">
            {/* Left label (optional) */}
            <div className="hidden sm:block text-sm text-gray-600">
              Sort & Filter
            </div>

            {/* Buttons group */}
            <div
              role="group"
              aria-label="Sort and filter reviews"
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto"
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded="false"
                className="flex items-center justify-between sm:justify-center w-full sm:w-auto px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors border border-gray-200 shadow-sm whitespace-nowrap"
                title="Sort reviews"
              >
                {/* Assuming ArrowUpDown is imported from lucide-react */}
                <span className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <span className="hidden xs:inline-block sm:inline-block md:inline">
                    Sort:
                  </span>
                  <span className="font-semibold ml-1 truncate">Relevance</span>
                </span>
                {/* Assuming ChevronDown is imported from lucide-react */}
                <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
              </button>

              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded="false"
                className="flex items-center justify-between sm:justify-center w-full sm:w-auto px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors border border-gray-200 shadow-sm whitespace-nowrap"
                title="Filter reviews"
              >
                {/* Assuming Filter is imported from lucide-react */}
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="hidden xs:inline-block sm:inline-block md:inline">
                    Filter:
                  </span>
                  <span className="font-semibold ml-1 truncate">All stars</span>
                </span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-0">
        {loading ? (
          <div className="text-base text-gray-500 text-center py-8 flex items-center justify-center">
            {/* MODIFIED: Using Lucide Loader2 icon */}
            <Loader2 className="animate-spin h-5 w-5 mr-3 text-blue-500" />
            Loading customer feedback...
          </div>
        ) : error ? (
          <div className="text-base text-red-700 border border-red-400 bg-red-100 p-4 rounded-lg shadow-sm">
            {/* Assuming XCircle is imported from lucide-react */}
            <XCircleIcon className="w-5 h-5 mr-2 inline-block" />
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-base text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            No reviews yet 😞. Be the first to share your experience!
          </div>
        ) : (
          <ul className="space-y-8 px-3 sm:px-4">
            {reviews.map((r) => (
              <li
                key={r._id}
                className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0"
              >
                {/* Passing actionBusy state to ReviewItem */}
                <ReviewItem
                  review={r}
                  onLike={() => toggleLike(r._id)}
                  onReply={(msg) => submitReply(r._id, msg)}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  isLiking={!!actionBusy[r._id]} // Pass individual liking state
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ----------------- ReviewItem (Clean Design, suitable for dashboard style) ----------------- */

function ReviewItem({
  review,
  onLike,
  onReply,
  currentUserId,
  isAdmin,
  isLiking, // NEW PROP
}: {
  review: ReviewShape;
  onLike: () => void;
  onReply: (message: string) => void;
  currentUserId: string | null;
  isAdmin: boolean;
  isLiking: boolean; // NEW PROP TYPE
}) {
  const reviewer =
    typeof review.user === "string"
      ? "User"
      : (review.user as any).name ?? "User";

  const liked = (review.likedBy || []).some(
    (id) => String(id) === String(currentUserId)
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50 shadow-sm">
      <div className="flex-shrink-0 w-full sm:w-auto sm:max-w-[120px] text-center sm:text-left">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-100 flex items-center justify-center text-lg sm:text-xl font-semibold text-blue-700 mx-auto sm:mx-0 border-2 border-blue-200">
          {reviewer.charAt(0).toUpperCase()}
        </div>
        <p className="font-bold text-gray-800 mt-2 text-sm sm:text-base">
          {reviewer}
        </p>
        <p className="text-xs text-green-600 flex items-center justify-center sm:justify-start mt-1">
          <Verified className="w-3.5 h-3.5 mr-1 fill-green-500" /> Verified
          Purchase
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(review.createdAt || "").toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="inline-flex items-center text-yellow-500">
            {renderRatingStars(review.rating)}
          </div>
          <div className="text-sm font-semibold text-gray-700 ml-1">
            ({review.rating}/5)
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>

        {review.replies && review.replies.length > 0 && (
          <div className="mt-4 space-y-2 max-w-full">
            {review.replies.map((rep) => (
              <div
                key={rep._id}
                className="p-3 bg-red-50 border-l-4 border-red-300 rounded-lg text-sm"
              >
                <div className="font-semibold text-red-700 flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-red-500" />
                  Admin Reply ({rep.user?.name ?? "Company"})
                </div>
                <p className="text-gray-700 mt-1">{rep.message}</p>
                <div className="text-xs text-gray-500 mt-2">
                  Replied: {new Date(rep.createdAt || "").toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={onLike}
            disabled={isLiking} // Disable while liking/unliking
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-200 border ${
              liked
                ? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-md"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-blue-600"
            } ${isLiking ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {/* MODIFIED: Show Loader2 when isLiking is true */}
            {isLiking ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Heart
                className="w-4 h-4 transition-all duration-200"
                style={{
                  fill: liked ? "white" : "none",
                  color: liked ? "white" : "#6B7280",
                }}
              />
            )}

            <span className="font-extrabold">{review.likesCount ?? 0}</span>
          </button>

          {isAdmin && <AdminReplyBox onSubmit={onReply} />}
        </div>
      </div>
    </div>
  );
}

/* ----------------- AdminReplyBox (clean) ----------------- */

// ... (AdminReplyBox remains unchanged, assuming reply busy state is handled by button's disabled state)

function AdminReplyBox({ onSubmit }: { onSubmit: (message: string) => void }) {
  const [text, setText] = useState("");

  // Simple way to show loading on button. We'd ideally need a prop if the action is async.
  // For this context, we will modify the submit button to show a temporary busy state.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const message = text.trim();
    if (!message) return;

    setIsSubmitting(true);
    // Assuming onSubmit is an async function (or calls one, like submitReply)
    // However, since it's a prop, we can't await it here unless we change the prop signature.
    // For now, we will just call it and reset the state with a small delay for UX.
    onSubmit(message);

    // A small delay to keep the spinner visible for UX
    setTimeout(() => {
      setText("");
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="w-full sm:w-auto flex-1 max-w-sm ml-auto sm:ml-0">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        rows={2}
        placeholder="Reply as admin..."
        disabled={isSubmitting}
      />
      <div className="flex gap-2 mt-1 justify-end">
        <button
          onClick={() => setText("")}
          className="px-3 py-1 text-xs border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            "Reply"
          )}
        </button>
      </div>
    </div>
  );
}

/* ----------------- small util (stars) ----------------- */

const renderRatingStars = (rating?: number) => {
  const r = rating && rating > 0 ? rating : 0;
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  return Array.from({ length: 5 }).map((_, i) => {
    if (i < full) {
      return (
        <Star
          key={i}
          className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500"
        />
      );
    } else if (i === full && half) {
      return (
        <div key={i} className="relative w-4 h-4 sm:w-5 sm:h-5">
          <Star
            className="absolute top-0 left-0 w-full h-full text-yellow-500 fill-yellow-500"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
          <Star
            className="absolute top-0 left-0 w-full h-full text-gray-300 fill-gray-300"
            style={{ clipPath: "inset(0 0 0 50%)" }}
          />
        </div>
      );
    } else {
      return (
        <Star
          key={i}
          className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 fill-gray-300"
        />
      );
    }
  });
};

/* ----------------- Main Page (Full Code) ----------------- */

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const router = useRouter();
  const auth = useMemo(() => loadAuth(), []);
  const token = auth.token;
  const currentUserId = auth.user
    ? (auth.user as any).id ?? (auth.user as any)._id ?? null
    : null;
  const isAdmin = auth.user?.role === "Admin";

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [isImageLoading, setIsImageLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);

  const loadProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const p = await fetchProductBySlug(slug);
    setProduct(p);
    if (p) {
      setSelectedImage(p.imageUrls?.[0] ?? FALLBACK_IMAGE_URL);
      const initialVariants: Record<string, string> = {};
      (p.variantDefinitions || []).forEach((def) => {
        initialVariants[def.name] =
          (p.combinedVariants && p.combinedVariants.length > 0
            ? p.combinedVariants[0].options.find((opt) => opt.name === def.name)
                ?.value
            : undefined) || def.values[0];
      });
      setSelectedVariants(initialVariants);
    } else {
      setSelectedVariants({});
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const currentCombinedVariant = useMemo(() => {
    if (!product) return null;
    if (!product.variantDefinitions || product.variantDefinitions.length === 0)
      return null;
    const allSelected = product.variantDefinitions.every(
      (d) => !!selectedVariants[d.name]
    );
    if (!allSelected) return null;
    return product.combinedVariants?.find((v) =>
      v.options.every((opt) => selectedVariants[opt.name] === opt.value)
    );
  }, [product, selectedVariants]);

  const currentStock = currentCombinedVariant
    ? currentCombinedVariant.stock
    : product?.countInStock ?? 0;
  const isOutOfStock = currentStock <= 0;

  const getDisplayPrice = () => {
    if (!product) return 0;
    let base = product.discountPrice ?? product.price;
    if (currentCombinedVariant && currentCombinedVariant.priceAdjustment)
      base = currentCombinedVariant.priceAdjustment;
    return base;
  };
  const displayPrice = getDisplayPrice();
  const isDiscounted = product ? displayPrice < (product.price ?? 0) : false;

  useEffect(() => {
    const imageUrl =
      currentCombinedVariant?.variantImageUrl ??
      product?.imageUrls?.[0] ??
      FALLBACK_IMAGE_URL;
    setSelectedImage(imageUrl);
    setIsImageLoading(true);
  }, [currentCombinedVariant, product]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;
    const newItem: WishlistItem = {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.discountPrice || product.price,
      image: product.imageUrls?.[0] || FALLBACK_IMAGE_URL,
    };
    const currentWishlist: WishlistItem[] = loadStorage("wishlistItems");
    const exists = currentWishlist.some((it) => it._id === newItem._id);
    if (exists) {
      const updated = currentWishlist.filter((it) => it._id !== newItem._id);
      saveStorage("wishlistItems", updated);
      toast.info(`${product.name} removed from wishlist`);
    } else {
      currentWishlist.push(newItem);
      saveStorage("wishlistItems", currentWishlist);
      toast.success(`${product.name} added to wishlist`);
    }
    window.dispatchEvent(new Event("localStorageChange"));
    setProduct({ ...(product as ProductDetail) });
  };

  const isProductInWishlist = useMemo(() => {
    if (!product || typeof window === "undefined") return false;
    const list: WishlistItem[] = loadStorage("wishlistItems");
    return list.some((i) => i._id === product._id);
  }, [product]);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) {
      toast.error("This item is out of stock.");
      return;
    }
    if (product.variantDefinitions?.length > 0) {
      const ok = product.variantDefinitions.every(
        (d) => !!selectedVariants[d.name]
      );
      if (!ok || !currentCombinedVariant) {
        toast.warn("Please select all options");
        return;
      }
    }
    if (quantity < 1) {
      toast.warn("Quantity must be at least 1");
      return;
    }
    if (quantity > currentStock) {
      toast.warn(`Only ${currentStock} available`);
      setQuantity(currentStock);
      return;
    }
    const cart = loadCartFromStorage();
    const options = Object.entries(selectedVariants).map(([name, value]) => ({
      name,
      value,
    }));
    const optionsKey = options.map((o) => `${o.name}:${o.value}`).join("|");
    const idx = cart.findIndex(
      (c) =>
        c._id === product._id &&
        (c.selectedOptions || [])
          .map((o) => `${o.name}:${o.value}`)
          .join("|") === optionsKey
    );
    const price =
      currentCombinedVariant?.priceAdjustment ??
      product.discountPrice ??
      product.price;
    if (idx > -1) {
      const newQty = cart[idx].quantity + quantity;
      if (newQty > currentStock) {
        toast.warn(`Stock limit ${currentStock}`);
        return;
      }
      cart[idx].quantity = newQty;
      toast.info("Cart updated");
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: price as number,
        image:
          currentCombinedVariant?.variantImageUrl ??
          product.imageUrls?.[0] ??
          FALLBACK_IMAGE_URL,
        quantity,
        selectedOptions: options,
      });
      toast.success("Added to cart");
    }
    saveCartToStorage(cart);
    window.dispatchEvent(new Event("localStorageChange"));
  };

  const handleOrderNow = () => {
    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }

    // Add to cart (this shows toast inside if success)
    handleAddToCart();

    // Small safety: ensure cart saved (saveCartToStorage is synchronous),
    // then navigate to checkout route.
    try {
      // navigate to checkout page (adjust path if different)
      router.push("/checkout");
      // optional toast after navigation attempt
      toast.success("Redirecting to checkout…");
    } catch (err) {
      console.error("Navigation error:", err);
      toast.error("Could not navigate to checkout. Please try again.");
    }
  };

  const renderColorVariant = (hexCode: string, isSelected: boolean) => (
    <div
      key={hexCode}
      onClick={() => {
        setSelectedVariants((s) => ({ ...s, Color: hexCode }));
        setQuantity(1);
        setIsImageLoading(true);
      }}
      className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
        isSelected ? "ring-2 ring-red-300" : "border-gray-300"
      }`}
      style={{
        backgroundColor: hexCode,
        borderColor: isSelected ? PRIMARY_COLOR : "#ccc",
      }}
      title={hexCode}
    >
      {isSelected && (
        <CheckCircle
          className="w-3 h-3"
          style={{
            color: hexCode.toLowerCase() === "#ffffff" ? "#000" : "#fff",
          }}
        />
      )}
    </div>
  );

  const renderTextVariant = (
    name: string,
    value: string,
    isSelected: boolean
  ) => (
    <button
      key={value}
      onClick={() => handleVariantChange(name, value)}
      className={`px-3 py-1.5 text-xs font-normal rounded-full transition-colors duration-200 border ${
        isSelected
          ? "text-white shadow-lg border-red-500"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300 border-gray-300"
      }`}
      style={{
        backgroundColor: isSelected ? PRIMARY_COLOR : "",
        borderColor: isSelected ? PRIMARY_COLOR : "",
      }}
    >
      {value}
    </button>
  );

  function handleVariantChange(variantName: string, value: string) {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: value }));
    setQuantity(1);
    setIsImageLoading(true);
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > currentStock) return currentStock > 0 ? currentStock : 1;
      return next;
    });
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

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-10">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          404 - Product Not Found
        </h1>
        <p className="text-gray-600">
          The product you are looking for does not exist or the API failed to
          load.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-2 sm:p-4 md:p-6">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-4 md:p-8 border border-gray-200">
        <div className="mb-4 border-b border-gray-200 pb-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium">{product.brand}</span> /{" "}
            {product.category}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1">
            <div
              className={`mb-3 aspect-[4/4] md:aspect-square relative rounded-xl shadow-lg border border-gray-300 overflow-hidden ${
                isImageLoading ? "bg-gray-200 animate-pulse" : ""
              }`}
            >
              {selectedImage && (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  onLoadingComplete={() => setIsImageLoading(false)}
                />
              )}
            </div>

            {(product.imageUrls.length > 1 ||
              currentCombinedVariant?.variantImageUrl) && (
              <div className="flex space-x-2 overflow-x-auto p-2 justify-center bg-gray-50 rounded-lg border border-gray-200">
                {product.imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImage(url);
                      setIsImageLoading(true);
                    }}
                    className={`relative w-14 h-14 min-w-14 rounded-md cursor-pointer border-2 transition-all duration-200 overflow-hidden ${
                      url === selectedImage
                        ? "ring-2 ring-red-200"
                        : "border-gray-300 hover:border-red-300"
                    }`}
                    style={{
                      borderColor: url === selectedImage ? PRIMARY_COLOR : "",
                    }}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} - ${idx + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="56px"
                    />
                  </div>
                ))}
                {currentCombinedVariant?.variantImageUrl &&
                  currentCombinedVariant.variantImageUrl !==
                    product.imageUrls[0] && (
                    <div
                      onClick={() => {
                        setSelectedImage(
                          currentCombinedVariant.variantImageUrl!
                        );
                        setIsImageLoading(true);
                      }}
                      className={`relative w-14 h-14 min-w-14 rounded-md cursor-pointer border-2 transition-all duration-200 overflow-hidden ${
                        currentCombinedVariant.variantImageUrl === selectedImage
                          ? "ring-2 ring-red-200"
                          : "border-gray-300 hover:border-red-300"
                      }`}
                      style={{
                        borderColor:
                          currentCombinedVariant.variantImageUrl ===
                          selectedImage
                            ? PRIMARY_COLOR
                            : "",
                      }}
                    >
                      <Image
                        src={currentCombinedVariant.variantImageUrl!}
                        alt={`${product.name} variant`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="56px"
                      />
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 border-b lg:border-none border-gray-300 pb-6 lg:pb-0">
            <div className="flex items-end justify-between mb-4 border-b border-gray-200 pb-3">
              <div>
                <p
                  className={`text-3xl sm:text-4xl font-extrabold ${
                    isDiscounted ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  ${displayPrice.toFixed(2)}
                </p>
                {isDiscounted && (
                  <p className="text-sm font-medium text-gray-500 line-through mt-1">
                    Original: ${product.price.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end">
                <div className="flex">
                  {renderRatingStars(product.rating ?? 0)}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  ({product.numReviews ?? 0} Reviews)
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Quick Overview: {product.description}
            </p>

            {(product.variantDefinitions || []).map((def) => (
              <div key={def.name} className="mb-4">
                <h4 className="text-base font-medium mb-2 text-gray-700 flex items-center">
                  <Zap
                    className="w-4 h-4 mr-1.5"
                    style={{ color: PRIMARY_COLOR }}
                  />
                  {def.name}:{" "}
                  <span className="font-normal ml-1 text-gray-500">
                    {selectedVariants[def.name] || "Select an option"}
                  </span>
                </h4>
                <div
                  className={`flex ${
                    def.name === "Color" ? "space-x-2" : "space-x-1.5"
                  } flex-wrap gap-y-1`}
                >
                  {def.values.map((v) => {
                    const isSelected = selectedVariants[def.name] === v;
                    if (
                      def.name === "Color" &&
                      (v.startsWith("#") ||
                        v.toLowerCase() === "black" ||
                        v.toLowerCase() === "white")
                    ) {
                      const hex = v.startsWith("#")
                        ? v
                        : v.toLowerCase() === "black"
                        ? "#000000"
                        : "#ffffff";
                      return renderColorVariant(hex, isSelected);
                    }
                    return renderTextVariant(def.name, v, isSelected);
                  })}
                </div>
              </div>
            ))}

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-inner mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 text-sm">
                  Status:
                </span>
                <span
                  className={`text-base font-medium ${
                    isOutOfStock
                      ? "text-red-600"
                      : currentStock > 0 && currentStock <= 10
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : currentStock > 0 && currentStock <= 10
                    ? `Only ${currentStock} left!`
                    : "In Stock"}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <label className="font-medium text-gray-700 text-sm w-20">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-8 h-8 flex items-center justify-center text-lg bg-gray-200 hover:bg-gray-300"
                    disabled={isOutOfStock || quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={currentStock > 0 ? currentStock : 1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value || "1", 10);
                      if (!isNaN(val) && val >= 1)
                        setQuantity(
                          Math.min(val, currentStock > 0 ? currentStock : 1)
                        );
                    }}
                    className="w-12 h-8 text-center text-sm text-gray-800 border-x border-gray-300 focus:outline-none"
                    disabled={isOutOfStock}
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 flex items-center justify-center text-lg bg-gray-200 hover:bg-gray-300"
                    disabled={isOutOfStock || quantity >= currentStock}
                  >
                    +
                  </button>
                </div>

                <button
                  title={
                    isProductInWishlist
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }
                  onClick={handleToggleWishlist}
                  className="p-1.5 rounded-full transition-all duration-200 ml-auto flex-shrink-0 hover:bg-gray-200"
                  disabled={isOutOfStock}
                >
                  <Heart
                    className="w-5 h-5"
                    style={{
                      fill: isProductInWishlist ? PRIMARY_COLOR : "none",
                      color: isProductInWishlist ? PRIMARY_COLOR : "#6B7280",
                    }}
                  />
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddToCart}
                disabled={
                  isOutOfStock || quantity <= 0 || quantity > currentStock
                }
                className="w-1/2 py-2.5 text-white font-bold text-sm rounded-xl shadow-xl transition duration-300 flex items-center justify-center"
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  opacity: isOutOfStock ? 0.6 : 1,
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />{" "}
                {isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
              </button>
              <button
                onClick={handleOrderNow}
                disabled={
                  isOutOfStock || quantity <= 0 || quantity > currentStock
                }
                className="w-1/2 py-2.5 text-white font-bold text-sm rounded-xl shadow-xl transition duration-300 flex items-center justify-center"
                style={{
                  backgroundColor: "#FF5722",
                  opacity: isOutOfStock ? 0.6 : 1,
                }}
              >
                <Tag className="w-4 h-4 mr-2" /> ORDER NOW
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-inner">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" style={{ color: PRIMARY_COLOR }} />{" "}
              Detailed Overview
            </h3>

            <p className="text-xs text-gray-700 leading-normal mb-4 whitespace-pre-wrap">
              {product.longDescription ?? product.description}
            </p>

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-semibold text-gray-800 border-t border-gray-200 pt-3">
                Key Information
              </h4>
              <p className="flex items-center text-xs text-gray-600">
                <Truck
                  className="w-4 h-4 mr-2"
                  style={{ color: PRIMARY_COLOR }}
                />
                <span className="font-medium w-16">Shipping:</span>
                <span className="ml-1">
                  {product.isFreeShipping
                    ? "FREE Shipping"
                    : "Calculated at Checkout"}
                </span>
              </p>
              <p className="flex items-center text-xs text-gray-600">
                <Layers
                  className="w-4 h-4 mr-2"
                  style={{ color: PRIMARY_COLOR }}
                />
                <span className="font-medium w-16">Material:</span>
                <span className="ml-1">{product.material ?? "N/A"}</span>
              </p>
              <p className="flex items-center text-xs text-gray-600">
                <Tag
                  className="w-4 h-4 mr-2"
                  style={{ color: PRIMARY_COLOR }}
                />
                <span className="font-medium w-16">Warranty:</span>
                <span className="ml-1">{product.warranty ?? "N/A"}</span>
              </p>
            </div>

            {product.specifications?.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-gray-800 border-t border-gray-200 pt-3 mb-2">
                  Technical Specifications
                </h4>
                <ul className="space-y-1 text-xs">
                  {product.specifications.map((spec, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between border-b border-gray-200/50 pb-1 last:border-b-0"
                    >
                      <span className="text-gray-500">{spec.key}</span>
                      <span className="font-normal text-gray-800">
                        {spec.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="mt-8">
          <ReviewsPanel
            productId={product._id}
            token={token}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  );
}
