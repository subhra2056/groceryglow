'use client'

import {
  User,
  Bell,
  ClipboardList,
  Edit3,
  Save,
  X,
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
  Trash2,
} from 'lucide-react'
import type { Profile } from '@/types'
import { formatDate } from '@/lib/utils'

interface ProfileTabProps {
  profile: Profile | null
  editing: boolean
  setEditing: (v: boolean) => void
  editForm: { full_name: string; phone: string }
  setEditForm: React.Dispatch<React.SetStateAction<{ full_name: string; phone: string }>>
  savingProfile: boolean
  profileError: string | null
  setProfileError: (v: string | null) => void
  saveProfile: () => Promise<void>

  showChangePassword: boolean
  setShowChangePassword: React.Dispatch<React.SetStateAction<boolean>>
  pwForm: { current: string; next: string; confirm: string }
  setPwForm: React.Dispatch<React.SetStateAction<{ current: string; next: string; confirm: string }>>
  pwShow: { current: boolean; next: boolean; confirm: boolean }
  setPwShow: React.Dispatch<React.SetStateAction<{ current: boolean; next: boolean; confirm: boolean }>>
  pwLoading: boolean
  pwError: string | null
  setPwError: (v: string | null) => void
  pwSuccess: boolean
  handleChangePassword: () => Promise<void>

  showDeleteConfirm: boolean
  setShowDeleteConfirm: (v: boolean) => void
  deleteConfirmText: string
  setDeleteConfirmText: (v: string) => void
  deletingAccount: boolean
  deleteError: string
  setDeleteError: (v: string) => void
  handleDeleteAccount: () => Promise<void>
}

export default function ProfileTab({
  profile,
  editing,
  setEditing,
  editForm,
  setEditForm,
  savingProfile,
  profileError,
  setProfileError,
  saveProfile,
  showChangePassword,
  setShowChangePassword,
  pwForm,
  setPwForm,
  pwShow,
  setPwShow,
  pwLoading,
  pwError,
  setPwError,
  pwSuccess,
  handleChangePassword,
  showDeleteConfirm,
  setShowDeleteConfirm,
  deleteConfirmText,
  setDeleteConfirmText,
  deletingAccount,
  deleteError,
  setDeleteError,
  handleDeleteAccount,
}: ProfileTabProps) {
  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-1 flex items-center justify-between">
          <h2 className="font-serif text-lg text-charcoal" style={{ fontWeight: 400 }}>Personal Info</h2>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setProfileError(null) }}
              className="flex items-center gap-1.5 text-xs font-semibold text-forest-green hover:text-forest-green/80 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit profile
            </button>
          )}
        </div>

        {profileError && (
          <div className="mx-5 mt-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
            {profileError}
          </div>
        )}

        <div className="mt-3">
          {[
            { label: 'Full Name', key: 'full_name' as const, value: profile?.full_name ?? '', editable: true, icon: User },
            { label: 'Email Address', key: 'email' as const, value: profile?.email ?? '', editable: false, icon: Bell },
            { label: 'Phone Number', key: 'phone' as const, value: profile?.phone ?? '', editable: true, icon: ClipboardList },
          ].map(({ label, key, value, editable, icon: FieldIcon }, idx, arr) => (
            <div key={key} className={`px-5 py-3.5 ${idx < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-1.5">{label}</p>
              {editing && editable && key !== 'email' ? (
                <input
                  value={editForm[key as keyof typeof editForm] ?? ''}
                  onChange={(e) => {
                    const val = key === 'phone'
                      ? e.target.value.replace(/\D/g, '').slice(0, 15)
                      : e.target.value
                    setEditForm((f) => ({ ...f, [key]: val }))
                  }}
                  placeholder={key === 'phone' ? 'Digits only, 7–15 numbers' : undefined}
                  inputMode={key === 'phone' ? 'numeric' : undefined}
                  className="input text-sm"
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <FieldIcon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  <span className={`text-[15px] font-medium ${value ? 'text-charcoal' : 'text-gray-300'}`}>
                    {value || '—'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex gap-2 px-5 pb-5 pt-3">
            <button onClick={saveProfile} disabled={savingProfile} className="btn-secondary text-sm py-2 flex-1 justify-center">
              <Save className="w-3.5 h-3.5" /> {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
            <button onClick={() => setEditing(false)} className="btn-ghost text-sm py-2 px-4">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-50">
          <p className="text-[11px] text-gray-400 tracking-wide">
            Member since{' '}
            <span className="text-gray-500 font-medium">
              {profile?.created_at ? formatDate(profile.created_at) : '—'}
            </span>
          </p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => { setShowChangePassword((v) => !v); setPwError(null); }}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors"
        >
          <span className="flex items-center gap-3 font-serif text-base text-charcoal" style={{ fontWeight: 400 }}>
            <span className="w-8 h-8 rounded-xl bg-forest-green/10 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-4 h-4 text-forest-green" />
            </span>
            Change Password
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showChangePassword ? 'rotate-180' : ''}`} />
        </button>
        {showChangePassword && (
          <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
            {pwSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                Password updated successfully!
              </div>
            )}
            {pwError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {pwError}
              </div>
            )}
            {(['current', 'next', 'confirm'] as const).map((field) => (
              <div key={field}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {field === 'current' ? 'Current Password' : field === 'next' ? 'New Password' : 'Confirm New Password'}
                </p>
                <div className="relative">
                  <input
                    type={pwShow[field] ? 'text' : 'password'}
                    value={pwForm[field]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="input text-sm pr-10"
                    placeholder={field === 'current' ? 'Enter current password' : field === 'next' ? 'Min. 8 characters' : 'Re-enter new password'}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow((s) => ({ ...s, [field]: !s[field] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {pwShow[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleChangePassword}
              disabled={pwLoading || !pwForm.current || !pwForm.next || !pwForm.confirm}
              className="btn-secondary text-sm py-2 w-full justify-center mt-1"
            >
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-xs text-gray-500 mb-3">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete My Account
        </button>
      </div>

      {/* Delete account confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Delete Account?</h2>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-4">
              This will permanently erase your profile, orders, wishlist, reviews, and all other data.{' '}
              <strong className="text-gray-700">There is no way to recover your account.</strong>
            </p>
            <p className="text-xs text-gray-400 text-center mb-5">
              Type <span className="font-semibold text-red-500">DELETE</span> to confirm
            </p>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="input text-sm mb-4 text-center"
            />
            {deleteError && (
              <p className="text-xs text-red-500 text-center mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError('') }}
                className="flex-1 px-4 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingAccount ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete Forever</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
