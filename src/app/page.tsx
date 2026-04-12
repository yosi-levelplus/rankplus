'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { ArrowRight, BarChart3, TrendingUp, Map } from 'lucide-react'

export default function Home() {
  const [session, setSession] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(!!session)
    }

    checkSession()
  }, [supabase.auth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-800 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-rank-primary" />
            <span className="text-2xl font-bold text-white">Rank Plus</span>
          </div>
          <div className="flex gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-rank-primary hover:bg-rank-primary-dark text-white rounded-lg transition-colors font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-rank-primary hover:bg-rank-primary-dark text-white rounded-lg transition-colors font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Headline */}
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Rank Plus
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rank-primary via-rank-secondary to-rank-accent">
                SEO & Local Marketing OS
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Complete suite of tools for agencies and businesses to track rankings, manage SEO, and dominate local search results.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-rank-primary hover:bg-rank-primary-dark text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 border border-gray-700 hover:border-gray-600 text-white rounded-lg font-semibold transition-colors">
              View Demo
            </button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            {[
              {
                icon: TrendingUp,
                title: 'Rank Tracking',
                description: 'Monitor keyword rankings across search engines in real-time',
              },
              {
                icon: Map,
                title: 'Local Grid Scans',
                description: 'Analyze local search pack performance and competitiveness',
              },
              {
                icon: BarChart3,
                title: 'SEO Analytics',
                description: 'Deep insights into traffic, keywords, and competitor data',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                >
                  <Icon className="w-12 h-12 text-rank-primary mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
          <p>
            &copy; 2024 Rank Plus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
