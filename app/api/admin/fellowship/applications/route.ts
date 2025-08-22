import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all fellowship applications
export async function GET(request: NextRequest) {
  try {
    const { data: applications, error } = await supabase
      .from('fellowship_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    return NextResponse.json(applications)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update application status or shortlist
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, shortlisted, rating, admin_notes } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (shortlisted !== undefined) updateData.shortlisted = shortlisted
    if (rating !== undefined) updateData.rating = rating
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes

    const { data, error } = await supabase
      .from('fellowship_applications')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
    }

    // If status changed, log it in status history
    if (status !== undefined) {
      await supabase
        .from('fellowship_status_history')
        .insert({
          application_id: id,
          new_status: status,
          changed_by: 'admin', // In a real app, you'd get this from auth
          reason: 'Status updated via admin portal'
        })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an application
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('fellowship_applications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
