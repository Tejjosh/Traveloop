import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  // Simulated Analytics Data for the Dashboard
  const metrics = {
    totalRevenue: 124500,
    activeUsers: 3420,
    tripsCreated: 890,
    premiumImmersions: 145
  }

  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => setLoading(false), 800)
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-mist flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pacific"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-mist py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-pacific mb-2">Platform Analytics</h1>
            <p className="text-terracotta font-medium text-sm">Real-time overview of Traveloop operations.</p>
          </div>
          <button className="bg-pacific text-mist font-bold px-6 py-2 rounded-xl hover:bg-pacific/90 flex items-center gap-2 shadow-sm">
            <span>📄</span> Export PDF Report
          </button>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Volume (USD)', value: `$${metrics.totalRevenue.toLocaleString()}`, trend: '+14%', color: 'text-matcha' },
            { label: 'Active Travelers', value: metrics.activeUsers.toLocaleString(), trend: '+5%', color: 'text-pacific' },
            { label: 'Journeys Created', value: metrics.tripsCreated, trend: '+22%', color: 'text-citrus' },
            { label: 'Premium Immersions', value: metrics.premiumImmersions, trend: '+45%', color: 'text-terracotta' }
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-coconut shadow-sm hover:-translate-y-1 transition-transform">
              <p className="text-sm font-bold text-pacific/50 uppercase tracking-wider mb-2">{kpi.label}</p>
              <div className="flex items-end justify-between">
                <h3 className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</h3>
                <span className="text-xs font-bold text-matcha bg-matcha/10 px-2 py-1 rounded-md">{kpi.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Charts & Data Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Visual Data Representation (Pseudo-Chart via Tailwind) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-coconut shadow-sm">
            <h3 className="text-xl font-bold text-pacific mb-6">Revenue & Trip Volume (Last 6 Months)</h3>
            
            <div className="h-64 flex items-end gap-4 md:gap-8 justify-between pt-10">
              {/* CSS Bar Chart rendering */}
              {[40, 65, 45, 80, 55, 95].map((height, i) => (
                <div key={i} className="w-full flex flex-col justify-end items-center group">
                  {/* Tooltip on hover */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-pacific mb-2">${(height * 1200).toLocaleString()}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-pacific to-citrus rounded-t-lg transition-all duration-1000 ease-out relative overflow-hidden" 
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors cursor-pointer"></div>
                  </div>
                  <span className="text-xs font-bold text-pacific/50 mt-4 block">Month {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Data: Trip Types Distribution */}
          <div className="bg-pacific text-mist rounded-3xl p-8 border border-pacific/80 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-matcha rounded-full blur-3xl opacity-20"></div>
            <div>
              <h3 className="text-xl font-bold text-apricot mb-6 relative z-10">Popular Vibe Distribution</h3>
              <div className="space-y-4 relative z-10">
                {[
                  { type: 'Cultural', pct: 45, color: 'bg-citrus' },
                  { type: 'Wellness', pct: 30, color: 'bg-matcha' },
                  { type: 'Adventure', pct: 15, color: 'bg-terracotta' },
                  { type: 'Romantic', pct: 10, color: 'bg-coconut' }
                ].map(item => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span>{item.type}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="w-full bg-mist/20 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full mt-8 border border-mist/30 text-mist text-sm font-bold py-3 rounded-xl hover:bg-mist/10 transition-colors z-10 relative">
              View Detailed Heatmap
            </button>
          </div>
        </div>

        {/* Data Management Table */}
        <div className="mt-8 bg-white rounded-3xl border border-coconut shadow-sm overflow-hidden">
          <div className="p-6 border-b border-coconut flex justify-between items-center">
            <h3 className="text-xl font-bold text-pacific">Recent High-Ticket Bookings</h3>
            <input type="text" placeholder="Search orders..." className="bg-mist border border-coconut rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-citrus text-pacific" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-mist text-pacific/60 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Traveler</th>
                  <th className="p-4 font-bold">Destination</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Sarah Jenkins', dest: 'Kyoto Cultural Tour', amt: '$4,200', status: 'Confirmed', color: 'text-matcha bg-matcha/10' },
                  { name: 'Michael Chen', dest: 'Patagonia Circuit', amt: '$3,850', status: 'Pending', color: 'text-citrus bg-citrus/10' },
                  { name: 'Emma Watson', dest: 'Indian Wedding Package', amt: '$8,500', status: 'Confirmed', color: 'text-matcha bg-matcha/10' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-coconut/50 hover:bg-mist/50 transition-colors">
                    <td className="p-4 font-bold text-pacific">{row.name}</td>
                    <td className="p-4 text-pacific/80">{row.dest}</td>
                    <td className="p-4 font-bold text-pacific">{row.amt}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.color}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}