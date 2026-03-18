'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Search, Users, Mail, Phone, ShieldCheck, ShieldOff, ShieldX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, cn } from '@/lib/utils'
import type { Profile } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

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

  const toggleBlock = async (customer: Profile) => {
    setTogglingId(customer.id)
    const supabase = createClient()
    // Explicit boolean: if currently blocked (false) → unblock (true), otherwise → block (false)
    const newStatus = customer.is_active === false ? true : false
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newStatus })
      .eq('id', customer.id)

    if (!error) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, is_active: newStatus } : c))
      )
    }
    setTogglingId(null)
  }

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50/60">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="px-5 py-3 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className={cn('border-b border-gray-50 transition-colors', c.is_active !== false ? 'hover:bg-gray-50/60' : 'bg-red-50/30 hover:bg-red-50/50')}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0',
                        c.is_active !== false ? 'bg-forest-green/10 text-forest-green' : 'bg-red-100 text-red-400'
                      )}>
                        {c.full_name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.full_name ?? '—'}</p>
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
                    {c.is_active !== false ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-50 text-green-600">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-500">
                        <ShieldX className="w-3 h-3" /> Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-400 text-xs">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggleBlock(c)}
                      disabled={togglingId === c.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50',
                        c.is_active !== false
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      )}
                    >
                      {togglingId === c.id ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : c.is_active !== false ? (
                        <><ShieldOff className="w-3 h-3" /> Block</>
                      ) : (
                        <><ShieldCheck className="w-3 h-3" /> Unblock</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
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
