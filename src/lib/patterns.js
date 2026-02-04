/**
 * CSS Patterns for page backgrounds
 * 
 * Each pattern function returns CSS properties to create background patterns.
 * Colors are provided as parameters to ensure they match with the theme.
 */

export const PATTERNS = {
  /**
   * Subtle dots pattern
   * Creates a grid of small circular dots
   */
  dots: (color) => ({
    backgroundImage: `radial-gradient(${color}20 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0',
  }),

  /**
   * Fine grid pattern  
   * Creates a subtle grid of thin lines
   */
  grid: (color) => ({
    backgroundImage: `
      linear-gradient(${color}15 1px, transparent 1px),
      linear-gradient(90deg, ${color}15 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
  }),

  /**
   * Diagonal lines pattern
   * Creates diagonal stripes 
   */
  diagonal: (color) => ({
    backgroundImage: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      ${color}10 10px,
      ${color}10 12px
    )`,
  }),

  /**
   * Waves pattern
   * Creates a flowing wave pattern
   */
  waves: (color) => ({
    backgroundImage: `
      radial-gradient(ellipse at 0% 50%, 
        ${color}08 0%, 
        transparent 20%, 
        transparent 21%, 
        ${color}08 50%,
        transparent 80%
      ),
      radial-gradient(ellipse at 100% 50%, 
        ${color}08 0%, 
        transparent 20%, 
        transparent 21%, 
        ${color}08 50%,
        transparent 80%
      )
    `,
    backgroundSize: '40px 20px',
    backgroundPosition: '0 0, 20px 10px',
  }),

  /**
   * Confetti pattern
   * Creates scattered colorful particles
   */
  confetti: (color) => ({
    backgroundImage: `
      radial-gradient(circle at 25% 25%, ${color}15 2px, transparent 2px),
      radial-gradient(circle at 75% 75%, ${color}20 1px, transparent 1px),
      radial-gradient(circle at 90% 10%, ${color}10 1.5px, transparent 1.5px),
      radial-gradient(circle at 10% 90%, ${color}12 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px, 40px 40px, 80px 80px, 50px 50px',
    backgroundPosition: '0 0, 20px 20px, -10px 10px, 30px -5px',
  }),

  /**
   * Circuit pattern
   * Creates tech-like circuit board lines
   */
  circuit: (color) => ({
    backgroundImage: `
      linear-gradient(90deg, ${color}12 1px, transparent 1px),
      linear-gradient(0deg, ${color}12 1px, transparent 1px),
      linear-gradient(90deg, ${color}08 1px, transparent 1px),
      linear-gradient(0deg, ${color}08 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px, 40px 40px, 10px 10px, 10px 10px',
    backgroundPosition: '0 0, 0 0, 0 0, 0 0',
  }),
};

/**
 * Get pattern CSS styles
 * @param {string} patternName - Name of the pattern
 * @param {string} color - Base color for the pattern (hex)
 * @returns {object} CSS properties object
 */
export function getPatternStyle(patternName, color) {
  const pattern = PATTERNS[patternName];
  if (!pattern) {
    console.warn(`Pattern '${patternName}' not found`);
    return {};
  }
  
  return pattern(color);
}

/**
 * Get all available pattern names
 * @returns {string[]} Array of pattern names
 */
export function getPatternNames() {
  return Object.keys(PATTERNS);
}

/**
 * Pattern metadata for UI display
 */
export const PATTERN_META = {
  dots: {
    name: 'Pontos',
    description: 'Bolinhas sutis',
  },
  grid: {
    name: 'Grade',
    description: 'Grade fina',
  },
  diagonal: {
    name: 'Diagonal',
    description: 'Linhas diagonais',
  },
  waves: {
    name: 'Ondas',
    description: 'Ondas fluidas',
  },
  confetti: {
    name: 'Confetti',
    description: 'Partículas coloridas',
  },
  circuit: {
    name: 'Circuito',
    description: 'Linhas tech',
  },
};