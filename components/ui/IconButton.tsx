import React from 'react'
import { LucideIcon } from 'lucide-react'

interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  icon: LucideIcon
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  'aria-label': string
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  variant = 'outline',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantStyles = {
    primary: 'bg-primary text-accent hover:bg-primary-hover focus:ring-primary',
    secondary: 'bg-primary/20 text-lavender hover:bg-primary/30 focus:ring-primary',
    outline:
      'border-2 border-primary/40 text-lavender hover:bg-primary/10 focus:ring-primary',
    ghost: 'text-lavender hover:bg-primary/10 focus:ring-primary',
    minimal: 'text-lavender hover:bg-primary/10 focus:ring-primary border-0',
  }

  const sizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      <Icon size={iconSizes[size]} />
    </button>
  )
}
