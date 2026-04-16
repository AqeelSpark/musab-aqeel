export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  layout: [0.32, 0.72, 0, 1] as const,
  overlayExit: [0.5, 0, 0.75, 0] as const,
}

export const duration = {
  base: 0.55,
  layout: 0.6,
}

export const stagger = {
  tight: 0.04,
}

export const scroll = {
  headerOffset: 80,
  revealStart: 'top 95%',
  revealEnd: 'top 65%',
}
