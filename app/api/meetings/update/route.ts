import { createClient } from '../../../../app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      meetingId,
      title,
      description,
      startTime,
      endTime,
      attendees,
      timezone,
    } = await request.json()

    if (!meetingId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update({
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        attendees,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId)
      .eq('user_id', user.id)
      .select()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ meeting: updatedMeeting?.[0] })
  } catch (error) {
    console.error('Error updating meeting:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    )
  }
}
