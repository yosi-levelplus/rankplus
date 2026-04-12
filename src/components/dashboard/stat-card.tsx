import { LucideIcon } from 'lucide-react'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change: string
  changePercent: string
  icon: LucideIcon
  isPositive: boolean
}

export function StatCard({
  title,
  value,
  change,
  changePercent,
  icon: Icon,
  isPositive,
}: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-rank-primary opacity-80" />
      </div>

      <div className="flex items-center gap-2">
        {isPositive ? (
          <ArrowUp className="w-4 h-4 text-emerald-400" />
        ) : (
          <ArrowDown className="w-4 h-4 text-red-400" />
        )}
        <span
          className={`text-sm font-medium ${
            isPositive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {change}
        </span>
        <span className="text-sm text-gray-500">{changePercent}</span>
      </div>
    </div>
  )
}
