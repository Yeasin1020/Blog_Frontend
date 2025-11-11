"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  AlertTriangle,
  MapPin,
  Truck,
  RotateCcw,
  Search,
  Settings,
  Plus,
  Image as ImageIcon,
  Eye,
  Edit,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// --- ইন্টারফেস ডেফিনেশন (আপনার প্রোডাক্ট পেজ থেকে কপি করা) ---
interface CombinedVariant {
  options: { name: string; value: string }[];
  stock: number;
  priceAdjustment: number;
}
interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  countInStock: number; // Inventory এর জন্য ব্যবহৃত হবে
  imageUrls: string[];
  category: string;
  brand: string;
  variantDefinitions: { name: string; values: string[] }[];
  combinedVariants: CombinedVariant[];
  isFreeShipping: boolean;
}

// আপনার ব্যাকএন্ড যদি শুধু অ্যারে রিটার্ন করে
type SimpleProductsResponse = Product[];

// Mock Notifications (আপনার স্টাইল বজায় রেখে)
const toast = {
  success: (msg: string) => console.log(`TOAST SUCCESS: ${msg}`),
  error: (msg: string) => console.error(`TOAST ERROR: ${msg}`),
  loading: (msg: string) => msg,
  dismiss: (id?: string) => console.warn(`TOAST DISMISS ${id || ""}`),
};

// --- API সেটিংস এবং ডেটা ফেচ ফাংশন (Product পেজ থেকে কপি করা) ---
const API_URL = "https://ecommercebackend-teal.vercel.app/api/products";

