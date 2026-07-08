import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:     'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-[var(--shadow-sm)] active:scale-[0.98]',
  secondary:   'bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-hover)] active:scale-[0.98]',
  ghost:       'bg-transparent text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] active:scale-[0.98]',
  destructive: 'bg-[var(--error)] text-white hover:opacity-90 shadow-[var(--shadow-sm)] active:scale-[0.98]',
  outline:     'bg-transparent border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-bg)] active:scale-[0.98]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm:      'h-7 px-2.5 text-xs rounded-[6px] gap-1',
  md:      'h-8 px-3 text-sm rounded-[8px] gap-1.5',
  lg:      'h-10 px-4 text-sm rounded-[10px] gap-2',
  icon:    'h-8 w-8 rounded-[8px] p-0',
  'icon-sm': 'h-6 w-6 rounded-[6px] p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-100 select-none cursor-pointer whitespace-nowrap',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0 flex items-center">{icon}</span>}
          {size !== 'icon' && size !== 'icon-sm' && children && <span>{children}</span>}
          {(size === 'icon' || size === 'icon-sm') && (icon ?? children)}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0 flex items-center">{icon}</span>}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
