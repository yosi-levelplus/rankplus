'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Plus } from 'lucide-react'

export default function DashboardPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rank-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-gray-400">Here's what's happening with your SEO today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Keywords"
          value="847"
          change="+12"
          changePercent="+2.5%"
          icon={TrendingUp}
          isPositive={true}
        />
        <StatCard
          title="Avg Position"
          value="18.2"
          change="-1.3"
          changePercent="-6.7%"
          icon={TrendingUp}
          isPositive={true}
        />
        <StatCard
          title="Keywords Up"
          value="243"
          change="+45"
          changePercent="+22.8%"
          icon={TrendingUp}
          isPositive={true}
        />
        <StatCard
          title="Keywords Down"
          value="89"
          change="+12"
          changePercent="+15.6%"
          icon={TrendingUp}
          isPositive={false}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No recent activity yet</p>
                <p className="text-sm text-gray-500">
                  Add clients and keywords to get started
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-rank-primary hover:bg-rank-primary-dark text-white flex items-center justify-center gap-2"
                onClick={() => {}}
              >
                <Plus className="w-4 h-4" />
                Add Client
              </Button>
              <Button
                className="w-full bg-rank-secondary hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                onClick={() => {}}
              >
                <Plus className="w-4 h-4" />
                Track Keyword
              </Button>
              <Button
                className="w-full bg-rank-accent hover:bg-emerald-600 text-white flex items-center justify-center gap-2"
                onClick={() => {}}
              >
                <Plus className="w-4 h-4" />
                Run Grid Scan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
