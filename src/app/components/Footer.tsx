"use client";
import React from "react";
import {
  Mail,
  Phone,
  ShoppingCart,
  Send,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import Link from "next/link";

// --- Custom Base Color ---
const PRIMARY_COLOR = "#155DFC";
const PRIMARY_HOVER_COLOR = "#0047C4"; // Slightly darker for hover

// --- Link Data ---
interface LinkItem {
  name: string;
  href: string;
}

const companyLinks: LinkItem[] = [
  { name: "Our Story", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Affiliate Program", href: "/affiliate" },
  { name: "Blog", href: "/blog" },
];

const helpLinks: LinkItem[] = [
  { name: "Contact Us", href: "/contact" },
  { name: "Shipping Info", href: "/shipping" },
  { name: "Returns & Exchanges", href: "/returns" },
  { name: "FAQs", href: "/faq" },
];

const legalLinks: LinkItem[] = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Cookie Policy", href: "/cookies" },
];

// --- Main Footer Component ---
const Footer: React.FC = () => {
  return (
    // Outer Container: Dark background for contrast
    <footer className="bg-gray-900 pt-16 mt-16 text-white border-t-8 border-[#155DFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Top Section: Newsletter & Brand Info --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-700 pb-10">
          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center text-3xl font-extrabold"
              style={{ color: PRIMARY_COLOR }}
            >
              <ShoppingCart className="w-8 h-8 mr-2" />
              E-Mart
            </Link>
            <p className="text-sm text-gray-400 max-w-sm">
              Your one-stop destination for the latest gadgets and fashion
              trends. Trusted shopping, delivered fast.
            </p>
            <div className="space-y-2 pt-2">
              <p className="flex items-center text-sm text-gray-300">
                <Phone className="w-4 h-4 mr-3 text-red-400" />
                +880 1XXXXXXXXX
              </p>
              <p className="flex items-center text-sm text-gray-300">
                <Mail className="w-4 h-4 mr-3 text-red-400" />
                support@emart.com
              </p>
            </div>
          </div>

          {/* Column 2: Newsletter Signup */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-xl font-bold text-white">
              Join Our Newsletter
            </h3>
            <p className="text-sm text-gray-400">
              Get 10% off your first order by signing up!
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 text-gray-900 rounded-l-lg focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-r-lg text-white font-semibold flex items-center transition duration-200"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="flex space-x-4 pt-3">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-400 hover:text-white transition"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-400 hover:text-white transition"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-white transition"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Column 3: Quick Links (Merge Help & Legal for mobile optimization) */}
          <div className="grid grid-cols-2 gap-x-4 md:grid-cols-2 md:gap-x-10">
            {/* Help Links */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">
                Customer Help
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {helpLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="hover:text-red-400 transition"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="hover:text-red-400 transition"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar: Copyright and Payments --- */}
        <div className="flex flex-col md:flex-row justify-between items-center py-6 text-sm">
          <p className="text-gray-500 mb-3 md:mb-0">
            &copy; {new Date().getFullYear()} E-Mart. All rights reserved.
          </p>
          <div className="flex items-center space-x-3">
            <span className="text-gray-500 mr-2">We Accept:</span>
            {/* Placeholder Icons for payment methods (e.g., Visa, Mastercard, Bkash) */}
            <img
              src="https://placehold.co/40x20/F0F0F0/000000?text=VISA"
              alt="Visa"
              className="rounded"
            />
            <img
              src="https://placehold.co/40x20/F0F0F0/000000?text=MC"
              alt="Mastercard"
              className="rounded"
            />
            <img
              src="https://placehold.co/40x20/F0F0F0/000000?text=BKASH"
              alt="Bkash"
              className="rounded"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
