# Build009.4 UX Revision C

## Fixed

### Cover deep-dive duplication
The previous cover deep-dive used the same `cover.title` and `cover.summary` shown on page one. It now opens a different layer built from:
- the central question,
- the structural shift,
- why the change matters,
- Observe Next prompts.

### My World gesture loop
- Swipe right in the reader to open My World.
- Swipe left in My World to return to the reader.
- The underlying ReadingPager remains mounted, so the exact current page is preserved.

### Page transition
My World enters from the left and exits to the left with a 230 ms eased transition. The header back action and Continue Reading use the same animation.
