"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import BlogListSkeleton from "./BlogListSkeleton";

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

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://blogbackend-lime.vercel.app/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 max-w-7xl mx-auto">
      {/* Page Heading */}
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Latest Blog Posts
      </h1>

      {/* Loading state */}
      {loading && <BlogListSkeleton></BlogListSkeleton>}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500 py-10">No posts available.</p>
      )}

      {/* Posts Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post._id} href={`/blog/${post._id}`}>
            <MagicCard>
              <h2 className="text-xl font-bold text-indigo-600 mb-2">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-4">
                {post.content}
              </p>
              <div className="mt-3 flex justify-between items-center text-gray-500 text-xs">
                <span>✍️ {post.author || "Anonymous"}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </MagicCard>
          </Link>
        ))}
      </div>
    </main>
  );
}
