"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
// import toast from 'react-hot-toast'; // ✅ Uncomment this line if you installed the library

// --- Type Definitions (Backend Response Matching) ---
interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  message: string;
}

// --- Constants ---
const API_BASE_URL = "https://ecommercebackend-teal.vercel.app/api";

// --- Mock Toast (Replace with actual toast function if not using react-hot-toast) ---
// For demonstration purposes, we define a mock toast if the real one isn't imported.
const toast = {
  success: (msg: string) => console.log(`Toast SUCCESS: ${msg}`),
  error: (msg: string) => console.log(`Toast ERROR: ${msg}`),
};
// ----------------------------------------------------------------------------------

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse & { message?: string } = await res.json();

      if (res.ok && data.token) {
        // ✅ Login Successful: Save token and user info to Local Storage
        localStorage.setItem("userToken", data.token);
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
          })
        );

        // ✅ Show Success Toast
        toast.success(data.message || "Welcome back!");

        // Redirect user based on role
        // Using router.refresh() after successful login ensures Navbar re-reads Local Storage immediately.
        router.refresh();
        router.push(
          data.role === "Admin" ? "/dashboard/admin" : "/dashboard/customer"
        );
      } else {
        // Handle login failure
        const errorMessage =
          data.message || "Login failed. Invalid credentials.";
        setError(errorMessage);
        // ✅ Show Error Toast
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = "Network error. Could not connect to the server.";
      setError(errorMessage);
      // ✅ Show Network Error Toast
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <LogIn className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Continue your shopping experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
