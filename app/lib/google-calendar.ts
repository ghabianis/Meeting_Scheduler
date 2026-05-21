import { google } from 'googleapis'

export class GoogleCalendarService {
  private calendar: any
  private gmail: any

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    auth.setCredentials({ access_token: accessToken })
    this.calendar = google.calendar({ version: 'v3', auth })
    this.gmail = google.gmail({ version: 'v1', auth })
  }

  async createMeetEvent(eventDetails: {
    summary: string
    description?: string
    startTime: Date
    endTime: Date
    attendees?: string[]
    timeZone?: string
  }) {
    try {
      const event = {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: {
          dateTime: eventDetails.startTime.toISOString(),
          timeZone: eventDetails.timeZone || 'UTC',
        },
        end: {
          dateTime: eventDetails.endTime.toISOString(),
          timeZone: eventDetails.timeZone || 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        attendees: eventDetails.attendees?.map(email => ({ email })) || [],
        guestsCanModify: false,
        guestsCanInviteOthers: true,
        guestsCanSeeOtherGuests: true,
      }

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      })

      return {
        id: response.data.id,
        meetLink: response.data.hangoutLink,
        htmlLink: response.data.htmlLink,
        summary: response.data.summary,
        startTime: response.data.start?.dateTime,
        endTime: response.data.end?.dateTime,
      }
    } catch (error) {
      console.error('Error creating Google Meet event:', error)
      throw error
    }
  }

  async sendMeetingNotificationEmail(details: {
    to: string[]
    summary: string
    description?: string
    startTime: Date
    endTime: Date
    meetLink?: string
    timeZone?: string
    organizerName?: string
  }) {
    const recipients = details.to.filter(Boolean)
    if (recipients.length === 0) return 0

    const formatter = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: details.timeZone || 'UTC',
    })
    const start = formatter.format(details.startTime)
    const end = formatter.format(details.endTime)
    const subject = `Meeting invitation: ${details.summary}`
    const safeSummary = escapeHtml(details.summary)
    const safeDescription = escapeHtml(details.description || '')
    const safeOrganizer = escapeHtml(details.organizerName || 'MeetScheduler')
    const safeMeetLink = escapeHtml(details.meetLink || '')

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 12px">${safeSummary}</h2>
        <p style="margin:0 0 12px">You have been invited to a meeting by ${safeOrganizer}.</p>
        <p style="margin:0 0 8px"><strong>Starts:</strong> ${escapeHtml(start)}</p>
        <p style="margin:0 0 16px"><strong>Ends:</strong> ${escapeHtml(end)}</p>
        ${safeDescription ? `<p style="margin:0 0 16px">${safeDescription}</p>` : ''}
        ${safeMeetLink ? `<p style="margin:0 0 16px"><a href="${safeMeetLink}" style="display:inline-block;background:#111827;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">Join Google Meet</a></p>` : ''}
        ${safeMeetLink ? `<p style="font-size:13px;color:#4b5563">Meeting link: <a href="${safeMeetLink}">${safeMeetLink}</a></p>` : ''}
      </div>
    `.trim()

    const text = [
      `Meeting invitation: ${details.summary}`,
      '',
      `Organizer: ${details.organizerName || 'MeetScheduler'}`,
      `Starts: ${start}`,
      `Ends: ${end}`,
      details.description ? `Description: ${details.description}` : '',
      details.meetLink ? `Meeting link: ${details.meetLink}` : '',
    ].filter(Boolean).join('\n')

    const rawMessage = [
      `To: ${recipients.join(', ')}`,
      `Subject: ${encodeMimeSubject(subject)}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="meeting_boundary"',
      '',
      '--meeting_boundary',
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      text,
      '',
      '--meeting_boundary',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      html,
      '',
      '--meeting_boundary--',
    ].join('\r\n')

    await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: base64UrlEncode(rawMessage),
      },
    })

    return recipients.length
  }

  async listUpcomingMeetings(maxResults: number = 10) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      })

      return response.data.items?.map((event: any) => ({
        id: event.id,
        summary: event.summary,
        meetLink: event.hangoutLink,
        startTime: event.start?.dateTime,
        endTime: event.end?.dateTime,
        attendees: event.attendees?.map((a: any) => a.email),
      })) || []
    } catch (error) {
      console.error('Error listing meetings:', error)
      throw error
    }
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function encodeMimeSubject(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`
}
