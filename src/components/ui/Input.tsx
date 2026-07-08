import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

// ─── SearchBar ────────────────────────────────────────────────────────────────

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ className, onClear, value, ...props }, ref) => {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={14} className="absolute left-2.5 text-[var(--text-4)] pointer-events-none" />
      <input
        ref={ref}
        value={value}
        className={cn(
          'w-full h-8 pl-8 pr-8 rounded-[8px] text-sm',
          'bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)]',
          'placeholder:text-[var(--text-4)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--accent)]/20',
          'transition-all duration-100'
        )}
        {...props}
      />
      {value && onClear && (
        <button className="absolute right-2.5 text-[var(--text-4)] hover:text-[var(--text-3)]" onClick={onClear} type="button">
          <X size={12} />
        </button>
      )}
    </div>
  )
})
SearchBar.displayName = 'SearchBar'

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  inputSize?: 'sm' | 'md'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helper, leftIcon, rightIcon, className, inputSize = 'md', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-[var(--text-2)]">{label}</label>}
      <div className="relative flex items-center">
        {leftIcon && <span className="absolute left-2.5 text-[var(--text-4)] flex items-center">{leftIcon}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-[8px] text-sm bg-[var(--bg)] text-[var(--text)]',
            'border transition-all duration-100',
            'placeholder:text-[var(--text-4)] focus:outline-none focus:ring-1',
            inputSize === 'sm' ? 'h-8 px-2.5' : 'h-9 px-3',
            error
              ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20'
              : 'border-[var(--border)] focus:border-[var(--border-focus)] focus:ring-[var(--accent)]/20',
            leftIcon && 'pl-8',
            rightIcon && 'pr-8',
            className
          )}
          {...props}
        />
        {rightIcon && <span className="absolute right-2.5 text-[var(--text-4)] flex items-center">{rightIcon}</span>}
      </div>
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
      {helper && !error && <p className="text-xs text-[var(--text-4)]">{helper}</p>}
    </div>
  )
})
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-[var(--text-2)]">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full min-h-[80px] p-3 rounded-[8px] text-sm bg-[var(--bg)] text-[var(--text)]',
          'border transition-all duration-100 resize-y',
          'placeholder:text-[var(--text-4)] focus:outline-none focus:ring-1',
          error
            ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20'
            : 'border-[var(--border)] focus:border-[var(--border-focus)] focus:ring-[var(--accent)]/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectOption { value: string; label: string }

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, placeholder, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-[var(--text-2)]">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full h-9 pl-3 pr-8 rounded-[8px] text-sm bg-[var(--bg)] text-[var(--text)]',
            'border transition-all duration-100 appearance-none cursor-pointer',
            'focus:outline-none focus:ring-1',
            error
              ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20'
              : 'border-[var(--border)] focus:border-[var(--border-focus)] focus:ring-[var(--accent)]/20',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-4)]" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'
