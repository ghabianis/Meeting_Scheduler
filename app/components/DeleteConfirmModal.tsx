'use client'

import { useState } from 'react'
import { X, AlertTriangle, Loader } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-white/20 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold">Delete Meeting</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-2">Are you sure you want to delete this meeting?</p>
          <p className="text-white font-semibold mb-6 bg-white/5 border border-white/10 rounded-lg p-4">
            {title}
          </p>
          <p className="text-sm text-gray-400">
            This action cannot be undone. The meeting will be permanently deleted from your calendar.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border border-white/20 hover:bg-white/10 font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Meeting'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
