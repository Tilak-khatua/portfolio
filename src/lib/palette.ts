/**
 * The pixel ramp, shared by every pixel surface: the cursor heat field, the hero
 * band, the page loader and the case-study wipe.
 *
 * Cobalt — navy through blue to a pale sky. Deliberately kept off the ink axis:
 * a monochrome grey/black ramp collides with the body type, which is also
 * near-black, so the pixels swallow the letters. Hue separation is what keeps
 * text readable while the field runs behind it, and cool blue against the warm
 * paper gives the widest separation available.
 *
 * Ordered darkest → lightest. For the heat field these map coolest → hottest.
 */
export const PIXEL_RAMP = ['#1C2541', '#2F4FC9', '#5B8DEF', '#A9C6F5'] as const

/** Same ramp as heat bands: [threshold, colour], ascending. */
export const PIXEL_BANDS: [number, string][] = [
  [0, PIXEL_RAMP[0]],
  [0.46, PIXEL_RAMP[1]],
  [0.62, PIXEL_RAMP[2]],
  [0.78, PIXEL_RAMP[3]],
]

/** Hottest cells — pointer core and the idle glyph. */
export const PIXEL_PEAK = PIXEL_RAMP[1]
