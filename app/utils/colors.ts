/**
 * Utility for mapping a string ID to a consistent hex color from a curated palette.
 * This ensures that a project consistently renders with the same color,
 * providing a stable visual identifier for the user.
 */

const PALETTE = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
  "#f97316", // orange-500
];

/**
 * Deterministically maps an ID to a color from the palette.
 * @param id The project ID string.
 * @returns A hex color string.
 */
export function getColorForId(id: string): string {
  // Simple hash function to turn a string into a number
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use absolute value and modulo to pick a palette index
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index]!;
}
