'use client'

import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Check,
  Home,
  Briefcase,
  MoreHorizontal,
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface UserAddress {
  id: string
  label: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

type AddressFormState = {
  label: 'Home' | 'Work' | 'Other'
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

const LABEL_STYLES: Record<string, string> = {
  Home: 'bg-blue-100 text-blue-700',
  Work: 'bg-purple-100 text-purple-700',
  Other: 'bg-gray-100 text-gray-600',
}

const LABEL_ICONS: Record<string, typeof Home> = {
  Home: Home,
  Work: Briefcase,
  Other: MoreHorizontal,
}

interface AddressesTabProps {
  addresses: UserAddress[]
  dataLoading: boolean
  showAddressForm: boolean
  setShowAddressForm: (v: boolean) => void
  editingAddress: UserAddress | null
  setEditingAddress: (v: UserAddress | null) => void
  addressForm: AddressFormState
  setAddressForm: React.Dispatch<React.SetStateAction<AddressFormState>>
  savingAddress: boolean
  addressError: string | null
  setAddressError: (v: string | null) => void
  handleSaveAddress: () => Promise<void>
  handleSetDefault: (id: string) => Promise<void>
  handleDeleteAddress: (id: string) => Promise<void>
  handleEditAddress: (addr: UserAddress) => void
  emptyAddressForm: AddressFormState
}

export default function AddressesTab({
  addresses,
  dataLoading,
  showAddressForm,
  setShowAddressForm,
  editingAddress,
  setEditingAddress,
  addressForm,
  setAddressForm,
  savingAddress,
  addressError,
  setAddressError,
  handleSaveAddress,
  handleSetDefault,
  handleDeleteAddress,
  handleEditAddress,
  emptyAddressForm,
}: AddressesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-charcoal">My Addresses</h2>
        {!showAddressForm && (
          <button
            onClick={() => {
              setShowAddressForm(true)
              setEditingAddress(null)
              setAddressForm(emptyAddressForm)
              setAddressError(null)
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-forest-green hover:bg-forest-green/90 px-3 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        )}
      </div>

      {dataLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* Address list */}
          {addresses.length === 0 && !showAddressForm ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-600 font-semibold text-sm">No saved addresses</p>
              <p className="text-gray-400 text-xs mt-1">Add a delivery address to speed up checkout.</p>
              <button
                onClick={() => { setShowAddressForm(true); setAddressError(null) }}
                className="btn-secondary mt-4 inline-flex text-sm"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const LabelIcon = LABEL_ICONS[addr.label] ?? MoreHorizontal
                return (
                  <div key={addr.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[addr.label] ?? LABEL_STYLES.Other}`}>
                            <LabelIcon className="w-3 h-3" />
                            {addr.label}
                          </span>
                          {addr.is_default && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-charcoal">{addr.full_name}</p>
                        {addr.phone && <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>}
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                          {addr.address_line_1}
                          {addr.address_line_2 && `, ${addr.address_line_2}`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {addr.city}, {addr.state} — {addr.postal_code}
                        </p>
                        <p className="text-xs text-gray-400">{addr.country}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleEditAddress(addr)}
                          className="p-2 rounded-lg text-gray-400 hover:text-forest-green hover:bg-forest-green/8 transition-colors"
                          title="Edit address"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {!addr.is_default && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="mt-3 text-xs text-forest-green font-medium hover:underline flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" /> Set as default
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Inline address form */}
          {showAddressForm && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest-green/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-charcoal">
                  {editingAddress ? 'Edit Address' : 'New Address'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddressForm(false)
                    setEditingAddress(null)
                    setAddressForm(emptyAddressForm)
                    setAddressError(null)
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {addressError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4">
                  {addressError}
                </div>
              )}

              {/* Label chips */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-600 mb-2 block">Address Label</label>
                <div className="flex gap-2 flex-wrap">
                  {(['Home', 'Work', 'Other'] as const).map((lbl) => {
                    const LblIcon = LABEL_ICONS[lbl]
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setAddressForm((f) => ({ ...f, label: lbl }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          addressForm.label === lbl
                            ? lbl === 'Home'
                              ? 'bg-blue-100 text-blue-700 border-blue-300'
                              : lbl === 'Work'
                              ? 'bg-purple-100 text-purple-700 border-purple-300'
                              : 'bg-gray-200 text-gray-700 border-gray-400'
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <LblIcon className="w-3 h-3" />
                        {lbl}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Full Name *</label>
                  <input
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="input text-sm"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone</label>
                  <input
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input text-sm"
                    placeholder="Phone number"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Address Line 1 *</label>
                  <input
                    value={addressForm.address_line_1}
                    onChange={(e) => setAddressForm((f) => ({ ...f, address_line_1: e.target.value }))}
                    className="input text-sm"
                    placeholder="Street address"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Address Line 2 (optional)</label>
                  <input
                    value={addressForm.address_line_2}
                    onChange={(e) => setAddressForm((f) => ({ ...f, address_line_2: e.target.value }))}
                    className="input text-sm"
                    placeholder="Flat, building, landmark"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">City *</label>
                  <input
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                    className="input text-sm"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">State *</label>
                  <input
                    value={addressForm.state}
                    onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))}
                    className="input text-sm"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Postal Code *</label>
                  <input
                    value={addressForm.postal_code}
                    onChange={(e) => setAddressForm((f) => ({ ...f, postal_code: e.target.value }))}
                    className="input text-sm"
                    placeholder="PIN code"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Country *</label>
                  <input
                    value={addressForm.country}
                    onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
                    className="input text-sm"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Set as default checkbox */}
              <label className="flex items-center gap-2.5 mt-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm((f) => ({ ...f, is_default: e.target.checked }))}
                  className="w-4 h-4 rounded accent-forest-green"
                />
                <span className="text-sm text-gray-600 group-hover:text-charcoal transition-colors">
                  Set as default address
                </span>
              </label>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                  className="btn-secondary text-sm py-2 flex-1 justify-center"
                >
                  {savingAddress ? (
                    <><LoadingSpinner size="sm" /> Saving…</>
                  ) : (
                    <><Save className="w-3.5 h-3.5" /> {editingAddress ? 'Update Address' : 'Save Address'}</>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddressForm(false)
                    setEditingAddress(null)
                    setAddressForm(emptyAddressForm)
                    setAddressError(null)
                  }}
                  className="btn-ghost text-sm py-2 px-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
