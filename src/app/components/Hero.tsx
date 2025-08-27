"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Welcome to <span className="text-indigo-600">Blog Master</span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mx-auto md:mx-0">
            A place to share knowledge, insights, and stories. Explore posts
            from different authors or publish your own ideas with just a click.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link
              href="/blogs-list"
              className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition w-full sm:w-auto text-center"
            >
              View Blogs
            </Link>
            <Link
              href="/create-post"
              className="px-5 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 font-medium hover:border-gray-400 transition w-full sm:w-auto text-center"
            >
              Create Blog
            </Link>
          </div>
        </motion.div>

        {/* Right Side Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center md:justify-end mt-8 md:mt-0"
        >
          <Image
            src="https://res.cloudinary.com/dwg8d0bfp/image/upload/v1756258771/9626fca3-b2e6-4a6f-ba57-0066d758ef9d_tjvmyy-removebg-preview_qfcuuv.png"
            alt="Blog illustration"
            width={400}
            height={400}
            priority
            className="w-full max-w-sm md:max-w-md h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
