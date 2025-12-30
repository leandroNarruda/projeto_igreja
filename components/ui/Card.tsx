'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  index?: number
  bgClassName?: string
  borderClassName?: string
  padding?: string
  useScrollReveal?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  delay = 0,
  index,
  bgClassName,
  borderClassName,
  padding = 'p-6',
  useScrollReveal = false,
}) => {
  // Se index for fornecido, usar delay baseado no index
  const animationDelay = index !== undefined ? index * 0.1 : delay

  // Background padrão ou customizado
  const backgroundClass = bgClassName || 'bg-white'
  // Border padrão ou customizado
  const borderClass = borderClassName || ''
  // Padding padrão ou customizado
  const paddingClass = padding

  const cardVariants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
  }

  const baseClasses = `rounded-lg shadow-md ${paddingClass} ${backgroundClass} ${borderClass} ${className}`

  // Se usar scroll reveal, usar whileInView ao invés de animate
  if (useScrollReveal) {
    return (
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-50px' }}
        variants={cardVariants}
        transition={{
          type: 'tween',
          ease: 'easeOut',
          duration: 0.4,
          delay: animationDelay,
        }}
        className={baseClasses}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={cardVariants}
      transition={{
        type: 'tween',
        ease: 'easeOut',
        duration: 0.4,
        delay: animationDelay,
      }}
      className={baseClasses}
    >
      {children}
    </motion.div>
  )
}
