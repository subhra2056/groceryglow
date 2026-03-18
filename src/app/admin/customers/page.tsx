'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Search, Users, Mail, Phone, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, cn } from '@/lib/utils'
import type { Profile } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCustomers(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-forest-green" />
          Customers
        </h1>
        <p className="text-gray-400 text-sm mt-1">{customers.length} registered customers</p>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers…"
          className="input pl-10 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Contact</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-forest-green/10 text-forest-green rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {c.full_name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{c.full_name ?? '—'}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {c.phone ? (
                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('badge text-[10px]', c.is_active ? 'badge-green' : 'bg-gray-100 text-gray-500')}>
                      {c.is_active ? (
                        <><ShieldCheck className="w-3 h-3 inline mr-0.5" />Active</>
                      ) : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-500 text-xs">
                    {formatDate(c.created_at)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
