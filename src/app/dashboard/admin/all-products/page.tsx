// src/app/dashboard/admin/products/AdminProductListPage.tsx

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Zap,
  Image as ImageIcon,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// --- ইন্টারফেস ডেফিনেশন ---
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
  countInStock: number;
  imageUrls: string[];
  category: string;
  brand: string;
  variantDefinitions: { name: string; values: string[] }[];
  combinedVariants: CombinedVariant[];
  isFreeShipping: boolean;
}

// যেহেতু এখন পেজিনেশন বাদ দেওয়া হয়েছে, API রেসপন্সও সরল হবে।
// যদি আপনার API এখন সরাসরি Product[] রিটার্ন করে, তবে এই ইন্টারফেসটি বাদ দিন।
// কিন্তু যেহেতু আপনার আগের Express রুট পেজিনেশন রেসপন্স দিচ্ছিল, আমি ধরে নিচ্ছি
// এটি এখন একটি বড় অ্যারে (Product[]) রিটার্ন করবে।
// API যদি শুধু Array of Products দেয়, তবে ProductsResponse interface টি সিম্পল হবে।
// যদি API এখন শুধু একটি অ্যারে (Product[]) রিটার্ন করে, তবে কোডটি সেই অনুযায়ী সরল করা হলো:
type SimpleProductsResponse = Product[];

// Mock Notifications (No Change)
const toast = {
  success: (msg: string) => console.log(`TOAST SUCCESS: ${msg}`),
  error: (msg: string) => console.error(`TOAST ERROR: ${msg}`),
  loading: (msg: string) => msg,
  dismiss: (id?: string) => console.warn(`TOAST DISMISS ${id || ""}`),
};

// --- API সেটিংস ---
const API_URL = "https://ecommercebackend-teal.vercel.app/api/products";

