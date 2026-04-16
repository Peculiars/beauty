

export const MATERIALS = [
  { value: "wood", label: "Wood" },
  { value: "metal", label: "Metal" },
  { value: "fabric", label: "Fabric" },
  { value: "leather", label: "Leather" },
  { value: "glass", label: "Glass" },
] as const;

/** Materials formatted for Sanity schema options.list */
export const MATERIALS_SANITY_LIST = MATERIALS.map(({ value, label }) => ({
  title: label,
  value,
}));



// ============================================
// Product Attribute Constants
// Shared between frontend filters and Sanity schema
// ============================================

export const COLORS = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "off-white", label: "Off White" },
  { value: "cream", label: "Cream" },
  { value: "beige", label: "Beige" },
  { value: "ivory", label: "Ivory" },
  { value: "grey", label: "Grey" },
  { value: "light-grey", label: "Light Grey" },
  { value: "charcoal", label: "Charcoal" },
  { value: "silver", label: "Silver" },
  { value: "red", label: "Red" },
  { value: "crimson", label: "Crimson" },
  { value: "burgundy", label: "Burgundy" },
  { value: "maroon", label: "Maroon" },
  { value: "coral", label: "Coral" },
  { value: "pink", label: "Pink" },
  { value: "hot-pink", label: "Hot Pink" },
  { value: "rose", label: "Rose" },
  { value: "blush", label: "Blush" },
  { value: "orange", label: "Orange" },
  { value: "rust", label: "Rust" },
  { value: "terracotta", label: "Terracotta" },
  { value: "peach", label: "Peach" },
  { value: "yellow", label: "Yellow" },
  { value: "mustard", label: "Mustard" },
  { value: "gold", label: "Gold" },
  { value: "lime", label: "Lime" },
  { value: "green", label: "Green" },
  { value: "olive", label: "Olive" },
  { value: "forest-green", label: "Forest Green" },
  { value: "mint", label: "Mint" },
  { value: "sage", label: "Sage" },
  { value: "teal", label: "Teal" },
  { value: "blue", label: "Blue" },
  { value: "navy", label: "Navy" },
  { value: "sky-blue", label: "Sky Blue" },
  { value: "royal-blue", label: "Royal Blue" },
  { value: "denim", label: "Denim" },
  { value: "cobalt", label: "Cobalt" },
  { value: "purple", label: "Purple" },
  { value: "lavender", label: "Lavender" },
  { value: "violet", label: "Violet" },
  { value: "plum", label: "Plum" },
  { value: "lilac", label: "Lilac" },
  { value: "brown", label: "Brown" },
  { value: "tan", label: "Tan" },
  { value: "camel", label: "Camel" },
  { value: "oak", label: "Oak" },
  { value: "walnut", label: "Walnut" },
  { value: "natural", label: "Natural" },
  { value: "multicolor", label: "Multicolor" },
] as const;

export const SIZES = [
  { value: "S", label: "S - Small" },
  { value: "M", label: "M - Medium" },
  { value: "L", label: "L - Large" },
  { value: "XL", label: "XL - Extra Large" },
  { value: "2XL", label: "2XL" },
  { value: "3XL", label: "3XL" },
  { value: "4XL", label: "4XL" },
  { value: "5XL", label: "5XL" },
  { value: "6XL", label: "6XL" },
  { value: "7XL", label: "7XL" },
  { value: "8XL", label: "8XL" },
] as const;

export const SORT_OPTIONS = [
  { value: "name", label: "Name (A-Z)" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "relevance", label: "Relevance" },
] as const;

// Type exports
export type ColorValue = (typeof COLORS)[number]["value"];
export type SizeValue = (typeof SIZES)[number]["value"];
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// ============================================
// Sanity Schema Format Exports
// Format compatible with Sanity's options.list
// ============================================

/** Colors formatted for Sanity schema options.list */
export const COLORS_SANITY_LIST = COLORS.map(({ value, label }) => ({
  title: label,
  value,
}));

/** Sizes formatted for Sanity schema options.list */
export const SIZES_SANITY_LIST = SIZES.map(({ value, label }) => ({
  title: label,
  value,
}));

/** Color values array for zod enums or validation */
export const COLOR_VALUES = COLORS.map((c) => c.value) as [
  ColorValue,
  ...ColorValue[],
];

/** Size values array for zod enums or validation */
export const SIZE_VALUES = SIZES.map((s) => s.value) as [
  SizeValue,
  ...SizeValue[],
];