const fetchProducts = async (): Promise<SimpleProductsResponse> => {
  // Token logic removed for simplicity in this public GET
  const url = API_URL;

  try {
    const response = await fetch(url, {
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

    const data: SimpleProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Inventory Fetch error (CORS/Network likely):", error);
    toast.error("Could not load inventory data. Check CORS.");
    return []; // Error হলে খালি অ্যারে
  }
};

// --- সেকশন কার্ড কম্পোনেন্ট (আপনার স্টাইল বজায় রেখে) ---
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-zinc-800 p-6 rounded-xl shadow-2xl border border-zinc-700">
    <h2 className="text-xl font-bold mb-4 border-b border-red-700/50 pb-2 text-red-400">
      {title}
    </h2>
    {children}
  </div>
);

// --- ✅ মূল ইনভেন্টরি কম্পোনেন্ট ---
export default function AdminInventoryListPage() {
  const router = useRouter();
  // Inventory হিসেবে প্রোডাক্টস লিস্ট ব্যবহার করা হচ্ছে
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      // প্রোডাক্টসের API থেকে ডেটা আনা হচ্ছে
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // স্টক ক্যালকুলেশন লজিক (Product পেজ থেকে কপি করা)
  const calculateTotalStock = (product: Product) => {
    if (product.combinedVariants?.length > 0) {
      return product.combinedVariants.reduce(
        (sum, variant) => sum + variant.stock,
        0
      );
    }
    return product.countInStock;
  };

  // ইনভেন্টরির জন্য কাস্টমাইজড সার্চ লজিক
  const filteredInventory = useMemo(() => {
    if (!searchTerm) return products;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerCaseSearch) ||
        item.slug.toLowerCase().includes(lowerCaseSearch) ||
        item._id.toLowerCase().includes(lowerCaseSearch) // SKU হিসেবে _id ব্যবহার করা হলো
    );
  }, [products, searchTerm]);

  // স্টকের স্ট্যাটাস নির্ধারণ (ইনভেন্টরির জন্য)
  const getStockStatus = (item: Product) => {
    const stock = calculateTotalStock(item);
    const lowStockThreshold = 10; // ডামি থ্রেশহোল্ড সেট করা হলো

    if (stock <= 0) {
      return {
        text: "Out of Stock",
        color: "text-red-500",
        icon: AlertTriangle,
      };
    }
    if (stock <= lowStockThreshold) {
      return {
        text: "Low Stock",
        color: "text-yellow-400",
        icon: AlertTriangle,
      };
    }
    return { text: "In Stock", color: "text-green-400", icon: Package };
  };

  const handleAdjustStock = (id: string) => {
    console.log(`Adjusting stock for Product ID: ${id}`);
    toast.loading(`Opening Stock Adjustment for ${id}`);
  };

  // লোডিং স্ক্রিন
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6 mt-12 bg-zinc-900 min-h-[calc(100vh-64px)] text-white overflow-x-hidden w-full">
      <header className="mb-8 border-b border-zinc-700 pb-4">
        <h1 className="text-3xl font-extrabold text-white flex items-center">
          Inventory Control Center 📦
        </h1>
        <p className="text-zinc-400 mt-1">
          Manage live stock levels and low stock alerts for all products.
        </p>
      </header>

      <div title="Live Stock Overview">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name, Slug, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <button
            onClick={() => console.log("Open Inventory Settings")}
            className="flex items-center px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center shadow-md shadow-zinc-900/30"
          >
            <Settings className="w-5 h-5 mr-2" /> Settings
          </button>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-700">
          <table className="min-w-full text-left text-sm text-gray-300">
            <thead>
              <tr className=" text-xs text-gray-400 uppercase bg-zinc-700/50">
                <th className="py-3 px-4 min-w-[280px]">Product Name & ID</th>
                <th className="py-3 px-4 min-w-[120px]">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-1" /> Total Stock
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[150px]">Status (Limit: 10)</th>
                <th className="py-3 px-4 min-w-[200px]">Location (Mock)</th>
                <th className="py-3 px-4 min-w-[150px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  const totalStock = calculateTotalStock(item);

                  return (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-zinc-700/50 hover:bg-zinc-700/30"
                    >
                      {/* Product Name & ID */}
                      <td className="py-3 px-4 font-semibold text-white min-w-[280px] truncate">
                        <div className="flex items-center space-x-3">
                          {item.imageUrls[0] ? (
                            <img
                              src={item.imageUrls[0]}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-md border border-zinc-600 flex-shrink-0"
                            />
                          ) : (
                            <ImageIcon className="w-10 h-10 p-2 text-zinc-400 bg-zinc-700 rounded-md" />
                          )}
                          <div className="min-w-0">
                            <span className="font-medium text-white block truncate">
                              {item.name}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono truncate">
                              ID: {item._id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td
                        className={`py-3 px-4 font-bold ${
                          totalStock <= 10
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {totalStock}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold flex items-center w-max ${
                            status.color === "text-red-500"
                              ? "bg-red-900/40 text-red-400"
                              : status.color === "text-yellow-400"
                              ? "bg-yellow-900/40 text-yellow-400"
                              : "bg-green-900/40 text-green-400"
                          }`}
                        >
                          <status.icon className="w-3 h-3 mr-1" />
                          {status.text}
                        </span>
                      </td>

                      {/* Location (Mock Data) */}
                      <td className="py-3 px-4 text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                          {item.category === "Electronics"
                            ? "Warehouse A, Rack 5"
                            : item.category === "Apparel"
                            ? "Warehouse B, Rack 1"
                            : "Warehouse C, Shelf 2"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/addProduct?id=${item._id}`
                              )
                            }
                            className="p-2 text-yellow-400 hover:bg-zinc-700/80 rounded-lg"
                            title="Edit Product Details"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item._id)}
                            className="p-2 text-blue-400 hover:bg-zinc-700/80 rounded-lg"
                            title="Adjust Stock Manually"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-lg text-zinc-500"
                  >
                    No products found in inventory. (Check API connection)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-start items-center mt-6 text-sm text-gray-400">
          <div>
            Showing {filteredInventory.length} of {products.length} total items.
          </div>
        </div>
      </div>
    </div>
  );
}
