'use client'

import { motion } from 'framer-motion'

export function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-bg-deep via-bg-base to-[#1a0d22]" />

      <motion.div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #7e5686 0%, transparent 70%)',
        }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #9a6aa4 0%, transparent 70%)',
        }}
        animate={{ x: [0, -50, 0], y: [0, -60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/4 w-[450px] h-[450px] rounded-full opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #e8f9a2 0%, transparent 70%)',
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(232,249,162,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,249,162,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {Array.from({ length: 30 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-accent"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: 'blur(0.5px)',
          }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{
            duration: 2 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 via-transparent to-bg-base/40" />
    </div>
  )
}
