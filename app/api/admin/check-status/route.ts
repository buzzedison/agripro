import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('Checking admin status for:', email)

    // Try to check admin user directly - if table doesn't exist, we'll catch the error
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    console.log('Admin check result:', { data, error })

    if (error) {
      // Check if it's a "table doesn't exist" error
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          isAdmin: false,
          error: 'Admin users table does not exist',
          details: 'Please run the database schema first',
          needsSetup: true,
          email: email
        })
      }

      // If it's a "no rows found" error, user is not admin
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          isAdmin: false,
          message: 'User is not an admin',
          email: email
        })
      }

      return NextResponse.json({
        isAdmin: false,
        error: error.message,
        email: email
      })
    }

    return NextResponse.json({
      isAdmin: !!data,
      adminData: data,
      email: email
    })

  } catch (error) {
    console.error('Admin status check error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