// --- ✅ আসল ডেটা ফেচ ফাংশন (পেজিনেশন প্যারামিটার বাদ) ---
const fetchProducts = async (): Promise<SimpleProductsResponse> => {
  const token = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo") as string).token
    : null;

  // URL এ কোনো প্যারামিটার নেই, শুধু বেস রুট
  const url = API_URL;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}`,
      },
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

    // যেহেতু পেজিনেশন বাদ দেওয়া হয়েছে, ধরে নিচ্ছি API এখন সরাসরি প্রোডাক্টসের অ্যারে রিটার্ন করবে
    const data: SimpleProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error (CORS/Network likely):", error);
    toast.error("Could not load products. Please check server logs/CORS.");
    return []; // এরর হলে একটি খালি অ্যারে রিটার্ন করা হচ্ছে
  }
};

// --- ✅ আসল ডিলিট ফাংশন (কোনো পরিবর্তন নেই) ---
const deleteProductApi = async (id: string): Promise<boolean> => {
  const token = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo") as string).token
    : null;

  if (!token) {
    toast.error("Authentication token missing. Please log in as Admin.");
    return false;
  }

  const loadingToastId = toast.loading("Deleting product...");
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    toast.dismiss(loadingToastId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete product");
    }

    toast.success("Product deleted successfully!");
    return true;
  } catch (error) {
    toast.dismiss(loadingToastId);
    console.error("Delete error:", error);
    toast.error("Could not delete product. " + (error as Error).message);
    return false;
  }
};

// --- সেকশন কার্ড কম্পোনেন্ট (No Change) ---
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

// --- ✅ মূল কম্পোনেন্ট (পেজিনেশন স্টেট এবং সার্চিং লজিক বাদ) ---
export default function AdminProductListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // *** পেজিনেশন এবং সার্চিং স্টেটগুলি বাদ দেওয়া হলো ***

  // Fetch data function (এখন কোনো প্যারামিটার গ্রহণ করে না)
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(); // কোনো আর্গুমেন্ট পাঠানো হচ্ছে না
      setProducts(data); // সরাসরি প্রোডাক্টসের অ্যারে সেট করা হচ্ছে
      // যেহেতু পেজিনেশন নেই, totalResults হবে অ্যারের length
      // setTotalResults(data.length);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const calculateTotalStock = (product: Product) => {
    if (product.combinedVariants?.length > 0) {
      return product.combinedVariants.reduce(
        (sum, variant) => sum + variant.stock,
        0
      );
    }
    return product.countInStock;
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/admin/addproduct?id=${id}`);
  };

  const handleAddProduct = () => {
    router.push("/dashboard/admin/addproduct");
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete product: "${name}"? This action cannot be undone.`
      )
    ) {
      const success = await deleteProductApi(id);
      if (success) {
        loadProducts();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-12 bg-zinc-900 min-h-[calc(100vh-64px)] text-white overflow-x-hidden w-full">
      <header className="mb-8 border-b border-zinc-700 pb-4">
        <h1 className="text-3xl font-extrabold text-white flex items-center">
          Product Catalog Management 🛍️
        </h1>
      </header>

      <div title="Manage Products ">
        {/* *** সার্চ ইনপুট এবং পেজিনেশন লজিক বাদ দেওয়া হয়েছে *** */}
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={handleAddProduct}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center shadow-md shadow-red-900/30"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Product
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl  border-zinc-700">
          <table className="min-w-full text-left text-sm text-gray-300">
            <thead>
              <tr className=" text-xs text-gray-400 uppercase bg-zinc-700/50">
                <th className="py-3 px-4 min-w-[240px]">
                  Product Name & Status
                </th>
                <th className="py-3 px-4 min-w-[150px]">Category</th>
                <th className="py-3 px-4 min-w-[120px]">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" /> Price
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[100px]">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-1" /> Stock
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[120px]">Variants</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-zinc-700/50 hover:bg-zinc-700/30"
                  >
                    <td className="py-3 px-4 font-semibold text-white min-w-[240px] truncate">
                      <div className="flex items-center space-x-3">
                        {product.imageUrls[0] ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-md border border-zinc-600 flex-shrink-0"
                          />
                        ) : (
                          <ImageIcon className="w-10 h-10 p-2 text-zinc-400 bg-zinc-700 rounded-md" />
                        )}
                        <div className="min-w-0">
                          <span className="font-medium text-white block truncate">
                            {product.name}
                          </span>
                          {product.isFreeShipping && (
                            <span className="text-xs text-blue-400 flex items-center mt-0.5 truncate">
                              <Truck className="w-3 h-3 mr-1" /> Free Shipping
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-400">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">
                          {product.brand}
                        </span>
                        <span className="text-xs font-mono bg-zinc-700/50 p-1 rounded mt-1 text-red-300 truncate">
                          {product.category}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {product.discountPrice ? (
                        <>
                          <span className="block text-lg font-bold text-green-400">
                            ${product.discountPrice.toFixed(2)}
                          </span>
                          <span className="block text-xs text-red-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-white">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-sm whitespace-nowrap">
                      {calculateTotalStock(product) < 50 ? (
                        <span className="text-red-400 font-bold flex items-center">
                          {calculateTotalStock(product)}
                          <TrendingDown className="w-4 h-4 ml-1" />
                        </span>
                      ) : (
                        <span className="text-green-400 font-bold">
                          {calculateTotalStock(product)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {product.variantDefinitions.length > 0 ? (
                        <span className="text-xs bg-red-800/50 text-red-300 px-2 py-1 rounded-full flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {product.variantDefinitions
                            .slice(0, 2)
                            .map((def) => def.name)
                            .join(", ")}{" "}
                          ({product.combinedVariants.length})
                        </span>
                      ) : (
                        <span className="text-xs bg-zinc-600/50 text-zinc-300 px-2 py-1 rounded-full">
                          Simple Item
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2 justify-end min-w-[120px]">
                        <button
                          onClick={() => console.log(`View ${product.slug}`)}
                          className="p-2 text-blue-400 hover:bg-zinc-700/80 rounded-lg"
                          title="View Product Page"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(product._id)}
                          className="p-2 text-yellow-400 hover:bg-zinc-700/80 rounded-lg"
                          title="Edit Product"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(product._id, product.name)
                          }
                          className="p-2 text-red-500 hover:bg-zinc-700/80 rounded-lg"
                          title="Delete Product"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-lg text-zinc-500"
                  >
                    No products found. (Check your network and CORS settings)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* *** পেজিনেশন UI বাদ দেওয়া হলো *** */}
        <div className="flex justify-start items-center mt-6 text-sm text-gray-400">
          <div>
            Showing {products.length} of {products.length} results (All
            products)
          </div>
        </div>
      </div>
    </div>
  );
}
