'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, X, Save, Tag, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils'

interface CatForm {
  name: string
  slug: string
  description: string
  image: string
  is_featured: boolean
}

const emptyForm: CatForm = { name: '', slug: '', description: '', image: '', is_featured: false }

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<CatForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(null); setShowModal(true) }
  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '', image: cat.image ?? '', is_featured: cat.is_featured })
    setError(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.slug.trim()) { setError('Slug is required.'); return }
    setSaving(true)
    const payload = { name: form.name.trim(), slug: form.slug.trim(), description: form.description || null, image: form.image || null, is_featured: form.is_featured }
    if (editing) {
      const { error: err } = await supabase.from('categories').update(payload).eq('id', editing.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('categories').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false); setShowModal(false); load()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id)
    setDeleteConfirm(null); setCategories((p) => p.filter((c) => c.id !== id))
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Tag className="w-6 h-6 text-forest-green" />Categories</h1>
          <p className="text-gray-400 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Category</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-card transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.slug}</p>
                  {cat.is_featured && <span className="badge-orange text-[10px] mt-1 inline-block">Featured</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteConfirm(cat.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {cat.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{cat.description}</p>}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-10 text-center shadow-sm">
              <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No categories yet.</p>
            </div>
          )}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg mb-2">Delete Category?</h3>
            <p className="text-gray-500 text-sm mb-5">Products in this category will lose their category assignment.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-charcoal">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))} className="input text-sm" placeholder="Fresh Fruits" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Slug *</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="input text-sm font-mono" placeholder="fresh-fruits" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input text-sm resize-none" rows={2} placeholder="Category description…" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Image URL</label>
                <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className="input text-sm" placeholder="https://…" />
              </div>
              <button onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all', form.is_featured ? 'border-forest-green bg-forest-green/10 text-forest-green' : 'border-gray-200 text-gray-500')}>
                Featured Category {form.is_featured && <Check className="w-3.5 h-3.5" />}
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
