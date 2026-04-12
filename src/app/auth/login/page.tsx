'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BarChart3 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        // After signup, immediately sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        window.location.href = '/dashboard'
        return
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/dashboard'
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <BarChart3 className="w-8 h-8 text-indigo-500" />
          <span className="text-2xl font-bold text-white">Rank Plus</span>
        </Link>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{isSignUp ? 'Create Account' : 'Sign In'}</h1>
            <p className="text-gray-400">{isSignUp ? 'Get started with Rank Plus' : 'Welcome back to Rank Plus'}</p>
          </div>
          {error && (<div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>)}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors">{loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}</button>
          </form>
          <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gray-800" /><span className="text-sm text-gray-500">or</span><div className="flex-1 h-px bg-gray-800" /></div>
          <div className="space-y-2">
            <p className="text-center text-gray-400">{isSignUp ? 'Already have an account?' : "Don't have an account?"}</p>
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null) }} className="w-full px-4 py-2 border border-gray-700 hover:border-gray-600 text-white font-semibold rounded-lg transition-colors">{isSignUp ? 'Sign In Instead' : 'Create Account'}</button>
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mt-6"><Link href="/" className="text-indigo-400 hover:text-indigo-300">Back to Home</Link></p>
      </div>
    </div>
  )
}

