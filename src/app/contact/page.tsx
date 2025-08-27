"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Message sent successfully!");
        form.reset();
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (err) {
      toast.error("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-20 px-6 sm:px-12 lg:px-24">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-4xl mx-auto">
        {/* Page Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-gray-900 text-center mb-4"
        >
          Contact Us
        </motion.h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12 text-lg">
          Have questions, feedback, or want to share your ideas? Fill out the
          form below or reach us directly at{" "}
          <span className="font-semibold text-indigo-600">
            support@yourblog.com
          </span>
          .
        </p>

        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 space-y-6"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-sm px-4 py-3 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-sm px-4 py-3 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              placeholder="What’s this about?"
              className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-sm px-4 py-3 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              rows={5}
              placeholder="Write your message..."
              className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-sm px-4 py-3 transition"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-4 text-sm text-gray-500">
              Or connect with us
            </span>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-8">
          <a
            href="#"
            className="text-gray-600 hover:text-indigo-600 transition text-lg font-medium"
          >
            🌐 Facebook
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-indigo-600 transition text-lg font-medium"
          >
            🐦 Twitter
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-indigo-600 transition text-lg font-medium"
          >
            💼 LinkedIn
          </a>
        </div>
      </div>
    </main>
  );
}
