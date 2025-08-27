"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// Utility to join class names
const clsx = (...args: (string | boolean | undefined | null)[]) =>
  args.filter(Boolean).join("");

// Post type
interface Post {
  _id: string;
  title: string;
  content: string;
  author?: string;
  createdAt: string;
}

// MagicCard component with hover animation
const MagicCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        "relative rounded-xl p-[1px] transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl"
      )}
      style={{
        background: isHovered
          ? `radial-gradient(250px circle at ${mousePos.x}px ${mousePos.y}px, #9E7AFF, #38bdf8, #FF5C5C, #FE8BBB, transparent 80%)`
          : "transparent",
      }}
    >
      <div className="bg-white rounded-xl p-5">{children}</div>
    </div>
  );
};

export default function BlogHomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* About Section */}
      <section className="bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20 px-6 sm:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-gray-900 mb-8 text-center"
          >
            Welcome to Our Community Blog
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white   "
          >
            <p className="text-gray-600 leading-relaxed text-lg sm:text-xl max-w-3xl mx-auto mb-6">
              This is a{" "}
              <span className="font-semibold text-indigo-600">
                community-driven blog
              </span>{" "}
              where anyone can share their knowledge, experiences, and stories.
              Whether you’re a{" "}
              <span className="font-medium text-gray-800">
                developer, designer, or writer
              </span>
              , your voice matters here.
            </p>

            <p className="text-gray-600 leading-relaxed text-lg sm:text-xl max-w-3xl mx-auto mb-10">
              Our mission is{" "}
              <span className="font-medium text-indigo-600">
                making blogging open and accessible
              </span>{" "}
              for everyone. Share your thoughts, inspire others, and be part of
              a growing community of storytellers.
            </p>

            {/* Categories */}
            <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto mb-10">
              <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100">
                <h3 className="font-semibold text-indigo-700 mb-2">
                  💡 Tech Tips
                </h3>
                <p className="text-sm text-gray-600">
                  Share tutorials, project ideas, or coding tricks.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-purple-50 border border-purple-100">
                <h3 className="font-semibold text-purple-700 mb-2">
                  📖 Life Stories
                </h3>
                <p className="text-sm text-gray-600">
                  Write about your journey, lessons, and experiences.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-pink-50 border border-pink-100">
                <h3 className="font-semibold text-pink-700 mb-2">
                  🎨 Creative Writing
                </h3>
                <p className="text-sm text-gray-600">
                  Express yourself with poems, short stories, or art.
                </p>
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/create-post"
                className="inline-block px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg transition transform hover:-translate-y-1 hover:scale-105"
              >
                ✍️ Start Writing Today
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
