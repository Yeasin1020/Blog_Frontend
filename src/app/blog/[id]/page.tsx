"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { motion } from "framer-motion";

interface Post {
  _id: string;
  title: string;
  content: string;
  author?: string;
  createdAt: string;
}

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data) => setPost(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <p className="text-gray-400 text-base animate-pulse">Loading post...</p>
      </main>
    );

  if (!post)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <p className="text-red-500 text-base font-medium">Post not found</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" theme="colored" />

      {/* Back Button */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-800 font-medium transition flex items-center gap-1 text-sm sm:text-base"
        >
          ← Back to Posts
        </button>
      </motion.div>

      {/* Post Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 sm:p-8">
          <motion.h1
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight"
          >
            {post.title}
          </motion.h1>
          <motion.p
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-indigo-100 mt-1 text-xs sm:text-sm flex justify-between"
          >
            <span>By {post.author || "Anonymous"}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </motion.p>
        </div>

        {/* Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="p-6 sm:p-12 text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-line"
        >
          {post.content}
        </motion.article>

        {/* CTA */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="p-6 sm:px-12 pb-12 flex justify-center"
        >
          <Link
            href="/create-post"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg transition transform hover:-translate-y-1 hover:scale-105 text-sm sm:text-base"
          >
            Create Your Post
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
