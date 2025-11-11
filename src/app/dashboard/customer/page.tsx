/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  ListOrdered,
  Heart,
  MapPin,
  Clock,
  User as UserIcon,
  TrendingUp,
  XCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- API CONFIG ---
const PRIMARY_COLOR = "#155DFC";
const API_BASE_URL = "https://ecommercebackend-teal.vercel.app/api";
const MY_ORDERS_API = `${API_BASE_URL}/orders/myorders`;
const MOCK_REVIEWS = 10;

// --- INTERFACES ---
interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: "Customer" | "Admin" | "Guest";
}

interface OrderHistoryItem {
  _id: { $oid: string };
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: { $date: string };
  orderItems: { name: string; quantity: number }[];
}

interface KPICardProps {
  title: string;
  value: string | number;
  trendValue?: string;
  icon: React.ReactNode;
  color: string;
}

// --- HELPERS ---
const loadAuthData = (): { user: UserInfo | null; token: string | null } => {
  if (typeof window === "undefined") return { user: null, token: null };
  const storedInfo = localStorage.getItem("userInfo");
  const storedToken = localStorage.getItem("userToken");
  if (storedInfo && storedToken) {
    return { user: JSON.parse(storedInfo), token: storedToken };
  }
  return { user: null, token: null };
};

const loadWishlistCount = (): number => {
  if (typeof window === "undefined") return 0;
  try {
    const wishlistItems = JSON.parse(
      localStorage.getItem("wishlistItems") || "[]"
    );
    return wishlistItems.length;
  } catch {
    return 0;
  }
};

// --- CUSTOM HOOK ---
const useOrdersData = () => {
  const [data, setData] = useState<OrderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authData = useMemo(loadAuthData, []);

  const fetchData = useCallback(async () => {
    if (!authData.token) {
      setError("Authentication required.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(MY_ORDERS_API, {
        headers: { Authorization: `Bearer ${authData.token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch orders.");
      const orders: OrderHistoryItem[] = await res.json();
      setData(orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authData.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, authUser: authData.user };
};

// --- COMPONENTS ---
const Card: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`bg-zinc-800 p-5 sm:p-6 rounded-xl shadow-xl border border-zinc-700 ${className}`}
  >
    <div className="flex justify-between items-center mb-3 sm:mb-4 pb-2 border-b border-zinc-700">
      <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trendValue,
  icon,
  color,
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 150 }}
    className="bg-zinc-800 hover:bg-zinc-700/50 transition p-4 sm:p-5 rounded-xl border border-zinc-700 shadow-lg flex items-center justify-between"
  >
    <div>
      <div className="text-xs sm:text-sm font-medium text-gray-400">
        {title}
      </div>
      <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-white truncate">
        {value}
      </div>
      {trendValue && (
        <div className="mt-1 sm:mt-2 flex items-center text-xs font-semibold text-green-400">
          <TrendingUp className="w-3 h-3 mr-1" /> {trendValue}
        </div>
      )}
    </div>
    <div
      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full"
      style={{ backgroundColor: color + "22", color }}
    >
      {icon}
    </div>
  </motion.div>
);

const SpendingChart = ({ orders }: { orders: OrderHistoryItem[] }) => {
  const chartData = useMemo(() => {
    return orders.slice(0, 6).map((order) => ({
      date: new Date(order.createdAt.$date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      total: order.totalPrice,
    }));
  }, [orders]);

  return (
    <Card title="Spending Overview" className="lg:col-span-2">
      <div className="h-56 sm:h-64 md:h-72">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip contentStyle={{ background: "#222", border: "none" }} />
              <Line
                type="monotone"
                dataKey="total"
                stroke={PRIMARY_COLOR}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center mt-8">
            No spending data yet.
          </p>
        )}
      </div>
    </Card>
  );
};

const ActivityFeed = ({
  orders,
  wishlistCount,
}: {
  orders: OrderHistoryItem[];
  wishlistCount: number;
}) => {
  const recentActivity = [
    ...orders.slice(0, 3).map((o) => ({
      label: `Order #${String(o._id.$oid).slice(-5)} placed.`,
      icon: <ShoppingCart className="w-4 h-4 text-blue-400" />,
    })),
    {
      label: `${wishlistCount} items in wishlist`,
      icon: <Heart className="w-4 h-4 text-pink-400" />,
    },
    {
      label: `${MOCK_REVIEWS} product reviews`,
      icon: <Star className="w-4 h-4 text-yellow-400" />,
    },
  ];

  return (
    <Card title="Recent Activity">
      <div className="space-y-3 sm:space-y-4">
        {recentActivity.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm text-gray-300"
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// --- MAIN DASHBOARD ---
export default function CustomerDashboard() {
  const { data: orders, isLoading, error, authUser } = useOrdersData();
  const wishlistCount = loadWishlistCount();

  const { totalOrders, totalSpent, avgOrderValue } = useMemo(() => {
    if (!orders.length)
      return { totalOrders: 0, totalSpent: 0, avgOrderValue: "0.00" };
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((s, o) => s + o.totalPrice, 0);
    return {
      totalOrders,
      totalSpent,
      avgOrderValue: (totalSpent / totalOrders).toFixed(2),
    };
  }, [orders]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-900">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600" />
      </div>
    );

  if (error && !orders.length)
    return (
      <div className="text-center p-8 bg-zinc-800 rounded-xl max-w-lg mx-auto mt-10">
        <XCircle className="w-10 h-10 mx-auto text-red-500 mb-3" />
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
          Error Loading Data
        </h2>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center md:text-left"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-200 text-transparent bg-clip-text">
            Welcome back, {authUser?.name.split(" ")[0] || "Customer"} 👋
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Here’s your personalized dashboard overview.
          </p>
        </motion.div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <KPICard
            title="Total Orders"
            value={totalOrders}
            trendValue="1 new this month"
            icon={<ListOrdered />}
            color="#EF4444"
          />
          <KPICard
            title="Total Spent"
            value={`$${totalSpent.toFixed(2)}`}
            trendValue="+15%"
            icon={<DollarSign />}
            color="#10B981"
          />
          <KPICard
            title="Avg. Order Value"
            value={`$${avgOrderValue}`}
            trendValue="Stable"
            icon={<ShoppingCart />}
            color={PRIMARY_COLOR}
          />
          <KPICard
            title="Wishlist Items"
            value={wishlistCount}
            trendValue={`+${MOCK_REVIEWS} reviews`}
            icon={<Heart />}
            color="#F59E0B"
          />
        </div>

        {/* CHART + ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SpendingChart orders={orders} />
          <ActivityFeed orders={orders} wishlistCount={wishlistCount} />
        </div>

        {/* ACCOUNT CARD */}
        <Card title="Account Overview">
          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-300">
            <p className="flex flex-wrap items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-400" /> Name:{" "}
              <span className="font-semibold">{authUser?.name || "Guest"}</span>
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" /> Email:{" "}
              <span className="font-semibold">{authUser?.email || "N/A"}</span>
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" /> Member Since:{" "}
              <span className="font-semibold">
                {authUser ? "Dec 2024 (Mock)" : "Not Logged In"}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/dashboard/customer/settings"
              className="flex-1 px-3 py-2 text-sm rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white text-center transition"
            >
              Manage Profile
            </Link>
            <Link
              href="/products"
              className="flex-1 px-3 py-2 text-sm rounded-lg font-medium border border-zinc-700 hover:bg-zinc-700/50 text-center transition"
            >
              Continue Shopping
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
