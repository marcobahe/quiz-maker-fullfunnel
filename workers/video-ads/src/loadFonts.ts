/**
 * Font loading via @remotion/google-fonts
 *
 * Must be imported at the top level of each composition (or Root.tsx)
 * so fonts are loaded before the first render frame.
 *
 * Fonts per brandbook v1.2:
 *   display → Outfit (headlines, CTAs, hook text)
 *   body    → Spline Sans (body copy, support text)
 *   ui      → Inter (UI elements, badges, captions)
 */

import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadSplineSans } from "@remotion/google-fonts/SplineSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: outfitFamily } = loadOutfit();
const { fontFamily: splineSansFamily } = loadSplineSans();
const { fontFamily: interFamily } = loadInter();

/**
 * Resolved font family strings — use these instead of the hardcoded
 * `fonts` object from brand.ts to guarantee the font is loaded in headless render.
 */
export const loadedFonts = {
  display: outfitFamily,       // Outfit — headlines, hooks, CTA labels
  body: splineSansFamily,      // Spline Sans — body copy, support text
  ui: interFamily,             // Inter — UI elements, badges, micro-copy
} as const;
