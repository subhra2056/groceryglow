'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronDown, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, ORDER_STATUS_COLORS, cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: 'confirmed',
  confirmed: 'packed',
  packed: 'shipped',
  shipped: 'delivered',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  const loadOrders = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false })

    if (filterStatus) query = query.eq('order_status', filterStatus)

    const { data } = await query
    setOrders(data ?? [])
    setLoading(false)
  }, [supabase, filterStatus])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const updateStatus = async (order: Order, newStatus: OrderStatus) => {
    setUpdatingId(order.id)
    await supabase
      .from('orders')
      .update({ order_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', order.id)
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, order_status: newStatus } : o))
    )
    setUpdatingId(null)
  }

  const filteredOrders = orders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.delivery_full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-forest-green" />
          Orders
        </h1>
        <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or customer…"
            className="input pl-10 text-sm w-60"
          />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
            className="input text-sm appearance-none pr-8 w-48"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Row */}
              <div
                className="flex flex-wrap items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex-shrink-0 min-w-0">
                  <p className="text-xs text-gray-400">Order</p>
                  <p className="font-bold text-forest-green text-sm">{order.order_number}</p>
                </div>

                <div className="flex-1 min-w-[120px]">
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="text-sm font-medium text-charcoal truncate">{order.delivery_full_name}</p>
                </div>

                <div className="hidden md:block flex-shrink-0">
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                </div>

                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <span className={cn('badge text-xs', ORDER_STATUS_COLORS[order.order_status])}>
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </span>
                </div>

                <div className="ml-auto flex-shrink-0">
                  <p className="font-bold text-forest-green">{formatPrice(order.total)}</p>
                </div>

                {/* Action buttons — grouped so they never split across rows */}
                {(NEXT_STATUS[order.order_status] || ['placed', 'confirmed'].includes(order.order_status)) && (
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {NEXT_STATUS[order.order_status] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateStatus(order, NEXT_STATUS[order.order_status]!)
                        }}
                        disabled={updatingId === order.id}
                        className="px-3 py-1.5 bg-forest-green text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {updatingId === order.id ? (
                          <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block" />
                        ) : (
                          `Mark as ${NEXT_STATUS[order.order_status]!.charAt(0).toUpperCase() + NEXT_STATUS[order.order_status]!.slice(1)}`
                        )}
                      </button>
                    )}
                    {['placed', 'confirmed'].includes(order.order_status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateStatus(order, 'cancelled')
                        }}
                        disabled={updatingId === order.id}
                        className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {expandedId === order.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Delivery info */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Delivery Address
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {order.delivery_full_name}<br />
                        {order.delivery_phone}<br />
                        {order.delivery_address_line_1}
                        {order.delivery_address_line_2 && `, ${order.delivery_address_line_2}`}<br />
                        {order.delivery_city}, {order.delivery_state} {order.delivery_postal_code}<br />
                        {order.delivery_country}
                      </p>
                    </div>

                    {/* Order items */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Items
                      </p>
                      <div className="space-y-1.5">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate mr-4">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                            <span className="font-medium flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm font-bold">
                          <span>Total</span>
                          <span className="text-forest-green">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No orders found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
