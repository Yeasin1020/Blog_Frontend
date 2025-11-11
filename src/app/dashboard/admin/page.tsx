/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-sync-scripts */
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  // Import the necessary utility type from Recharts
  PieLabelRenderProps,
} from "recharts";
import {
  DownloadCloud,
  Users,
  ShoppingCart,
  DollarSign,
  Settings,
  Search,
  Plus,
  Mail,
  TrendingUp,
  TrendingDown,
  MoreVertical,
} from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";

// --------------------------- Mock Data Helpers ---------------------------
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateSalesByDay = (days = 30) => {
  const arr: { date: string; revenue: number; orders: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    arr.push({
      date: d.toISOString().slice(5, 10).replace("-", "/"), // MM/DD
      revenue: Math.round(500 + Math.random() * 4500),
      orders: randomInt(10, 120),
    });
  }
  return arr;
};

const generateTopProducts = (n = 8) => {
  const categories = ["Electronics", "Apparel", "Home", "Beauty", "Sports"];
  return Array.from({ length: n }).map((_, i) => ({
    id: `P-${1000 + i}`,
    name:
      [
        `Wireless Headphones`,
        `Premium T-Shirt`,
        `Smart Blender`,
        `Organic Skincare`,
        `Pro Yoga Mat`,
      ][i % 5] + ` #${i + 1}`,
    sold: randomInt(50, 1200),
    revenue: randomInt(2000, 40000),
    category: categories[i % categories.length],
  }));
};

const trafficSources = [
  { name: "Google Organic", value: 38.5, color: "#EF4444" },
  { name: "Facebook Ads", value: 25.1, color: "#3B82F6" },
  { name: "Direct", value: 15.4, color: "#F59E0B" },
  { name: "Instagram", value: 12.0, color: "#8B5CF6" },
  { name: "Other Referrals", value: 9.0, color: "#10B981" },
];

const ordersList = Array.from({ length: 24 }).map((_, i) => ({
  id: `ORD-${3000 + i}`,
  customer: ["Alice Green", "Michael Lee", "Sara Khan", "John Doe"][i % 4],
  total: (randomInt(2000, 12000) / 100).toFixed(2),
  status: ["Completed", "Processing", "Canceled", "Shipped"][i % 4],
  date: new Date(Date.now() - i * 1000 * 60 * 60 * 24)
    .toISOString()
    .slice(0, 10),
}));

const COLORS = ["#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6", "#10B981"];
const GRID_COLOR = "#4B5563";
const TEXT_COLOR = "#D1D5DB";

