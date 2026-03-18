'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { Bug, ExternalLink, ImageIcon, Trash2, Calendar, Mail, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, cn } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type BugReport = {
  id: string
  user_id: string | null
  user_email: string | null
  description: string
  screenshot_url: string | null
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
}

const STATUS_CONFIG: Record<BugReport['status'], { label: string; icon: typeof AlertCircle; bg: string; text: string; border: string }> = {
  open:        { label: 'Open',        icon: AlertCircle,   bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  in_progress: { label: 'In Progress', icon: Clock,         bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  resolved:    { label: 'Resolved',    icon: CheckCircle2,  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
}

export default function BugReportsPage() {
  const [reports, setReports] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<BugReport['status'] | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const supabase = createClient()

  const loadReports = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('bug_reports').select('*').order('created_at', { ascending: false })
    if (filterStatus) query = query.eq('status', filterStatus)
    const { data } = await query
    setReports(data ?? [])
    setLoading(false)
  }, [supabase, filterStatus])

  useEffect(() => { loadReports() }, [loadReports])

  const updateStatus = async (id: string, status: BugReport['status']) => {
    setUpdatingId(id)
    await supabase.from('bug_reports').update({ status }).eq('id', id)
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
    setUpdatingId(null)
  }

  const deleteReport = async (id: string) => {
    if (!confirm('Delete this bug report? This cannot be undone.')) return
    await supabase.from('bug_reports').delete().eq('id', id)
    setReports((prev) => prev.filter((r) => r.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const openCount = reports.filter((r) => r.status === 'open').length
  const inProgressCount = reports.filter((r) => r.status === 'in_progress').length
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length
  const selected = reports.find((r) => r.id === selectedId) ?? null

  return (
    <div className="p-6 md:p-8 h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
            <Bug className="w-4 h-4 text-red-500" />
          </div>
          Bug Reports
        </h1>
        <p className="text-gray-400 text-sm mt-1">Review and manage user-submitted bug reports</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Open', count: openCount, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          { label: 'In Progress', count: inProgressCount, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Resolved', count: resolvedCount, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        ].map(({ label, count, color, bg, border }) => (
          <div key={label} className={cn('rounded-2xl p-4 border', bg, border)}>
            <p className={cn('text-2xl font-semibold tracking-tight', color)}>{count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {([['', 'All', reports.length], ['open', 'Open', openCount], ['in_progress', 'In Progress', inProgressCount], ['resolved', 'Resolved', resolvedCount]] as const).map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => { setFilterStatus(val); setSelectedId(null) }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
              filterStatus === val
                ? 'bg-charcoal text-white border-charcoal'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            )}
          >
            {label}
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', filterStatus === val ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500')}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Bug className="w-6 h-6 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-400 text-sm">No bug reports found</p>
          <p className="text-xs text-gray-300 mt-1">Reports submitted by users will appear here</p>
        </div>
      ) : (
        <div className={cn('flex gap-5', selected ? 'items-start' : '')}>
          {/* List */}
          <div className={cn('space-y-2', selected ? 'w-80 flex-shrink-0' : 'flex-1')}>
            {reports.map((report) => {
              const cfg = STATUS_CONFIG[report.status]
              const StatusIcon = cfg.icon
              const isSelected = selectedId === report.id
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedId(isSelected ? null : report.id)}
                  className={cn(
                    'bg-white rounded-xl border cursor-pointer transition-all group',
                    isSelected
                      ? 'border-forest-green shadow-md'
                      : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.bg, cfg.text, cfg.border)}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteReport(report.id) }}
                        className="p-1 text-gray-200 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className={cn('text-sm text-charcoal font-medium leading-snug', selected ? 'line-clamp-2' : 'line-clamp-1')}>
                      {report.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Mail className="w-3 h-3" />
                        {report.user_email ?? 'Guest'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(report.created_at)}
                      </span>
                      {report.screenshot_url && (
                        <span className="flex items-center gap-1 text-[10px] text-forest-green">
                          <ImageIcon className="w-3 h-3" /> Screenshot
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Detail header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => { const cfg = STATUS_CONFIG[selected.status]; const I = cfg.icon; return (
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', cfg.bg, cfg.text, cfg.border)}>
                      <I className="w-3.5 h-3.5" />{cfg.label}
                    </span>
                  )})()}
                  <span className="text-xs text-gray-400">{formatDate(selected.created_at)}</span>
                </div>
                <button
                  onClick={() => deleteReport(selected.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Reporter */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Reporter</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-forest-green/10 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5 text-forest-green" />
                    </div>
                    <span className="text-sm font-medium text-charcoal">{selected.user_email ?? 'Guest / Not logged in'}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                  </div>
                </div>

                {/* Screenshot */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Screenshot</p>
                  {selected.screenshot_url ? (
                    <div
                      className="relative rounded-xl overflow-hidden border border-gray-200 cursor-zoom-in group"
                      onClick={() => setLightboxUrl(selected.screenshot_url)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selected.screenshot_url} alt="Bug screenshot" className="w-full max-h-64 object-contain bg-gray-50" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium">
                          <ExternalLink className="w-3.5 h-3.5" /> View fullscreen
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-10 flex flex-col items-center gap-2 text-center">
                      <ImageIcon className="w-7 h-7 text-gray-300" />
                      <p className="text-xs text-gray-400">No screenshot attached</p>
                    </div>
                  )}
                </div>

                {/* Status update */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Update Status</p>
                  <div className="flex gap-2">
                    {(['open', 'in_progress', 'resolved'] as const).map((s) => {
                      const cfg = STATUS_CONFIG[s]
                      const isCurrent = selected.status === s
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatus(selected.id, s)}
                          disabled={isCurrent || updatingId === selected.id}
                          className={cn(
                            'flex-1 py-2 rounded-xl text-xs font-semibold transition-all border',
                            isCurrent
                              ? cn(cfg.bg, cfg.text, cfg.border, 'cursor-default')
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                          )}
                        >
                          {updatingId === selected.id && !isCurrent ? (
                            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                          ) : cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="Screenshot fullsize" className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}
