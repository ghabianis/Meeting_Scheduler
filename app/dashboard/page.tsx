'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, LogOut, Plus, Video, Users, Clock, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateMeetingModal from '../components/CreateMeetingModal'
import UpdateMeetingModal from '../components/UpdateMeetingModal'
import MeetingCard from '../components/MeetingCard'

const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.send',
].join(' ')

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [meetings, setMeetings] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterUpcoming, setFilterUpcoming] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const supabase = createClient()
  const MEETINGS_PER_PAGE = 3

  useEffect(() => {
    checkUser()
    fetchMeetings()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/')
    } else {
      setUser(session.user)
    }
  }

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meetings/list')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load meetings')
      }
      if (data.meetings) {
        const uniqueMeetings = Array.from(
          new Map(
            data.meetings.map((meeting: any) => [
              meeting.google_event_id || meeting.meet_link || meeting.id,
              meeting,
            ])
          ).values()
        )

        setMeetings(uniqueMeetings.sort((a: any, b: any) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ))
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false)
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/')
    toast.success('Signed out successfully')
  }

  const handleReconnectGoogle = async () => {
    try {
      setIsAccountMenuOpen(false)
      toast.loading('Reconnecting Google...', { id: 'google-reconnect' })
      await fetch('/api/auth/google/revoke', { method: 'POST' })
      await supabase.auth.signOut({ scope: 'global' })

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: GOOGLE_CALENDAR_SCOPES,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account',
            include_granted_scopes: 'true',
          },
        },
      })

      if (error) {
        toast.error(error.message, { id: 'google-reconnect' })
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reconnect Google', { id: 'google-reconnect' })
    }
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast.success('Meeting link copied to clipboard!')
  }

  const handleEdit = (meeting: any) => {
    setSelectedMeeting(meeting)
    setIsUpdateModalOpen(true)
  }

  const handleDelete = (meetingId: string) => {
    setMeetings(meetings.filter(m => m.id !== meetingId))
  }

  const handleMeetingUpdated = () => {
    fetchMeetings()
  }

  const upcomingMeetings = meetings.filter(m => new Date(m.start_time) > new Date())
  const pastMeetings = meetings.filter(m => new Date(m.start_time) <= new Date())
  const totalAttendees = meetings.reduce((sum, m) => sum + (m.attendees?.length || 0), 0)
  const displayedMeetings = filterUpcoming ? upcomingMeetings : meetings
  
  const totalPages = Math.ceil(displayedMeetings.length / MEETINGS_PER_PAGE)
  const startIndex = (currentPage - 1) * MEETINGS_PER_PAGE
  const paginatedMeetings = displayedMeetings.slice(startIndex, startIndex + MEETINGS_PER_PAGE)
  
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User'
  const initials = displayName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-white/10 sticky top-0 bg-black/95 backdrop-blur-sm z-10">
        <div className="w-full px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Video className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">MeetScheduler</h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(open => !open)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/15"
                title={displayName}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initials
                )}
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/40">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="truncate text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleReconnectGoogle}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 transition hover:bg-white/10"
                  >
                    <Calendar className="h-4 w-4" />
                    Reconnect Google
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-300 transition hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full px-5 py-10 sm:px-8 lg:px-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2">Your Meetings</h2>
            <p className="text-gray-400">Schedule and manage your Google Meet calls</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            New Meeting
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 border border-white/10 rounded-xl hover:border-white/30 transition-all hover:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Meetings</p>
                <p className="text-3xl font-bold">{meetings.length}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-300" />
              </div>
            </div>
          </div>

          <div className="p-6 border border-white/10 rounded-xl hover:border-white/30 transition-all hover:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Upcoming</p>
                <p className="text-3xl font-bold">{upcomingMeetings.length}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <Zap className="w-6 h-6 text-gray-300" />
              </div>
            </div>
          </div>

          <div className="p-6 border border-white/10 rounded-xl hover:border-white/30 transition-all hover:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold">{pastMeetings.length}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <Clock className="w-6 h-6 text-gray-300" />
              </div>
            </div>
          </div>

          <div className="p-6 border border-white/10 rounded-xl hover:border-white/30 transition-all hover:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Attendees</p>
                <p className="text-3xl font-bold">{totalAttendees}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <Users className="w-6 h-6 text-gray-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        {meetings.length > 0 && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setFilterUpcoming(true)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterUpcoming
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Upcoming ({upcomingMeetings.length})
            </button>
            <button
              onClick={() => {
                setFilterUpcoming(false)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !filterUpcoming
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All Meetings ({meetings.length})
            </button>
          </div>
        )}

        {/* Meetings List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your meetings...</p>
            </div>
          </div>
        ) : displayedMeetings.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-xl bg-white/5">
            <div className="p-4 bg-white/10 rounded-lg w-fit mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {filterUpcoming ? 'No upcoming meetings' : 'No meetings yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {filterUpcoming
                ? 'Create your first meeting to get started'
                : 'You haven\'t scheduled any meetings yet'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Meeting
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-5 mb-8">
              {paginatedMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onCopyLink={handleCopyLink}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-white text-black'
                          : 'border border-white/20 text-white hover:bg-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMeetingCreated={fetchMeetings}
      />

      {/* Update Meeting Modal */}
      <UpdateMeetingModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false)
          setSelectedMeeting(null)
        }}
        onMeetingUpdated={handleMeetingUpdated}
        meeting={selectedMeeting}
      />
    </div>
  )
}
