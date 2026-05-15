'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, X } from 'lucide-react'

interface Props {
  label: string
  placeholder: string
  value: string
  options: string[]
  disabled?: boolean
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onChange: (value: string) => void
}

export function SeletorModal({
  label,
  placeholder,
  value,
  options,
  disabled = false,
  isOpen,
  onOpen,
  onClose,
  onChange,
}: Props) {
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Rola até o item selecionado quando o modal abre
  useEffect(() => {
    if (isOpen && selectedRef.current) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({ block: 'center' })
      }, 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Trigger */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-lavender uppercase tracking-wider pl-1">
          {label}
        </label>
        <button
          type="button"
          onClick={onOpen}
          disabled={disabled}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-bg-card border border-primary/20 text-base text-left disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 active:border-primary/70 transition-colors"
        >
          <span className={value ? 'text-accent' : 'text-lavender/60'}>
            {value || placeholder}
          </span>
          <ChevronDown className="size-4 text-lavender shrink-0" />
        </button>
      </div>

      {/* Modal tela toda — portal para escapar de containing blocks com transform */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex flex-col bg-bg-base">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2 border-b border-primary/10 shrink-0">
              <span className="font-bold text-accent text-lg">{label}</span>
              <button
                onClick={onClose}
                className="p-0 rounded-full text-lavender hover:text-accent transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto overscroll-contain py-2">
              {options.map(opt => {
                const selected = opt === value
                return (
                  <button
                    key={opt}
                    ref={selected ? selectedRef : undefined}
                    type="button"
                    onClick={() => {
                      onChange(opt)
                      onClose()
                    }}
                    className={`w-full flex items-center justify-between px-5 py-1 text-left text-base border-b border-primary/5 transition-colors ${
                      selected
                        ? 'bg-primary/15 text-accent font-semibold'
                        : 'text-lavender active:bg-primary/10'
                    }`}
                  >
                    <span>{opt}</span>
                    {selected && (
                      <Check className="size-5 text-primary shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
