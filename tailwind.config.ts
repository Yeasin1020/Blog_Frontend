import type { Config } from "tailwindcss";

const config: Config = {
	// darkMode কনফিগারেশনটি সরিয়ে দেওয়া হয়েছে
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {},
	},
	plugins: [],
};

export default config;
