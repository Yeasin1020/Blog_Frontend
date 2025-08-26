/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 grid md:grid-cols-3 gap-8">
        {/* Branding */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-indigo-600">MyBlog</h2>
          <p className="text-gray-600 max-w-xs">
            Sharing knowledge, stories, and insights. Stay updated with the
            latest posts.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col md:flex-row gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Company</h3>
            <ul className="space-y-1 text-gray-600">
              <li>
                <a href="/" className="hover:text-indigo-600 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-indigo-600 transition">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-indigo-600 transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="/new" className="hover:text-indigo-600 transition">
                  New Post
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-4 md:items-end">
          <h3 className="font-semibold text-gray-900 mb-2">Follow Us</h3>
          <div className="flex gap-3">
            <a
              href="#"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} MyBlog. All rights reserved.
      </div>
    </footer>
  );
}
