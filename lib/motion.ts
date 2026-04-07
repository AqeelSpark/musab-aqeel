export const ease = {
  out:    [0.16, 1, 0.3, 1] as const,
  in:     [0.7, 0, 0.84, 0] as const,
  inOut:  [0.87, 0, 0.13, 1] as const,
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
}

export const duration = {
  fast:  0.3,
  base:  0.55,
  slow:  0.85,
  xslow: 1.2,
}

export const stagger = {
  tight: 0.04,
  base:  0.07,
  loose: 0.12,
}
