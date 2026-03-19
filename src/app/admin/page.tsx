import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  PackageCheck,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

async function getStats() {
  const supabase = await createClient()
  const [
    { count: orderCount },
    { count: customerCount },
    { count: productCount },
    { count: lowStockCount },
    { data: recentOrders },
    { data: totals },
    { data: statusBreakdown },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock', 5).gt('stock', 0),
    supabase
      .from('orders')
      .select('id, order_number, order_status, total, created_at, delivery_full_name')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('orders').select('total').eq('payment_status', 'paid'),
    supabase.from('orders').select('order_status'),
  ])

  const totalRevenue = totals?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0

  const statusCounts: Record<string, number> = {}
  statusBreakdown?.forEach(({ order_status }) => {
    statusCounts[order_status] = (statusCounts[order_status] ?? 0) + 1
  })

  return { orderCount, customerCount, productCount, lowStockCount, recentOrders, totalRevenue, statusCounts }
}

const STATUS_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  placed:    { icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50',  label: 'Placed' },
  confirmed: { icon: CheckCircle,  color: 'text-blue-600',   bg: 'bg-blue-50',    label: 'Confirmed' },
  packed:    { icon: PackageCheck, color: 'text-indigo-600', bg: 'bg-indigo-50',  label: 'Packed' },
  shipped:   { icon: Truck,        color: 'text-purple-600', bg: 'bg-purple-50',  label: 'Shipped' },
  delivered: { icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50',   label: 'Delivered' },
  cancelled: { icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50',     label: 'Cancelled' },
}

export default async function AdminDashboardPage() {
  const { orderCount, customerCount, productCount, lowStockCount, recentOrders, totalRevenue, statusCounts } =
    await getStats()

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-600',
      lightBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+12%',
    },
    {
      label: 'Total Orders',
      value: String(orderCount ?? 0),
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+8%',
    },
    {
      label: 'Customers',
      value: String(customerCount ?? 0),
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      lightBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      change: '+24%',
    },
    {
      label: 'Products',
      value: String(productCount ?? 0),
      icon: Package,
      gradient: 'from-orange-400 to-sunset-orange',
      lightBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      change: '+3%',
    },
  ]

  const now = new Date()
  const timeGreeting =
    now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50/60">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5">{dateStr}</p>
          <h1 className="text-2xl font-semibold text-gray-900">{timeGreeting}, Admin 👋</h1>
          <p className="text-gray-400 text-sm mt-0.5">Here&apos;s what&apos;s happening in your store today.</p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-green text-white text-sm font-medium rounded-xl hover:bg-green-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" /> Manage Orders
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, lightBg, iconColor, change }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3 md:mb-5">
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl ${lightBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${iconColor}`} />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                <TrendingUp className="w-2 h-2" /> {change}
              </span>
            </div>
            <p className="text-xl md:text-3xl font-semibold text-gray-900 leading-none mb-1">{value}</p>
            <p className="text-[11px] md:text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Low stock alert ── */}
      {(lowStockCount ?? 0) > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">{lowStockCount} product{lowStockCount !== 1 ? 's' : ''}</span> running low on stock.
          </p>
          <Link href="/admin/products" className="ml-auto text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900">
            Review →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Recent orders table ── */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900 text-base">Recent Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest transactions from your store</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-forest-green hover:text-green-800 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.map((order) => {
                  const meta = STATUS_META[order.order_status]
                  const StatusIcon = meta?.icon ?? Clock
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <span className="font-medium text-forest-green text-xs">{order.order_number}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-forest-green to-leaf-green flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                            {(order.delivery_full_name ?? 'U')[0].toUpperCase()}
                          </div>
                          <span className="text-gray-700 text-xs">{order.delivery_full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${meta?.bg ?? 'bg-gray-50'} ${meta?.color ?? 'text-gray-600'}`}>
                          <StatusIcon className="w-3 h-3" />
                          {meta?.label ?? order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-800 text-sm">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  )
                })}
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-6">

          {/* Order status breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 text-base mb-1">Order Pipeline</h2>
            <p className="text-xs text-gray-400 mb-5">Breakdown by current status</p>
            <div className="space-y-3">
              {Object.entries(STATUS_META).map(([key, meta]) => {
                const count = statusCounts[key] ?? 0
                const total = orderCount ?? 1
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                const StatusIcon = meta.icon
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{meta.label}</span>
                        <span className="text-xs text-gray-400">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${
                            key === 'delivered' ? 'from-green-400 to-emerald-500' :
                            key === 'placed'    ? 'from-yellow-400 to-amber-400' :
                            key === 'confirmed' ? 'from-blue-400 to-blue-500' :
                            key === 'packed'    ? 'from-indigo-400 to-indigo-500' :
                            key === 'shipped'   ? 'from-purple-400 to-purple-500' :
                                                  'from-red-400 to-red-500'
                          } transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 text-base mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Add New Product', href: '/admin/products', icon: Package, color: 'bg-orange-50 text-orange-500' },
                { label: 'View All Orders', href: '/admin/orders', icon: ShoppingCart, color: 'bg-blue-50 text-blue-500' },
                { label: 'Manage Categories', href: '/admin/categories', icon: Users, color: 'bg-violet-50 text-violet-500' },
                { label: 'See Bug Reports', href: '/admin/bug-reports', icon: AlertTriangle, color: 'bg-red-50 text-red-400' },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 ml-auto transition-colors" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
