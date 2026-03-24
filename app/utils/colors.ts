/**
 * Returns a contrast color (black or white) for a given hex background color.
 * If the color is transparent (low alpha), returns undefined (to use default text color).
 */
export function getContrastColor(hex: string): string | undefined {
  if (!hex.startsWith("#")) return undefined;

  // Handle #RRGGBBAA (9 chars) or #RGBA (5 chars)
  if (hex.length === 5 || hex.length === 9) {
    const alpha = hex.length === 5 ? parseInt(hex.slice(4, 5), 16) / 15 : parseInt(hex.slice(7, 9), 16) / 255;
    if (alpha < 0.5) return undefined;
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 128 ? "#000000" : "#ffffff";
}
