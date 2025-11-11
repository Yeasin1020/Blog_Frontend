// src/components/AddProductForm.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Tag,
  List,
  Plus,
  X,
  Save,
  DollarSign,
  Package,
  Truck,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Hash,
  LucideIcon,
  Palette,
  Link,
  Maximize,
  Ruler,
  Shield,
  Shuffle,
  PaintBucket, // New icon for Color Value input
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- UPDATED TYPE DEFINITIONS (Matching Backend) ---

interface Specification {
  key: string;
  value: string;
}

// Represents a single variant type definition (e.g., Color: ["Red", "Blue"])
interface VariantDefinition {
  name: string; // e.g., "Color", "Size"
  values: string; // Comma-separated string for input (e.g., "Red, Blue, Green")
  parsedValues: string[]; // Array of values (e.g., ["Red", "Blue", "Green"])
  isColor: boolean; // NEW: To quickly identify color variants
}

// Represents a single combined product variant (e.g., Red-Small)
interface CombinedVariant {
  // Array of {name: "Color", value: "Red"} objects
  options: { name: string; value: string }[];
  sku: string;
  stock: number;
  priceAdjustment: number;
  hexCode: string;
  variantImageUrl: string;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  material: string;
  warranty: string;
  price: number;
  discountPrice: number | null;
  countInStock: number;
  isFreeShipping: boolean;
  imageUrls: string[];
  category: string;
  brand: string;
  tags: string;
  specifications: Specification[];

  variantDefinitions: VariantDefinition[];
  combinedVariants: CombinedVariant[];
}

// --- Initial Data Structures ---
const initialSpecification: Specification = { key: "", value: "" };
const initialVariantDefinition: VariantDefinition = {
  name: "",
  values: "",
  parsedValues: [],
  isColor: false,
};
const initialCombinedVariant: CombinedVariant = {
  options: [],
  sku: "",
  stock: 0,
  priceAdjustment: 0,
  hexCode: "#000000",
  variantImageUrl: "",
};

const initialFormData: FormData = {
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  material: "",
  warranty: "",
  price: 0.01,
  discountPrice: null,
  countInStock: 1,
  isFreeShipping: false,
  imageUrls: [],
  category: "",
  brand: "",
  tags: "",
  specifications: [initialSpecification],
  variantDefinitions: [
    {
      name: "Color",
      values: "Red, Blue, Black",
      parsedValues: ["Red", "Blue", "Black"],
      isColor: true,
    },
    {
      name: "Size",
      values: "Small, Large",
      parsedValues: ["Small", "Large"],
      isColor: false,
    },
  ], // Initial helpful setup
  combinedVariants: [],
};

// Mock implementation for toast notifications (Unchanged)
const toast = {
  success: (msg: string, opts?: { id: string }) =>
    console.log(`TOAST SUCCESS: ${msg} (id: ${opts?.id})`),
  error: (msg: string, opts?: { id: string }) =>
    console.error(`TOAST ERROR: ${msg} (id: ${opts?.id})`),
  loading: (msg: string) => `loading-${Date.now()}`,
  dismiss: () => console.warn(`TOAST DISMISS`),
};

