'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Search,
  Package,
  Check,
  Star,
  Leaf,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'
import type { Product, Category } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProductForm {
  name: string
  slug: string
  category_id: string
  description: string
  short_description: string
  price: string
  discount_price: string
  stock: string
  unit: string
  images: string
  is_featured: boolean
  is_organic: boolean
  tags: string
}

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  category_id: '',
  description: '',
  short_description: '',
  price: '',
  discount_price: '',
  stock: '',
  unit: '',
  images: '',
  is_featured: false,
  is_organic: false,
  tags: '',
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])
    setProducts(prods ?? [])
    setCategories(cats ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openCreate = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      slug: product.slug,
      category_id: product.category_id ?? '',
      description: product.description ?? '',
      short_description: product.short_description ?? '',
      price: String(product.price),
      discount_price: product.discount_price ? String(product.discount_price) : '',
      stock: String(product.stock),
      unit: product.unit ?? '',
      images: product.images?.join(', ') ?? '',
      is_featured: product.is_featured,
      is_organic: product.is_organic,
      tags: product.tags?.join(', ') ?? '',
    })
    setFormError(null)
    setShowModal(true)
  }

  const updateField = (field: keyof ProductForm, value: string | boolean) => {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      // Auto-generate slug when name changes and it's a new product
      if (field === 'name' && typeof value === 'string' && !editingProduct) {
        updated.slug = slugify(value)
      }
      return updated
    })
  }

  const handleSave = async () => {
    setFormError(null)

    if (!form.name.trim()) { setFormError('Product name is required.'); return }
    if (!form.price || isNaN(Number(form.price))) { setFormError('Valid price is required.'); return }
    if (!form.stock || isNaN(Number(form.stock))) { setFormError('Valid stock count is required.'); return }
    if (!form.slug.trim()) { setFormError('Slug is required.'); return }

    setSaving(true)

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category_id: form.category_id || null,
      description: form.description.trim() || null,
      short_description: form.short_description.trim() || null,
      price: parseFloat(form.price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      stock: parseInt(form.stock, 10),
      unit: form.unit.trim() || null,
      images: form.images
        ? form.images.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      is_featured: form.is_featured,
      is_organic: form.is_organic,
      tags: form.tags
        ? form.tags.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      updated_at: new Date().toISOString(),
    }

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id)
      if (error) {
        setFormError(error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) {
        setFormError(error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setShowModal(false)
    await loadData()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setDeleteConfirm(null)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} products in the catalog</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="input pl-10 text-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Flags</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0]} alt="" className="w-full h-full object-contain rounded-lg" />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-[11px] text-gray-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{product.category?.name ?? '—'}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-forest-green">{formatPrice(product.price)}</p>
                      {product.discount_price && (
                        <p className="text-[11px] text-gray-400 line-through">{formatPrice(product.discount_price)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'font-semibold',
                        product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-orange-500' : 'text-gray-700'
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {product.is_featured && (
                          <span className="badge-orange text-[10px] flex items-center gap-1">
                            <Star className="w-2.5 h-2.5" /> Featured
                          </span>
                        )}
                        {product.is_organic && (
                          <span className="badge-green text-[10px] flex items-center gap-1">
                            <Leaf className="w-2.5 h-2.5" /> Organic
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                      {search ? 'No products match your search.' : 'No products yet. Click "Add Product" to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-charcoal mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This action cannot be undone. The product will be permanently removed from the catalog.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-charcoal">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {formError}
                </div>
              )}

              {/* Row: name + slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Product Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="input text-sm"
                    placeholder="e.g. Organic Bananas"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">Slug *</label>
                  <input
                    value={form.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="input text-sm"
                    placeholder="organic-bananas"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="label-field">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => updateField('category_id', e.target.value)}
                  className="input text-sm"
                >
                  <option value="">— No Category —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Short description */}
              <div>
                <label className="label-field">Short Description</label>
                <input
                  value={form.short_description}
                  onChange={(e) => updateField('short_description', e.target.value)}
                  className="input text-sm"
                  placeholder="Brief tagline shown on product cards"
                />
              </div>

              {/* Full description */}
              <div>
                <label className="label-field">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="input text-sm resize-none"
                  rows={3}
                  placeholder="Detailed product description…"
                />
              </div>

              {/* Price, discount price, stock, unit */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="label-field">Price (USD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    className="input text-sm"
                    placeholder="2.99"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">Discount Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount_price}
                    onChange={(e) => updateField('discount_price', e.target.value)}
                    className="input text-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="label-field">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => updateField('stock', e.target.value)}
                    className="input text-sm"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">Unit</label>
                  <input
                    value={form.unit}
                    onChange={(e) => updateField('unit', e.target.value)}
                    className="input text-sm"
                    placeholder="kg / dozen / piece"
                  />
                </div>
              </div>

              {/* Image URLs */}
              <div>
                <label className="label-field">Image URLs</label>
                <textarea
                  value={form.images}
                  onChange={(e) => updateField('images', e.target.value)}
                  className="input text-sm resize-none font-mono text-xs"
                  rows={2}
                  placeholder="Comma-separated URLs: https://…/image1.jpg, https://…/image2.jpg"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Paste Supabase Storage URLs or any public image URLs, separated by commas.
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="label-field">Tags</label>
                <input
                  value={form.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  className="input text-sm"
                  placeholder="offer, sale, new — comma separated"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'is_featured' as const, label: 'Featured Product', icon: Star },
                  { key: 'is_organic' as const, label: 'Organic', icon: Leaf },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField(key, !form[key])}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                      form[key]
                        ? 'border-forest-green bg-forest-green/10 text-forest-green'
                        : 'border-gray-200 text-gray-500 hover:border-forest-green/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {form[key] && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="btn-ghost">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-secondary flex items-center gap-2">
                {saving ? (
                  <><LoadingSpinner size="sm" /> Saving…</>
                ) : (
                  <><Save className="w-4 h-4" /> {editingProduct ? 'Save Changes' : 'Create Product'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .label-field {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.375rem;
        }
      `}</style>
    </div>
  )
}
