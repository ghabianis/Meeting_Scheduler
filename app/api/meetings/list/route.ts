import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: meetings, error: dbError } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: dbError.message || 'Failed to fetch meetings' }, { status: 500 })
    }

    return NextResponse.json({ meetings: meetings || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
