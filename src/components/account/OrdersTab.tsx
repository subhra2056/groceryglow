'use client'

import Link from 'next/link'
import { Package } from 'lucide-react'
import { SkeletonOrderCard } from '@/components/ui/Skeleton'
import {
  formatPrice,
  formatDate,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from '@/lib/utils'
import type { Order } from '@/types'

interface OrdersTabProps {
  orders: Order[]
  dataLoading: boolean
}

export default function OrdersTab({ orders, dataLoading }: OrdersTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-charcoal">My Orders</h2>
      {dataLoading ? (
        <div className="space-y-4">
          <SkeletonOrderCard />
          <SkeletonOrderCard />
          <SkeletonOrderCard />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No orders yet. Start shopping!</p>
          <Link href="/shop" className="btn-primary mt-4 inline-flex">Browse Products</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-400">Order</p>
                <p className="font-bold text-charcoal text-sm">{order.order_number}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`badge text-xs px-2.5 py-1 ${ORDER_STATUS_COLORS[order.order_status]}`}>
                  {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                </span>
                <span className={`badge text-xs px-2.5 py-1 ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
              </div>
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                    <span className="text-xs text-gray-600 truncate max-w-[100px]">{item.name}</span>
                    <span className="text-[10px] text-gray-400">×{item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{formatDate(order.created_at)}</span>
              <span className="font-bold text-forest-green">{formatPrice(order.total)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
