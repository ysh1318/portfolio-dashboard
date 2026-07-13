import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

// Same design language as the public site (spec §1): white glassmorphism
// cards, rounded-[2.5rem], pink→purple→indigo gradient accents, pill
// buttons. Kept intentionally small — the dashboard is a utility app, not
// a marketing surface, so we borrow the visual language without the
// hero/banner/particle flourishes.

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-sm border border-white/60 p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  )
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
  className?: string
}) {
  const base = 'rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed'
  const styles = {
    primary: 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white hover:opacity-90',
    ghost: 'bg-white/70 text-slate-700 border border-slate-200 hover:bg-white',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-300 ${props.className ?? ''}`}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-300 ${props.className ?? ''}`}
    />
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{children}</label>
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'amber' | 'green' | 'red' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  }
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-purple-400 animate-spin" />
    </div>
  )
}

export function Toast({ message, tone = 'green' }: { message: string; tone?: 'green' | 'red' }) {
  return (
    <div
      className={`fixed bottom-6 right-6 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg z-50 ${
        tone === 'green' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      {message}
    </div>
  )
}
