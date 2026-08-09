/**
 * Single source of truth for colour. The 3D scene and the CSS both read these,
 * so the page and the canvas can never drift apart.
 *
 * Rough 60/30/10: mostly `base`, structure in purple/maroon, and `green` doing
 * the talking. Blue and pink are punctuation — if they're more than a few
 * percent of the pixels, the neon reads as noise instead of intent.
 */
export const palette = {
  base: '#0B0710',     // near-black violet; everything else glows against this
  purple: '#3B0764',   // deep structure
  maroon: '#4C0519',   // deep structure
  green: '#4ADE80',    // THE accent
  blue: '#38BDF8',     // punctuation
  pink: '#F472B6',     // punctuation
  text: '#E9E4F0',
  textDim: '#8B7FA0',
};
