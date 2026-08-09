/**
 * Read once at module load, not per-render. Every quality decision in the scene
 * reads from here so there's one place to change the thresholds.
 */
export const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
