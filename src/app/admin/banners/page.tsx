'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Banner } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils'

interface BannerForm {
  title: string
  subtitle: string
  image: string
  cta_text: string
  cta_link: string
  is_active: boolean
}

const emptyForm: BannerForm = { title: '', subtitle: '', image: '', cta_text: '', cta_link: '', is_active: true }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState<BannerForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false })
    setBanners(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(null); setShowModal(true) }
  const openEdit = (b: Banner) => {
    setEditing(b)
    setForm({ title: b.title, subtitle: b.subtitle ?? '', image: b.image ?? '', cta_text: b.cta_text ?? '', cta_link: b.cta_link ?? '', is_active: b.is_active })
    setError(null); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    const payload = { title: form.title.trim(), subtitle: form.subtitle || null, image: form.image || null, cta_text: form.cta_text || null, cta_link: form.cta_link || null, is_active: form.is_active }
    if (editing) {
      const { error: err } = await supabase.from('banners').update(payload).eq('id', editing.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('banners').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false); setShowModal(false); load()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('banners').delete().eq('id', id)
    setBanners((p) => p.filter((b) => b.id !== id))
  }

  const toggleActive = async (b: Banner) => {
    await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id)
    setBanners((p) => p.map((x) => x.id === b.id ? { ...x, is_active: !x.is_active } : x))
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ImageIcon className="w-6 h-6 text-forest-green" />Banners</h1>
          <p className="text-gray-400 text-sm mt-1">{banners.length} banners</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Banner</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">{b.title}</p>
                  <span className={cn('badge text-[10px]', b.is_active ? 'badge-green' : 'bg-gray-100 text-gray-500')}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {b.subtitle && <p className="text-sm text-gray-500 mt-0.5">{b.subtitle}</p>}
                {b.cta_text && <p className="text-xs text-forest-green mt-1">CTA: {b.cta_text} → {b.cta_link}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(b)} className={cn('text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors', b.is_active ? 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500' : 'border-green-200 text-green-600 hover:bg-green-50')}>
                  {b.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openEdit(b)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(b.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <ImageIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No banners yet.</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-charcoal">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
              {[
                { key: 'title', label: 'Title *', placeholder: 'Summer Sale — 30% Off' },
                { key: 'subtitle', label: 'Subtitle', placeholder: 'Fresh produce at unbeatable prices' },
                { key: 'image', label: 'Image URL', placeholder: 'https://…' },
                { key: 'cta_text', label: 'CTA Button Text', placeholder: 'Shop Now' },
                { key: 'cta_link', label: 'CTA Link', placeholder: '/shop?tag=sale' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
                  <input value={form[key as keyof BannerForm] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="input text-sm" placeholder={placeholder} />
                </div>
              ))}
              <button onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all', form.is_active ? 'border-forest-green bg-forest-green/10 text-forest-green' : 'border-gray-200 text-gray-500')}>
                Active {form.is_active && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-secondary">
                {saving ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" />{editing ? 'Save' : 'Create'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