// --- Helper Components for UI elements ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name?: keyof FormData | string;
  value: string | number | readonly string[] | undefined;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "checkbox"
    | "color"
    | "url";
  placeholder?: string;
  className?: string;
  icon?: LucideIcon;
  wrapperClass?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  icon: Icon,
  wrapperClass = "",
  ...rest
}) => {
  const renderInput = () => {
    if (type === "color") {
      // This is the dedicated Hex/Color picker used in Combined Variants
      return (
        <div className="flex items-center space-x-2 w-full">
          {/* The Color Swatch Picker */}
          <input
            type="color"
            name={name}
            value={value as string}
            onChange={onChange as any}
            className="w-10 h-10 p-0 border-none rounded-lg cursor-pointer bg-zinc-800 focus:ring-red-500 focus:border-red-500"
            {...rest}
          />
          {/* The Hex Code Display/Input */}
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange as any}
            placeholder={placeholder || "#RRGGBB"}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>
      );
    }
    return (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange as any}
        placeholder={placeholder}
        step={type === "number" && name !== "countInStock" ? "0.01" : "1"}
        min={0}
        className={`w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-red-500 focus:border-red-500 transition-colors ${className}`}
        {...rest}
      />
    );
  };

  return (
    <div className={`space-y-1 ${wrapperClass}`}>
      {label && (
        <label className="text-sm font-medium text-gray-300 flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-2 text-red-400" />}
          {label}
        </label>
      )}
      {renderInput()}
    </div>
  );
};

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => (
  <div className="bg-zinc-800 p-6 rounded-xl shadow-2xl border border-zinc-700">
    <h2 className="text-xl font-bold mb-4 border-b border-red-700/50 pb-2 text-red-400">
      {title}
    </h2>
    {children}
  </div>
);

// --- VariantOptionInput Component (NEW) ---

interface VariantOptionInputProps {
  def: VariantDefinition;
  index: number;
  handleNameChange: (index: number, value: string) => void;
  handleValuesChange: (index: number, value: string) => void;
  handleRemove: (index: number) => void;
  canRemove: boolean;
}

// eslint-disable-next-line react/display-name
const VariantOptionInput: React.FC<VariantOptionInputProps> = React.memo(
  ({
    def,
    index,
    handleNameChange,
    handleValuesChange,
    handleRemove,
    canRemove,
  }) => {
    // Determine the placeholder/icon based on the name
    const isColor = def.name.toLowerCase() === "color";
    const valuesPlaceholder = isColor
      ? "Red, Blue, Green (#FF0000, #0000FF, #000000)"
      : "Small, Medium, Large, XL";

    return (
      <div className="grid grid-cols-6 gap-3 items-end">
        <div className="col-span-2">
          <InputField
            label={index === 0 ? "Variant Type Name (e.g., Color)" : undefined}
            value={def.name}
            onChange={(e) => handleNameChange(index, e.target.value)}
            placeholder="Color / Size"
            wrapperClass="!space-y-0"
            icon={isColor ? PaintBucket : List}
          />
        </div>
        <div className="col-span-3">
          <InputField
            label={
              index === 0
                ? `Possible Values (${
                    isColor ? "Name or Hex" : "e.g., Small, Medium"
                  })`
                : undefined
            }
            value={def.values}
            onChange={(e) => handleValuesChange(index, e.target.value)}
            placeholder={valuesPlaceholder}
            wrapperClass="!space-y-0"
            icon={Tag}
          />
        </div>
        <button
          type="button"
          onClick={() => handleRemove(index)}
          className="col-span-1 p-3 bg-zinc-600 hover:bg-red-600 rounded-lg transition-colors h-[48px] disabled:opacity-50"
          disabled={!canRemove}
        >
          <X className="w-5 h-5 mx-auto" />
        </button>
      </div>
    );
  }
);

// --- Main Form Component ---

