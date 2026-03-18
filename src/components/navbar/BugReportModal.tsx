'use client'

import { useState, useRef } from 'react'
import { X, Bug, Send, ImageIcon, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function BugReportModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Screenshot must be under 5MB.'); return }
    setError('')
    setScreenshot(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { setError('Screenshot must be under 5MB.'); return }
    setError('')
    setScreenshot(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    setSubmitting(true)
    setError('')
    const supabase = createClient()

    let screenshot_url: string | null = null
    if (screenshot) {
      const ext = screenshot.name.split('.').pop()
      const path = `${user?.id ?? 'anon'}/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bug-screenshots')
        .upload(path, screenshot, { upsert: true })
      if (uploadError) {
        setError('Failed to upload screenshot. Submitting without it.')
      } else if (uploadData) {
        const { data: urlData } = supabase.storage.from('bug-screenshots').getPublicUrl(uploadData.path)
        screenshot_url = urlData.publicUrl
      }
    }

    const { error: dbError } = await supabase.from('bug_reports').insert({
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      description: description.trim(),
      screenshot_url,
    })

    if (dbError) {
      setError('Failed to submit report. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setSuccess(true)
    setTimeout(onClose, 2500)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <Bug className="w-4.5 h-4.5 text-red-500" />
            </div>
            <div>
              <h2 className="font-bold text-charcoal text-sm">Report a Bug</h2>
              <p className="text-[11px] text-gray-400">Help us improve GroceryGlow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-14 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-bold text-charcoal text-lg mb-1">Bug Reported!</h3>
            <p className="text-sm text-gray-400">Thank you for helping us improve GroceryGlow.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-5">
            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Describe the Issue <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What went wrong? What were you doing when it happened? Include any error messages you saw."
                rows={4}
                className="input resize-none text-sm leading-relaxed"
                required
              />
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Screenshot <span className="text-gray-400 font-normal normal-case">(optional)</span>
              </label>

              {preview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Screenshot preview"
                    className="w-full max-h-52 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => { setScreenshot(null); setPreview(null) }}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 rounded-full shadow-sm transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {screenshot?.name}
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-forest-green/40 hover:bg-green-50/20 rounded-xl p-5 sm:p-7 flex flex-col items-center gap-2.5 cursor-pointer transition-all group"
                >
                  <div className="w-11 h-11 bg-gray-100 group-hover:bg-green-100 rounded-xl flex items-center justify-center transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-forest-green transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-forest-green transition-colors">
                      Click or drag & drop a screenshot
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP — up to 5MB</p>
                  </div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-gray-100">
              <p className="text-xs text-gray-400 truncate">
                Reporting as <span className="font-medium text-charcoal">{user?.email}</span>
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !description.trim()}
                  className="flex-1 sm:flex-none btn-secondary text-sm py-2 px-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {submitting ? 'Sending…' : 'Report Bug'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
