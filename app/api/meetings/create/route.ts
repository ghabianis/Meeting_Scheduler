import { createClient } from '../../../lib/supabase/server'
import { GoogleCalendarService } from '../../../lib/google-calendar'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const REQUIRED_GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
]
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Google access token
    const { data: session } = await supabase.auth.getSession()
    const providerToken = session?.session?.provider_token
    
    if (!providerToken) {
      return NextResponse.json({ error: 'Google token not found' }, { status: 401 })
    }

    const tokenInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${providerToken}`,
      { cache: 'no-store' }
    )
    const tokenInfo = await tokenInfoResponse.json().catch(() => null)
    const grantedScopes = typeof tokenInfo?.scope === 'string' ? tokenInfo.scope.split(' ') : []
    const hasCalendarScope = REQUIRED_GOOGLE_SCOPES.some(scope => grantedScopes.includes(scope))

    if (!hasCalendarScope) {
      return NextResponse.json(
        {
          error: 'Google Calendar permission is missing. Sign out, remove this app from your Google account connected apps, then sign in again and approve Calendar access.',
          grantedScopes,
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, startTime, endTime, attendees, timezone } = body
    const attendeesList = Array.isArray(attendees) ? attendees : []

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Title, start time, and end time are required' }, { status: 400 })
    }

    if (attendeesList.length > 0 && !grantedScopes.includes(GMAIL_SEND_SCOPE)) {
      return NextResponse.json(
        {
          error: 'Gmail permission is missing. Click Reconnect Google, approve Gmail send access, then create the meeting again.',
          grantedScopes,
        },
        { status: 403 }
      )
    }

    // Create Google Meet event
    const calendarService = new GoogleCalendarService(providerToken)
    const meetEvent = await calendarService.createMeetEvent({
      summary: title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      attendees: attendeesList,
      timeZone: timezone,
    })

    const meetingPayload = {
      user_id: user.id,
      title: meetEvent.summary,
      description,
      start_time: meetEvent.startTime,
      end_time: meetEvent.endTime,
      meet_link: meetEvent.meetLink,
      google_event_id: meetEvent.id,
      attendees: attendeesList,
      timezone: timezone || 'UTC',
    }

    const { data: existingMeeting, error: existingMeetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('user_id', user.id)
      .eq('google_event_id', meetEvent.id)
      .maybeSingle()

    if (existingMeetingError) {
      console.error('Database lookup error:', existingMeetingError)
      return NextResponse.json({ error: existingMeetingError.message || 'Failed to check meeting' }, { status: 500 })
    }

    const meetingQuery = existingMeeting
      ? supabase
          .from('meetings')
          .update(meetingPayload)
          .eq('id', existingMeeting.id)
          .select()
          .single()
      : supabase
          .from('meetings')
          .insert(meetingPayload)
          .select()
          .single()

    const { data: meeting, error: dbError } = await meetingQuery

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: dbError.message || 'Failed to save meeting' }, { status: 500 })
    }

    let notificationsSent = 0
    let notificationError: string | null = null
    if (attendeesList.length > 0) {
      try {
        notificationsSent = await calendarService.sendMeetingNotificationEmail({
          to: attendeesList,
          summary: meetEvent.summary || title,
          description,
          startTime: new Date(meetEvent.startTime || startTime),
          endTime: new Date(meetEvent.endTime || endTime),
          meetLink: meetEvent.meetLink,
          timeZone: timezone || 'UTC',
          organizerName: user.user_metadata?.full_name || user.email || 'MeetScheduler',
        })
      } catch (emailError: any) {
        console.error('Email notification error:', emailError)
        notificationError = emailError?.cause?.message || emailError?.message || 'Failed to send email notification'
      }
    }

    return NextResponse.json({ 
      success: true, 
      meeting,
      meetLink: meetEvent.meetLink,
      notificationsSent,
      notificationError,
    })
  } catch (error: any) {
    console.error('API error:', error)
    const message = error?.message || error?.cause?.message || 'Internal server error'
    const status = error?.status || error?.code || 500

    if (status === 403 && message.toLowerCase().includes('insufficient authentication scopes')) {
      return NextResponse.json(
        {
          error: 'Google permission is missing. Click Reconnect Google and approve Calendar and Gmail access.',
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
