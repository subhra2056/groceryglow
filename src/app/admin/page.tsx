import { createClient } from '@/lib/supabase/server'
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Clock,
} from 'lucide-react'
import { formatPrice, ORDER_STATUS_COLORS } from '@/lib/utils'

async function getStats() {
  const supabase = await createClient()
  const [
    { count: orderCount },
    { count: customerCount },
    { count: productCount },
    { data: recentOrders },
    { data: totals },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id, order_number, order_status, total, created_at, delivery_full_name')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('orders').select('total').eq('payment_status', 'paid'),
  ])

  const totalRevenue = totals?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0

  return { orderCount, customerCount, productCount, recentOrders, totalRevenue }
}

export default async function AdminDashboardPage() {
  const { orderCount, customerCount, productCount, recentOrders, totalRevenue } = await getStats()

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600', change: '+12%' },
    { label: 'Total Orders', value: String(orderCount ?? 0), icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', change: '+8%' },
    { label: 'Customers', value: String(customerCount ?? 0), icon: Users, color: 'bg-purple-50 text-purple-600', change: '+24%' },
    { label: 'Products', value: String(productCount ?? 0), icon: Package, color: 'bg-orange-50 text-orange-600', change: '+3%' },
  ]

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back, Admin. Here&apos;s your store overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {change}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-green" />
            Recent Orders
          </h2>
          <a href="/admin/orders" className="text-xs text-forest-green font-medium hover:underline">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Order #</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-forest-green">{order.order_number}</td>
                  <td className="px-6 py-4 text-gray-600">{order.delivery_full_name}</td>
                  <td className="px-6 py-4">
                    <span className={`badge text-xs ${ORDER_STATUS_COLORS[order.order_status]}`}>
                      {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">{formatPrice(order.total)}</td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
