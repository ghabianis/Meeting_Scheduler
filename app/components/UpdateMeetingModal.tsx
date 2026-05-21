'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Users, Video, Loader, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface UpdateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onMeetingUpdated: () => void
  meeting: {
    id: string
    title: string
    description?: string
    start_time: string
    end_time: string
    attendees?: string[]
    timezone: string
  } | null
}

export default function UpdateMeetingModal({
  isOpen,
  onClose,
  onMeetingUpdated,
  meeting,
}: UpdateMeetingModalProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendees: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  // Update form when modal opens or meeting changes
  useEffect(() => {
    if (isOpen && meeting) {
      const startDate = new Date(meeting.start_time)
      const endDate = new Date(meeting.end_time)
      
      setFormData({
        title: meeting.title || '',
        description: meeting.description || '',
        startTime: startDate.toISOString().slice(0, 16),
        endTime: endDate.toISOString().slice(0, 16),
        attendees: meeting.attendees?.join(', ') || '',
        timezone: meeting.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      setErrors({})
    }
  }, [isOpen, meeting])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Meeting title is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (formData.startTime >= formData.endTime) newErrors.time = 'End time must be after start time'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !meeting) {
      toast.error('Please fix the errors below')
      return
    }

    setLoading(true)

    try {
      const attendeesList = formData.attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'))

      const response = await fetch('/api/meetings/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.id,
          title: formData.title,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          attendees: attendeesList,
          timezone: formData.timezone,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Meeting updated successfully!')
        onMeetingUpdated()
        onClose()
      } else {
        toast.error(data.error || 'Failed to update meeting')
      }
    } catch (error) {
      console.error('Error updating meeting:', error)
      toast.error('An error occurred while updating the meeting')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !meeting) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-white/20 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Video className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Edit Meeting</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Meeting Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value })
                if (errors.title) setErrors({ ...errors, title: '' })
              }}
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg focus:outline-none transition-colors ${
                errors.title ? 'border-red-500 focus:border-red-500' : 'border-white/20 focus:border-white'
              }`}
              placeholder="Team Sync, Design Review, etc."
            />
            {errors.title && (
              <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white transition-colors"
              rows={3}
              placeholder="Meeting agenda, notes, etc."
            />
          </div>

          {/* Time Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Start Time *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => {
                    setFormData({ ...formData, startTime: e.target.value })
                    if (errors.startTime) setErrors({ ...errors, startTime: '', time: '' })
                  }}
                  className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg focus:outline-none transition-colors ${
                    errors.startTime ? 'border-red-500 focus:border-red-500' : 'border-white/20 focus:border-white'
                  }`}
                />
              </div>
              {errors.startTime && (
                <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.startTime}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">End Time *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => {
                    setFormData({ ...formData, endTime: e.target.value })
                    if (errors.endTime) setErrors({ ...errors, endTime: '', time: '' })
                  }}
                  className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg focus:outline-none transition-colors ${
                    errors.endTime ? 'border-red-500 focus:border-red-500' : 'border-white/20 focus:border-white'
                  }`}
                />
              </div>
              {errors.endTime && (
                <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.endTime}
                </div>
              )}
            </div>

            {errors.time && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.time}
              </div>
            )}
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-semibold mb-2">Attendees (optional)</label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white transition-colors"
                placeholder="john@example.com, jane@example.com"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Separate multiple emails with commas</p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-semibold mb-2">Timezone</label>
            <div className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-gray-400 text-sm">
              {formData.timezone}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Updating Meeting...
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                Update Meeting
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
