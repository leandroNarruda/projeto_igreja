import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cada cor usa rgb(var(...) / <alpha-value>) para suportar
        // variantes de opacidade: bg-primary/20, text-lavender/50, etc.
        'bg-base':       'rgb(var(--color-bg-base)       / <alpha-value>)',
        'bg-card':       'rgb(var(--color-bg-card)       / <alpha-value>)',
        'bg-deep':       'rgb(var(--color-bg-deep)       / <alpha-value>)',
        primary:         'rgb(var(--color-primary)       / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        accent:          'rgb(var(--color-accent)        / <alpha-value>)',
        lavender:        'rgb(var(--color-lavender)      / <alpha-value>)',
        orange:          'rgb(var(--color-orange)        / <alpha-value>)',
        danger:          'rgb(var(--color-danger)        / <alpha-value>)',
        success:         'rgb(var(--color-success)       / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
export default config
