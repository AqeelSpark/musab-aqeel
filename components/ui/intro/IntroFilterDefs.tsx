/**
 * Inline SVG filter used by the intro morph. Rendered at the body root
 * (outside the `.intro` position-fixed container) because WebKit silently
 * drops `filter: url(#id)` when the SVG `<defs>` live inside a fixed
 * ancestor — that's what was breaking the morph on iOS. With the defs up
 * here, the `url(#intro-threshold)` reference resolves cleanly on every
 * browser.
 *
 * The filter recreates the classic alpha-threshold "gooey merge":
 *   • `feColorMatrix` amplifies the alpha channel and biases it down,
 *     producing a hard cutoff at ~55% alpha — pixels above snap to fully
 *     opaque, below snap to fully transparent.
 *   • A tiny `feGaussianBlur` softens the resulting alpha edges so the
 *     cutoff reads as organic rather than jagged.
 */
export default function IntroFilterDefs() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter
          id="intro-threshold"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 255 -140"
            result="thresholded"
          />
          <feGaussianBlur in="thresholded" stdDeviation="0.45" />
        </filter>
      </defs>
    </svg>
  )
}
