import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.send',
].join(' ')

export async function GET(request: Request) {
  const supabase = createClient()
  
  const redirectTo = `${new URL(request.url).origin}/api/auth/google/callback`
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      scopes: GOOGLE_CALENDAR_SCOPES,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent select_account',
        include_granted_scopes: 'true',
      },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ url: data.url })
}
