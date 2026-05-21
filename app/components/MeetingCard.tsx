'use client'

import { Calendar, Clock, Users, Link as LinkIcon, Copy, Video, ExternalLink, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import toast from 'react-hot-toast'
import DeleteConfirmModal from './DeleteConfirmModal'

interface MeetingCardProps {
  meeting: {
    id: string
    title: string
    description?: string
    start_time: string
    end_time: string
    meet_link: string
    attendees?: string[]
    timezone?: string
  }
  onCopyLink: (link: string) => void
  onEdit: (meeting: any) => void
  onDelete: (meetingId: string) => void
}

export default function MeetingCard({ meeting, onCopyLink, onEdit, onDelete }: MeetingCardProps) {
  const startDate = new Date(meeting.start_time)
  const endDate = new Date(meeting.end_time)
  const [copied, setCopied] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meeting.meet_link)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
    onCopyLink(meeting.meet_link)
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch('/api/meetings/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id }),
      })

      if (response.ok) {
        toast.success('Meeting deleted successfully!')
        setDeleteConfirmOpen(false)
        onDelete(meeting.id)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete meeting')
      }
    } catch (error) {
      console.error('Error deleting meeting:', error)
      toast.error('An error occurred while deleting the meeting')
    }
  }

  const isUpcoming = startDate > new Date()

  return (
    <div className="border border-white/10 rounded-xl p-6 hover:border-white/30 hover:bg-white/5 transition-all duration-300 hover:shadow-lg group">
      {/* Header with Status */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold">{meeting.title}</h3>
            {isUpcoming && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Upcoming
              </span>
            )}
          </div>
          {meeting.description && (
            <p className="text-gray-400 text-sm line-clamp-2">{meeting.description}</p>
          )}
        </div>
        <a
          href={meeting.meet_link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Video className="w-4 h-4" />
          Join
        </a>
      </div>

      {/* Date and Time */}
      <div className="grid md:grid-cols-2 gap-3 mb-5 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3 text-gray-300">
          <div className="p-2 bg-white/10 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm font-medium">
              {format(startDate, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <div className="p-2 bg-white/10 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Time</p>
            <p className="text-sm font-medium">
              {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
            </p>
          </div>
        </div>
      </div>

      {/* Attendees */}
      {meeting.attendees && meeting.attendees.length > 0 && (
        <div className="mb-5 pb-5 border-b border-white/10">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/10 rounded-lg mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-2">Attendees ({meeting.attendees.length})</p>
              <div className="flex flex-wrap gap-2">
                {meeting.attendees.slice(0, 3).map((attendee, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/10 text-gray-200">
                    {attendee}
                  </span>
                ))}
                {meeting.attendees.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/5 text-gray-400">
                    +{meeting.attendees.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meet Link */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          <LinkIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-1">Google Meet Link</p>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
            <code className="text-xs font-mono text-gray-300 truncate flex-1">
              {meeting.meet_link.replace('https://', '')}
            </code>
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                copied 
                  ? 'bg-white/20 text-white' 
                  : 'hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-400">
          ID: {meeting.id.substring(0, 8)}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(meeting)}
            className="p-2 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            title="Edit meeting"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="p-2 rounded-lg border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
            title="Delete meeting"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <a
            href={meeting.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 ml-auto"
          >
            Open in new tab
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        title={meeting.title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  )
}