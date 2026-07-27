import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { UserRole } from '@/types/auth.types'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, role, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const toast = useToast()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname
      if (from) {
        navigate(from, { replace: true })
      } else {
        const roleRedirects: Record<UserRole, string> = {
          owner: '/',
          admin: '/',
          employee: '/workspace',
          client: '/client',
        }
        navigate(roleRedirects[role] || '/', { replace: true })
      }
    }
  }, [isAuthenticated, role, navigate, location])

  const handleGoogleSignIn = async () => {
    setErrorMessage(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      console.error('Google Auth Error:', err)
      const msg = err.message || 'Failed to sign in with Google. Please try again.'
      setErrorMessage(msg)
      toast.error(msg)
      setGoogleLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    if (isSignUp && !fullName) {
      setErrorMessage('Please enter your full name.')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName)
        toast.success('Account created successfully!')
      } else {
        await signInWithEmail(email, password)
        toast.success('Signed in successfully!')
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err)
      const msg = err.message || 'Authentication failed. Please check your credentials.'
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-[var(--bg)] via-[var(--bg-2)] to-[var(--bg)] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-blue-500 text-white shadow-lg shadow-primary-500/30 mb-4">
            <Sparkles size={32} />
          </div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Ihsan OS Portal</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">
            {isSignUp ? 'Create your account to get started' : 'Sign in to access your Personal ERP workspace'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl font-medium text-sm border border-[var(--border)] bg-[var(--bg-2)] hover:bg-[var(--bg-3)] text-[var(--text)] transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mb-6"
        >
          {googleLoading ? (
            <Loader2 className="animate-spin text-primary-500" size={20} />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
          )}
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-[var(--border)] w-full" />
          <span className="bg-[var(--card-bg)] px-3 text-xs uppercase tracking-wider text-[var(--text-3)] font-semibold absolute">
            Or with email
          </span>
        </div>

        {/* Email Auth Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading || googleLoading}
                  className="pl-10"
                />
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-2)] uppercase mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || googleLoading}
                className="pl-10"
              />
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-2)] uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || googleLoading}
                className="pl-10"
              />
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-12 justify-center gap-2 text-sm font-semibold bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-primary-500/25 transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        {/* Toggle Form Mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMessage(null)
            }}
            className="text-xs text-[var(--text-2)] hover:text-primary-500 transition-colors font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] flex items-center justify-center gap-2 text-xs text-[var(--text-3)]">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Secured by Supabase OAuth & RLS</span>
        </div>
      </motion.div>
    </div>
  )
}
