import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Export fellowship applications as CSV
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

    // Define CSV headers
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Location',
      'Nationality',
      'Education',
      'Graduation Year',
      'Current Status',
      'Technical Skills',
      'Language Skills',
      'Preferred Placement',
      'Available From',
      'Status',
      'Shortlisted',
      'Rating',
      'Applied Date',
      'Video URL',
      'Reference 1 Name',
      'Reference 1 Email',
      'Reference 2 Name',
      'Reference 2 Email',
      'Admin Notes'
    ]

    // Convert applications to CSV rows
    const csvRows = applications.map(app => [
      app.id,
      app.first_name,
      app.last_name,
      app.email,
      app.phone,
      app.current_location,
      app.nationality,
      app.education,
      app.graduation_year,
      app.current_status,
      app.technical_skills?.join('; ') || '',
      app.language_skills?.join('; ') || '',
      app.preferred_placement || '',
      app.availability_start,
      app.status,
      app.shortlisted ? 'Yes' : 'No',
      app.rating || '',
      new Date(app.created_at).toLocaleDateString(),
      app.video_url,
      app.reference1_name,
      app.reference1_email,
      app.reference2_name,
      app.reference2_email,
      app.admin_notes || ''
    ])

    // Escape CSV values
    const escapeCSVValue = (value: any): string => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    // Create CSV content
    const csvContent = [
      headers.map(escapeCSVValue).join(','),
      ...csvRows.map(row => row.map(escapeCSVValue).join(','))
    ].join('\n')

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="fellowship-applications-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export applications' }, { status: 500 })
  }
}