export default function AddProductForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [variantOpen, setVariantOpen] = useState(true);

  // ✅ NEW STATE: JWT টোকেন সংরক্ষণের জন্য
  const [userToken, setUserToken] = useState<string | null>(null);

  // ✅ NEW EFFECT: কম্পোনেন্ট মাউন্ট হওয়ার সময় লোকাল স্টোরেজ থেকে টোকেন লোড করা
  useEffect(() => {
    try {
      // Client-side execution check
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("userToken");
        setUserToken(token);
      }
    } catch (e) {
      console.error("Error loading token from localStorage", e);
      // Optionally redirect to login if critical data (like the token) is missing/broken
    }
  }, []);

  // --- General Field Change Handler (Includes Checkbox fix) ---
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked; // Type guard fix

      setFormData((prev) => {
        const newFormData = { ...prev };

        if (name in prev) {
          (newFormData as any)[name] =
            type === "number"
              ? parseFloat(value) || 0
              : type === "checkbox"
              ? checked
              : value;
        }

        // Automatic Slug Generation (Simplified)
        if (name === "name") {
          newFormData.slug = value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }

        return newFormData;
      });
    },
    []
  );

  // --- 1B. Image Gallery Handlers (Restored) ---
  const handleImageUrlChange = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const newUrls = [...prev.imageUrls];
      newUrls[index] = value;
      return { ...prev, imageUrls: newUrls };
    });
  }, []);

  const addImageUrl = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""],
    }));
  }, []);

  const removeImageUrl = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  }, []);

  // --- 2. Specification Handlers (Restored) ---
  const handleSpecChange = useCallback(
    (index: number, field: keyof Specification, value: string) => {
      setFormData((prev) => {
        const newSpecs = [...prev.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        return { ...prev, specifications: newSpecs };
      });
    },
    []
  );

  const addSpecification = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, initialSpecification],
    }));
  }, []);

  const removeSpecification = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  }, []);

  // --- Variant Definition Handlers (Unchanged) ---

  const addVariantDefinition = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      variantDefinitions: [
        ...prev.variantDefinitions,
        initialVariantDefinition,
      ],
    }));
  }, []);

  const removeVariantDefinition = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      variantDefinitions: prev.variantDefinitions.filter((_, i) => i !== index),
      combinedVariants: [], // Clear combinations when definitions change
    }));
  }, []);

  const handleVariantDefinitionNameChange = useCallback(
    (index: number, value: string) => {
      setFormData((prev) => {
        const newDefinitions = [...prev.variantDefinitions];
        const isColor = value.toLowerCase() === "color";

        newDefinitions[index] = {
          ...newDefinitions[index],
          name: value,
          isColor: isColor,
        };

        return {
          ...prev,
          variantDefinitions: newDefinitions,
          combinedVariants: [],
        };
      });
    },
    []
  );

  const handleVariantDefinitionValuesChange = useCallback(
    (index: number, value: string) => {
      setFormData((prev) => {
        const newDefinitions = [...prev.variantDefinitions];
        // Split by comma, trim whitespace, filter empty strings
        const parsedValues = value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v);

        newDefinitions[index] = {
          ...newDefinitions[index],
          values: value,
          parsedValues: parsedValues,
        };

        return {
          ...prev,
          variantDefinitions: newDefinitions,
          combinedVariants: [],
        };
      });
    },
    []
  );

  // --- Combination Generation Logic (Reworked for Hex/Color priority) ---
  const generateCombinations = useCallback(() => {
    const definitions = formData.variantDefinitions.filter(
      (def) => def.name && def.parsedValues.length > 0
    );

    if (definitions.length === 0) {
      toast.error("Please define at least one variant type and its values.");
      return;
    }

    const newCombinations: CombinedVariant[] = [];

    // Recursive function to generate all combinations
    const combine = (
      index: number,
      currentCombination: { name: string; value: string }[]
    ) => {
      if (index === definitions.length) {
        // Check if an existing variant matches this combination
        const existingVariant = formData.combinedVariants.find(
          (cv) =>
            cv.options.every((opt1) =>
              currentCombination.some(
                (opt2) => opt2.name === opt1.name && opt2.value === opt1.value
              )
            ) &&
            currentCombination.every((opt1) =>
              cv.options.some(
                (opt2) => opt2.name === opt1.name && opt2.value === opt1.value
              )
            )
        );

        // Find color option and determine initial Hex Code/Display Name
        const colorOption = definitions.find(
          (def) => def.name.toLowerCase() === "color"
        );
        const colorValue = colorOption
          ? currentCombination.find((opt) => opt.name.toLowerCase() === "color")
              ?.value
          : undefined;

        let initialHexCode = initialCombinedVariant.hexCode;
        let displayName = colorValue;

        if (colorOption && colorValue) {
          // 1. Try to extract a hex code from the input (e.g., user inputs "Red (#FF0000)")
          const hexMatch = colorValue.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);

          if (hexMatch) {
            initialHexCode = hexMatch[0];
            displayName = colorValue
              .replace(hexMatch[0], "")
              .trim()
              .replace(/[\(\)]/g, ""); // Remove hex code for clean name
          } else if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue)) {
            // 2. If the whole value is a hex code
            initialHexCode = colorValue;
            displayName = colorValue; // Use hex as display name if no other name is given
          } else {
            // 3. Just a name, keep hex default (e.g., #000000)
            displayName = colorValue;
          }
        }

        const finalOptions = currentCombination.map((opt) => {
          // Update the value for Color to be the clean display name if hex was involved
          if (opt.name.toLowerCase() === "color" && colorOption && colorValue) {
            return { name: opt.name, value: displayName || opt.value };
          }
          return opt;
        });

        newCombinations.push(
          existingVariant
            ? existingVariant
            : {
                options: finalOptions,
                sku: finalOptions
                  .map((opt) =>
                    opt.value.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "")
                  )
                  .join("-")
                  .toUpperCase(), // Auto-generate SKU
                stock: 0,
                priceAdjustment: 0,
                hexCode: initialHexCode,
                variantImageUrl: "",
              }
        );
        return;
      }

      definitions[index].parsedValues.forEach((value) => {
        combine(index + 1, [
          ...currentCombination,
          { name: definitions[index].name, value: value },
        ]);
      });
    };

    combine(0, []);
    setFormData((prev) => ({ ...prev, combinedVariants: newCombinations }));
    toast.success(`${newCombinations.length} variant combinations generated!`);
  }, [formData.variantDefinitions, formData.combinedVariants]);

  // --- Combined Variant Handlers (Unchanged) ---
  const handleCombinedVariantChange = useCallback(
    (index: number, field: keyof CombinedVariant, value: string | number) => {
      setFormData((prev) => {
        const newCombinedVariants = [...prev.combinedVariants];

        const finalValue =
          field === "stock" || field === "priceAdjustment"
            ? parseFloat(value as string) || 0
            : value;

        newCombinedVariants[index] = {
          ...newCombinedVariants[index],
          [field]: finalValue,
        };

        // Special handling for hexCode: Update the 'Color' option value to the hex code
        if (field === "hexCode") {
          const colorOptionIndex = newCombinedVariants[index].options.findIndex(
            (opt) => opt.name.toLowerCase() === "color"
          );
          if (colorOptionIndex !== -1) {
            // We set the actual value of the option to the Hex code for easy retrieval on the product page
            newCombinedVariants[index].options[colorOptionIndex].value =
              finalValue as string;
          }
        }

        return { ...prev, combinedVariants: newCombinedVariants };
      });
    },
    []
  );

  // --- Submission Handler (FIXED to include Authorization Header) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userToken) {
      // 🛑 Critical: Admin must be logged in to post new products
      toast.error("Authentication failed. Please log in as an Admin.");
      setLoading(false);
      return;
    }

    const processedTags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const processedSpecifications = formData.specifications.filter(
      (s) => s.key && s.value
    );
    const processedImageUrls = formData.imageUrls.filter(
      (url) => url.trim() !== ""
    );

    // Final data structure cleanup
    const cleanedVariantDefinitions = formData.variantDefinitions
      .filter((def) => def.name && def.parsedValues.length > 0)
      .map((def) => ({ name: def.name, values: def.parsedValues })); // Send array of values

    const finalData = {
      ...formData,
      tags: processedTags,
      specifications: processedSpecifications,
      price: parseFloat(formData.price.toString()),
      imageUrls: processedImageUrls,
      variantDefinitions: cleanedVariantDefinitions,
      combinedVariants: formData.combinedVariants.filter(
        (cv) => cv.options.length > 0
      ),
    };

    const toastId = toast.loading("Adding product to E-Mart catalog...");

    try {
      console.log(
        "Submitting Product Data to https://ecommercebackend-teal.vercel.app/api/products:",
        finalData
      );

      // --- REAL BACKEND CALL: AUTHORIZATION HEADER ADDED ---
      const response = await fetch(
        "https://ecommercebackend-teal.vercel.app/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // ✅ FIX: টোকেনটি Authorization Header এ যোগ করা হলো
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(finalData),
        }
      );

      // Parse JSON response (even for errors, to get error message)
      const responseData = await response.json();

      if (response.ok) {
        toast.success(
          `Product "${finalData.name}" added successfully! (ID: ${
            responseData.product?._id || "N/A"
          })`,
          {
            id: toastId,
          }
        );
        setFormData(initialFormData);
      } else {
        // If response is not ok (e.g., 401, 400, or 500)
        throw new Error(
          responseData.message || `API failed with status ${response.status}`
        );
      }
    } catch (error: any) {
      console.error("Submission Error:", error);
      // Display user-friendly error from API or default error
      toast.error(
        error.message || "Failed to add product. Check console for details.",
        {
          id: toastId,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic ---
  return (
    <div className="p-1 sm:p-2 lg:p-6 mt-12 bg-zinc-900 min-h-[calc(100vh-64px)] text-white">
      <header className="mb-8 border-b border-zinc-700 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Add New Product</h1>
        <p className="text-gray-400">
          Enter comprehensive details to publish a new item in your store.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Product Details */}

        <SectionCard title="Product Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={List}
              placeholder="E.g., Wireless Gaming Headset Pro"
            />
            <InputField
              label="Product Slug (URL Identifier)"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              icon={Hash}
              placeholder="wireless-gaming-headset-pro"
              disabled
            />

            {/* Short Description */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-300 flex items-center">
                <List className="w-4 h-4 mr-2 text-red-400" />
                Short Description (Max ~200 chars)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange as any}
                rows={2}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="A brief, attention-grabbing summary of the product features..."
              ></textarea>
            </div>

            {/* Long Description (NEW) */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-300 flex items-center">
                <Maximize className="w-4 h-4 mr-2 text-red-400" />
                **Long Description** (Optional, Full Detail)
              </label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleChange as any}
                rows={6}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Detailed product history, usage guide, full feature list, etc."
              ></textarea>
            </div>

            {/* Material & Warranty (NEW) */}
            <InputField
              label="Material (Optional)"
              name="material"
              value={formData.material}
              onChange={handleChange}
              icon={Ruler}
              placeholder="E.g., Leather, 100% Cotton, Stainless Steel"
            />
            <InputField
              label="Warranty (Optional)"
              name="warranty"
              value={formData.warranty}
              onChange={handleChange}
              icon={Shield}
              placeholder="E.g., 1 Year Limited Warranty, 90-Day Guarantee"
            />

            {/* Image Gallery Fields (FIXED) */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-300 flex items-center mb-2">
                <ImageIcon className="w-4 h-4 mr-2 text-red-400" />
                Product Images (Gallery)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add URLs for multiple high-resolution images.
              </p>

              <div className="space-y-3">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="flex space-x-2">
                    <InputField
                      label={
                        index === 0
                          ? "Main Image URL"
                          : `Image #${index + 1} URL`
                      }
                      value={url}
                      onChange={(e) =>
                        handleImageUrlChange(index, e.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                      className="flex-grow !space-y-0"
                      type="url"
                      name={undefined}
                      icon={undefined}
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors self-end h-[48px] disabled:opacity-50"
                      disabled={formData.imageUrls.length === 0}
                    >
                      <X className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addImageUrl}
                className="mt-3 flex items-center justify-center w-full py-2 border border-dashed border-zinc-600 text-gray-400 hover:bg-zinc-700/50 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Image URL
              </button>
            </div>
            {/* END: Image Gallery Fields */}

            <InputField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="E.g., Electronics, Apparel"
            />
            <InputField
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              icon={Tag}
              placeholder="E.g., Samsung, Nike"
            />
            <InputField
              label="Tags (Comma Separated)"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              icon={Tag}
              placeholder="gaming, headset, wireless"
            />
          </div>
        </SectionCard>

        {/* 2. Pricing and Inventory */}
        <SectionCard title="Pricing & Inventory">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="Base Price ($)"
              name="price"
              value={formData.price}
              onChange={handleChange}
              type="number"
              icon={DollarSign}
            />
            <InputField
              label="Discount Price ($) (Optional)"
              name="discountPrice"
              value={formData.discountPrice || ""}
              onChange={handleChange}
              type="number"
              icon={DollarSign}
            />
            <InputField
              label="Initial Stock Quantity (Global)"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleChange}
              type="number"
              icon={Package}
              placeholder="This will be ignored if variants are active."
            />
          </div>
          <div className="mt-4 flex items-center space-x-3 text-gray-300">
            <input
              type="checkbox"
              name="isFreeShipping"
              checked={formData.isFreeShipping}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500"
            />
            <label className="flex items-center text-sm font-medium">
              <Truck className="w-4 h-4 mr-2 text-red-400" />
              Offer **Free Shipping**
            </label>
          </div>
        </SectionCard>

        {/* 3. Technical Specifications */}
        <SectionCard title="Technical Specifications">
          <p className="text-sm text-gray-400 mb-4">
            Add key/value pairs (e.g., &quot;**Screen Size**&quot;: &quot;**15
            inches**&quot;).
          </p>
          <div className="space-y-4">
            {formData.specifications.map((spec, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-4 items-end bg-zinc-700/30 p-3 rounded-lg border border-zinc-700"
              >
                <div className="col-span-2">
                  <InputField
                    label="Key"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(
                        index,
                        "key",
                        e.target.value as keyof Specification
                      )
                    }
                    placeholder="Resolution"
                    className="!space-y-0"
                    name={undefined}
                    icon={undefined}
                  />
                </div>
                <div className="col-span-2">
                  <InputField
                    label="Value"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(
                        index,
                        "value",
                        e.target.value as keyof Specification
                      )
                    }
                    placeholder="1920x1080"
                    className="!space-y-0"
                    name={undefined}
                    icon={undefined}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="col-span-1 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                  disabled={formData.specifications.length === 1}
                >
                  <X className="w-5 h-5 mx-auto" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSpecification}
            className="mt-4 flex items-center justify-center w-full py-2 border border-dashed border-red-700/50 text-red-400 hover:bg-zinc-700/50 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Specification Field
          </button>
        </SectionCard>

        {/* 4. Product Variants (Dynamic Combinations) */}
        <SectionCard title="Product Variants (Combinations for E-Commerce UI)">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400">
              Define the available selection options for the user on the product
              page.
            </p>
            <button
              type="button"
              onClick={() => setVariantOpen(!variantOpen)}
              className="text-red-400 hover:text-red-300"
            >
              {variantOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {variantOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Variant Definitions Input */}
              <div className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-700 space-y-4">
                <h3 className="text-lg font-semibold text-red-300 border-b border-zinc-600 pb-2">
                  Step 1: Define User Selectable Options (Color, Size, etc.)
                </h3>
                {formData.variantDefinitions.map((def, index) => (
                  <VariantOptionInput
                    key={index}
                    def={def}
                    index={index}
                    handleNameChange={handleVariantDefinitionNameChange}
                    handleValuesChange={handleVariantDefinitionValuesChange}
                    handleRemove={removeVariantDefinition}
                    canRemove={formData.variantDefinitions.length > 1}
                  />
                ))}
                <button
                  type="button"
                  onClick={addVariantDefinition}
                  className="mt-3 flex items-center justify-center w-full py-2 border border-dashed border-zinc-600 text-gray-400 hover:bg-zinc-700/50 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Another Option Type
                </button>
                <button
                  type="button"
                  onClick={generateCombinations}
                  className="mt-4 flex items-center justify-center w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors font-semibold"
                >
                  <Shuffle className="w-5 h-5 mr-2" /> Step 2: Generate All{" "}
                  {formData.variantDefinitions.reduce(
                    (acc, def) => acc * (def.parsedValues.length || 1),
                    1
                  )}{" "}
                  Combinations
                </button>
              </div>

              {/* Generated Combinations Table */}
              <AnimatePresence>
                {formData.combinedVariants.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-zinc-700/30 p-4 rounded-xl border border-zinc-700 space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-red-300 border-b border-zinc-600 pb-2">
                      Step 3: Assign SKU, Stock, Price & Image for{" "}
                      {formData.combinedVariants.length} Variants
                    </h3>

                    <div className="space-y-6">
                      {formData.combinedVariants.map(
                        (combinedVariant, index) => {
                          const isColorCombination =
                            formData.variantDefinitions.some(
                              (def) => def.name.toLowerCase() === "color"
                            );
                          const optionDisplay = combinedVariant.options
                            .map((opt) => `${opt.name}: **${opt.value}**`)
                            .join(" | ");
                          const colorOption = combinedVariant.options.find(
                            (opt) => opt.name.toLowerCase() === "color"
                          );

                          return (
                            <div
                              key={index}
                              className="p-4 rounded-lg border border-zinc-600 bg-zinc-800/50"
                            >
                              <h4 className="font-bold text-lg mb-3 text-red-200 flex items-center">
                                {optionDisplay}
                                {isColorCombination && colorOption && (
                                  <span
                                    className="w-5 h-5 rounded-full ml-3 border-2 border-zinc-500"
                                    style={{
                                      backgroundColor: combinedVariant.hexCode,
                                    }}
                                    title={`Hex: ${combinedVariant.hexCode}`}
                                  ></span>
                                )}
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {isColorCombination && (
                                  <InputField
                                    label="Hex Code"
                                    value={combinedVariant.hexCode}
                                    onChange={(e) =>
                                      handleCombinedVariantChange(
                                        index,
                                        "hexCode",
                                        e.target.value
                                      )
                                    }
                                    type="color"
                                    wrapperClass="col-span-1"
                                  />
                                )}
                                <InputField
                                  label="SKU"
                                  value={combinedVariant.sku}
                                  onChange={(e) =>
                                    handleCombinedVariantChange(
                                      index,
                                      "sku",
                                      e.target.value
                                    )
                                  }
                                  wrapperClass="col-span-1"
                                />
                                <InputField
                                  label="Stock"
                                  value={combinedVariant.stock}
                                  onChange={(e) =>
                                    handleCombinedVariantChange(
                                      index,
                                      "stock",
                                      e.target.value
                                    )
                                  }
                                  type="number"
                                  wrapperClass="col-span-1"
                                />
                                <InputField
                                  label="Price Adj. ($)"
                                  value={combinedVariant.priceAdjustment}
                                  onChange={(e) =>
                                    handleCombinedVariantChange(
                                      index,
                                      "priceAdjustment",
                                      e.target.value
                                    )
                                  }
                                  type="number"
                                  wrapperClass="col-span-1"
                                />
                                <InputField
                                  label="Variant Image URL (Optional)"
                                  value={combinedVariant.variantImageUrl}
                                  onChange={(e) =>
                                    handleCombinedVariantChange(
                                      index,
                                      "variantImageUrl",
                                      e.target.value
                                    )
                                  }
                                  type="url"
                                  wrapperClass="col-span-full"
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </SectionCard>

        {/* 5. Submission Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-lg shadow-xl transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" /> **Save Product**
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
