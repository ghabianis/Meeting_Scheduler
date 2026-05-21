'use client'

import { createClient } from './lib/supabase/client'
import { Calendar, Video, ArrowRight, Zap, Clock, Users, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.send',
].join(' ')

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push('/dashboard')
      }
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: GOOGLE_CALENDAR_SCOPES,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
        },
      },
    })

    if (error) {
      console.error('Login error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full"></div>
          <div className="w-32 h-4 bg-white/20 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-white/10 bg-zinc-950/90 backdrop-blur">
        <div className="flex w-full items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400 text-zinc-950">
              <Video className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">MeetScheduler</span>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="hidden items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/10 sm:inline-flex"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <section className="grid min-h-[calc(100vh-73px)] w-full items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-12 xl:gap-16">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-sm font-medium text-emerald-100">
            <Zap className="h-4 w-4 text-emerald-300" />
            Google Meet scheduling workspace
          </div>

          <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl">
            Schedule Google Meet calls without the calendar busywork.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Create meetings, invite attendees, and keep every Google Calendar event in sync from one quiet dashboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleGoogleLogin}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-emerald-300 px-6 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-200"
            >
              <Video className="h-5 w-5" />
              Get Started with Google
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 px-6 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
            >
              Open Dashboard
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['12 sec', 'average setup'],
              ['1 click', 'Meet link creation'],
              ['Auto', 'calendar sync'],
            ].map(([value, label]) => (
              <div key={label} className="border-l border-white/15 pl-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="mt-1 text-sm text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-full min-h-[560px] rounded-[2rem] border border-white/10 bg-zinc-900/80 p-3 shadow-2xl shadow-black/40">
          <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-white">Today</p>
                <p className="text-xs text-zinc-500">3 meetings scheduled</p>
              </div>
              <button className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-zinc-950">
                New Meeting
              </button>
            </div>

            <div className="grid flex-1 content-start gap-5 p-5 xl:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Total', '24'],
                  ['Upcoming', '8'],
                  ['Attendees', '156'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs text-zinc-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold">{value}</p>
                  </div>
                ))}
              </div>

              {[
                ['Product sync', '10:00 AM', 'Ready to join', Video],
                ['Design review', '1:30 PM', '6 attendees', Users],
                ['Calendar cleanup', '4:00 PM', 'Synced', Calendar],
              ].map(([title, time, status, Icon]) => (
                <div key={title as string} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-300/15 text-emerald-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{title as string}</p>
                    <p className="text-sm text-zinc-500">{time as string}</p>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100 sm:flex">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {status as string}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-900/40">
        <div className="grid w-full gap-5 px-5 py-10 sm:px-8 md:grid-cols-3 lg:px-12">
          {[
            [Clock, 'Instant Scheduling', 'Create meetings with automatic Google Meet links in seconds.'],
            [Users, 'Attendee Invites', 'Send calendar invitations and keep participant details organized.'],
            [Calendar, 'Calendar Sync', 'Keep upcoming and completed meetings aligned with Google Calendar.'],
          ].map(([Icon, title, copy]) => (
            <div key={title as string} className="rounded-xl border border-white/10 bg-zinc-950/60 p-5">
              <Icon className="h-6 w-6 text-emerald-300" />
              <h2 className="mt-4 text-base font-semibold">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{copy as string}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
