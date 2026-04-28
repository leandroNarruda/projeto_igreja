'use client'

import React, { useState, useRef, useEffect } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  disabled?: boolean
  className?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder = 'Selecione...',
  value = '',
  onChange,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // Usar timeout para evitar fechar imediatamente ao abrir
      const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
      }, 0)

      return () => {
        clearTimeout(timeout)
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption ? selectedOption.label : placeholder

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      // Criar um evento sintético para manter compatibilidade
      const syntheticEvent = {
        target: { value: optionValue },
      } as React.ChangeEvent<HTMLSelectElement>
      onChange(syntheticEvent)
    }
    setIsOpen(false)
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-accent mb-1">
          {label}
        </label>
      )}
      <div
        className="relative"
        ref={selectRef}
        style={{ zIndex: isOpen ? 50 : 'auto' }}
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2 border rounded-lg
            text-left text-accent bg-primary/10
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            flex items-center justify-between
            ${error ? 'border-danger' : 'border-primary/35'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${!selectedOption ? 'text-lavender/50' : ''}
          `}
        >
          <span className="truncate">{displayValue}</span>
          <svg
            className={`w-4 h-4 text-lavender/50 transition-transform flex-shrink-0 ml-2 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute w-full mt-1 bg-bg-card border border-primary/35 rounded-lg shadow-xl max-h-60 overflow-auto"
            style={{
              top: '100%',
              left: 0,
              zIndex: 9999,
            }}
          >
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-accent hover:bg-primary/10
                  transition-colors
                  ${value === option.value ? 'bg-primary/20 font-medium' : ''}
                  first:rounded-t-lg last:rounded-b-lg
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
}
