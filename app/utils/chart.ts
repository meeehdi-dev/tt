/**
 * Utilities for calculating SVG Pie Chart paths.
 *
 * Concept:
 * We use a "viewBox" of -1 -1 2 2. This creates a coordinate system where
 * the center of the pie is (0,0), and the radius is 1.
 *
 * SVG Path Commands used:
 * M: Move to (x, y) - Start the path
 * L: Line to (x, y) - Draw a straight line
 * A: Arc to (rx, ry, rotation, large-arc-flag, sweep-flag, x, y)
 * Z: Close path
 */

/**
 * Converts degrees to radians, as SVG trigonometric functions require radians.
 * formula: radians = degrees * (PI / 180)
 */
export const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

/**
 * Converts polar coordinates (angle, radius) to cartesian (x, y).
 * For a unit circle (radius=1), x = cos(angle), y = sin(angle).
 */
export const polarToCartesian = (angleInDegrees: number) => {
  const radians = degreesToRadians(angleInDegrees);
  return {
    x: Math.cos(radians),
    y: Math.sin(radians),
  };
};

/**
 * Generates an SVG path string for a circular arc segment.
 *
 * @param startAngle Angle in degrees where the slice starts.
 * @param endAngle Angle in degrees where the slice ends.
 * @returns String representation of the SVG path.
 */
export function getSlicePath(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);

  // If the slice is > 180 degrees, the large-arc-flag must be 1.
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  // Path description (d):
  // M 0 0: Move pen to center
  // L start.x start.y: Draw line from center to start of arc
  // A 1 1 0 [largeArcFlag] 1 end.x end.y: Draw arc to end position
  // Z: Close the path (draws line back to center)
  return [`M 0 0`, `L ${start.x} ${start.y}`, `A 1 1 0 ${largeArcFlag} 1 ${end.x} ${end.y}`, `Z`].join(" ");
}
