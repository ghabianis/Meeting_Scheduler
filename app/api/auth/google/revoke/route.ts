import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const providerToken = data.session?.provider_token

    if (providerToken) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${providerToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        cache: 'no-store',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to revoke Google token' },
      { status: 500 }
    )
  }
}