// --------------------------- Core Interfaces ---------------------------
interface KPICardProps {
  title: string;
  value: string | number;
  trendValue: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

interface SalesTrendChartProps {
  salesData: ReturnType<typeof generateSalesByDay>;
  selectedRange: number;
  setSelectedRange: (r: number) => void;
}

interface RecentOrdersTableProps {
  paginatedOrders: any[];
  filteredOrdersCount: number;
  page: number;
  perPage: number;
  setPage: (p: number) => void;
  className?: string;
}

// --------------------------- Reusable Components ---------------------------

const Card: React.FC<
  HTMLMotionProps<"div"> & {
    title: string;
    children: React.ReactNode | any;
  }
> = ({ title, children, className = "", ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-zinc-800 p-6 rounded-xl shadow-2xl border border-zinc-700 ${className}`}
    {...rest}
  >
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-700">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
    </div>
    {children}
  </motion.div>
);

// KPI card
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trendValue,
  trend,
  icon,
}) => {
  const isUp = trend === "up";
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const trendClass = isUp
    ? "text-green-400 bg-green-900/30"
    : "text-red-400 bg-red-900/30";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
      className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 shadow-lg flex items-center justify-between"
    >
      <div>
        <div className="text-sm font-medium text-gray-400">{title}</div>
        <div className="mt-1 text-3xl font-extrabold text-white">{value}</div>
        <div
          className={`mt-2 flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trendClass}`}
        >
          <TrendIcon className="w-3 h-3 mr-1" />
          {trendValue} vs last period
        </div>
      </div>
      <div className="w-12 h-12 bg-zinc-700/50 rounded-full flex items-center justify-center text-red-400">
        {icon}
      </div>
    </motion.div>
  );
};

// --------------------------- Dashboard Modules ---------------------------

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  salesData,
  selectedRange,
  setSelectedRange,
}) => (
  <Card title="Sales & Orders Trend" className="lg:col-span-2">
    <div className="flex items-center justify-end mb-4">
      <select
        value={selectedRange}
        onChange={(e) => setSelectedRange(Number(e.target.value))}
        className="text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-gray-300 px-3 py-1 focus:ring-red-500 focus:border-red-500"
      >
        <option value={7}>Last 7 days</option>
        <option value={14}>Last 14 days</option>
        <option value={30}>Last 30 days</option>
        <option value={90}>Last 90 days</option>
      </select>
    </div>
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={salesData}
          margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            stroke={GRID_COLOR}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke={GRID_COLOR}
            tick={{ fill: TEXT_COLOR, fontSize: 12 }}
            hide={salesData.length > 20}
          />
          <YAxis
            stroke={GRID_COLOR}
            tick={{ fill: TEXT_COLOR, fontSize: 12 }}
            tickFormatter={(value) =>
              `$${((value as number) / 1000).toFixed(1)}k`
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#D1D5DB" }}
            formatter={(value, name) => [
              name === "revenue"
                ? `$${(value as number).toLocaleString()}`
                : value,
              name === "revenue" ? "Revenue" : "Orders",
            ]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#EF4444"
            strokeWidth={3}
            dot={false}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 2 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const TrafficSourceChart: React.FC = () => (
  <Card title="Traffic Sources">
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={trafficSources}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            labelLine={false}
            // ✅ FIX: Using PieLabelRenderProps to correctly type the argument,
            // resolving the "percent: unknown" arithmetic error.
            label={({ percent }: PieLabelRenderProps) =>
              `${(((percent as number) || 0) * 100).toFixed(0)}%`
            }
          >
            {trafficSources.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#D1D5DB" }}
            formatter={(value) => [`${(value as number).toFixed(1)}%`, "Share"]}
          />
          <Legend
            layout="vertical"
            verticalAlign="bottom"
            align="left"
            wrapperStyle={{
              color: TEXT_COLOR,
              fontSize: "12px",
              paddingLeft: "20px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const TopProductChart: React.FC<{
  topProducts: ReturnType<typeof generateTopProducts>;
}> = ({ topProducts }) => (
  <Card title="Top Selling Products" className="lg:col-span-1">
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={topProducts.slice(0, 5)}
          layout="vertical"
          margin={{ left: 10, right: 30 }}
        >
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" />
          <XAxis
            type="number"
            stroke={GRID_COLOR}
            tick={{ fill: TEXT_COLOR, fontSize: 12 }}
            tickFormatter={(value) =>
              `${(value as number).toLocaleString()} units`
            }
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke={GRID_COLOR}
            tick={{ fill: TEXT_COLOR, fontSize: 12 }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#D1D5DB" }}
            formatter={(value, name, props) => [
              `$${(props.payload as any).revenue.toLocaleString()}`,
              "Revenue",
            ]}
          />
          <Bar
            dataKey="sold"
            name="Units Sold"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  paginatedOrders,
  filteredOrdersCount,
  page,
  perPage,
  setPage,
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(filteredOrdersCount / perPage));

  const getStatusClass = useCallback((status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400 border border-green-500/50";
      case "Processing":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50";
      case "Shipped":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/50";
      case "Canceled":
      case "Refunded":
        return "bg-red-500/20 text-red-400 border border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  }, []);

  return (
    <Card title="Recent Orders" className={className}>
      {/* Ensure horizontal scroll on small devices for the table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead>
            <tr className="text-xs text-gray-400 uppercase border-b border-zinc-700">
              <th className="py-3 pr-4">Order ID</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Total</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors"
              >
                <td className="py-3 pr-4 font-mono text-red-300">{o.id}</td>
                <td className="py-3 pr-4">{o.customer}</td>
                <td className="py-3 pr-4 font-semibold">${o.total}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-400 text-xs">{o.date}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      View
                    </button>
                    <button className="text-sm text-red-400 hover:text-red-300">
                      Refund
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-gray-400">
        <div className="text-sm">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-zinc-700 rounded-lg text-sm bg-zinc-700/50 hover:bg-zinc-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-zinc-700 rounded-lg text-sm bg-zinc-700/50 hover:bg-zinc-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
};

const QuickActionsAndSettings: React.FC = () => (
  <Card title="Actions & Settings" className="mt-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Quick Actions */}
      <div>
        <h4 className="font-semibold mb-2 text-red-400">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-md">
            <Plus className="w-4 h-4 inline mr-1" /> New Discount
          </button>
          <button className="px-3 py-2 border border-zinc-600 text-gray-300 rounded-lg text-sm bg-zinc-700/50 hover:bg-zinc-700 transition-colors">
            <Settings className="w-4 h-4 inline mr-1" /> Sync Inventory
          </button>
          <button className="px-3 py-2 border border-zinc-600 text-gray-300 rounded-lg text-sm bg-zinc-700/50 hover:bg-zinc-700 transition-colors">
            <Mail className="w-4 h-4 inline mr-1" /> Newsletter
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h4 className="font-semibold mb-2 text-red-400">Notifications</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-start space-x-3 bg-zinc-700/30 p-2 rounded-lg">
            <Mail className="w-5 h-5 text-red-400 mt-1" />
            <div>
              <div className="font-medium text-white">New product review</div>
              <div className="text-xs text-gray-400">3 hours ago</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 bg-zinc-700/30 p-2 rounded-lg">
            <Users className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <div className="font-medium text-white">10 new signups</div>
              <div className="text-xs text-gray-400">Yesterday</div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Settings */}
      <div>
        <h4 className="font-semibold mb-2 text-red-400">Store Settings</h4>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-center justify-between">
            <div>Auto inventory sync</div>
            <input
              type="checkbox"
              defaultChecked
              className="form-checkbox text-red-600 bg-zinc-600 border-zinc-500 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>Public store</div>
            <input
              type="checkbox"
              defaultChecked
              className="form-checkbox text-red-600 bg-zinc-600 border-zinc-500 rounded"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-700">
            <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Save settings
            </button>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

// --------------------------- Main Dashboard Component ---------------------------

export default function AdminDashboard() {
  const [salesData, setSalesData] = useState(generateSalesByDay(30));
  const [topProducts] = useState(generateTopProducts(8));
  const [orders] = useState(ordersList);
  const [query, setQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState<number>(30);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const totals = useMemo(() => {
    const revenue = salesData.reduce((s, x) => s + x.revenue, 0);
    const ordersCount = salesData.reduce((s, x) => s + x.orders, 0);
    const avgOrder = ordersCount ? +(revenue / ordersCount).toFixed(2) : 0;
    const customers = 1248;
    return { revenue, ordersCount, avgOrder, customers };
  }, [salesData]);

  const filteredOrders = useMemo(() => {
    if (!query) return orders;
    return orders.filter((o) =>
      [o.id, o.customer, o.status, o.date]
        .join("|")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [orders, query]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredOrders.slice(start, start + perPage);
  }, [filteredOrders, page]);

  const filteredOrdersCount = filteredOrders.length;

  useEffect(() => {
    setSalesData(generateSalesByDay(selectedRange));
  }, [selectedRange]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const exportOrdersCSV = useCallback(() => {
    const headers = ["Order ID", "Customer", "Total", "Status", "Date"];
    const rows = filteredOrders.map((r) => [
      r.id,
      r.customer,
      r.total,
      r.status,
      r.date,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredOrders]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header and Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-400">
              Summary of store performance and management tools
            </p>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 shadow-md w-full sm:w-auto">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders, customers..."
                className="outline-none text-sm bg-zinc-800 text-white placeholder-gray-500 w-full"
              />
            </div>
            <button
              onClick={exportOrdersCSV}
              className="inline-flex items-center justify-center px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg shadow-md text-sm transition-colors"
            >
              <DownloadCloud className="w-4 h-4 mr-2" /> Export
            </button>
          </div>
        </div>

        {/* KPI Row - Fully Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title={`Revenue (last ${selectedRange} days)`}
            value={`$${totals.revenue.toLocaleString()}`}
            trendValue="+5.2%"
            trend="up"
            icon={<DollarSign className="w-6 h-6" />}
          />
          <KPICard
            title="Total Orders"
            value={totals.ordersCount.toLocaleString()}
            trendValue="-1.1%"
            trend="down"
            icon={<ShoppingCart className="w-6 h-6" />}
          />
          <KPICard
            title="Avg Order Value"
            value={`$${totals.avgOrder}`}
            trendValue="+2.5%"
            trend="up"
            icon={<DollarSign className="w-6 h-6" />}
          />
          <KPICard
            title="Total Customers"
            value={totals.customers.toLocaleString()}
            trendValue="+8.9%"
            trend="up"
            icon={<Users className="w-6 h-6" />}
          />
        </div>

        {/* Charts Row - Fully Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SalesTrendChart
            salesData={salesData}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
          />
          <TrafficSourceChart />
        </div>

        {/* Bottom Row - Fully Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <TopProductChart topProducts={topProducts} />
          <RecentOrdersTable
            paginatedOrders={paginatedOrders}
            filteredOrdersCount={filteredOrdersCount}
            page={page}
            perPage={perPage}
            setPage={setPage}
            className="lg:col-span-2"
          />
        </div>

        {/* Final Actions Row */}
        <QuickActionsAndSettings />

        <footer className="mt-10 text-sm text-gray-600 text-center border-t border-zinc-700 pt-6">
          Built with ❤️ • E-Commerce Admin Dashboard
        </footer>
      </div>
    </div>
  );
}
