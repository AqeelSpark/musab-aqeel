'use client'

import { motion } from 'motion/react'
import { ease, duration } from '@/lib/motion'

const variants = {
  initial: { opacity: 0, y: 18 },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: ease.out,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: duration.base,
      ease: ease.in,
    },
  },
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.main>
  )
}
