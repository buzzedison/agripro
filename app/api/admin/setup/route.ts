import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up admin user...')

    // Try to create the admin user directly
    const { data, error } = await supabase
      .from('admin_users')
      .upsert({
        email: 'edison@agriprohub.com',
        first_name: 'Edison',
        last_name: 'Admin',
        role: 'super_admin',
        is_active: true
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('Error creating admin user:', error)

      // If table doesn't exist, let's try to create it first
      if (error.message?.includes('does not exist')) {
        console.log('Admin users table does not exist, attempting to create...')

        // Try to create the table using raw SQL
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS admin_users (
              id SERIAL PRIMARY KEY,
              email VARCHAR(255) NOT NULL UNIQUE,
              first_name VARCHAR(100),
              last_name VARCHAR(100),
              role VARCHAR(50) DEFAULT 'admin',
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
          `
        })

        if (createError) {
          console.error('Failed to create admin_users table:', createError)
          return NextResponse.json({
            error: 'Failed to create admin table',
            details: 'You may need to run the SQL schema manually in Supabase dashboard',
            sql: createError.message
          }, { status: 500 })
        }

        // Now try to insert the admin user again
        const { data: retryData, error: retryError } = await supabase
          .from('admin_users')
          .upsert({
            email: 'edison@agriprohub.com',
            first_name: 'Edison',
            last_name: 'Admin',
            role: 'super_admin',
            is_active: true
          }, {
            onConflict: 'email',
            ignoreDuplicates: false
          })
          .select()

        if (retryError) {
          return NextResponse.json({
            error: 'Failed to create admin user after table creation',
            details: retryError.message
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Admin user created successfully (table was created first)',
          adminData: retryData?.[0]
        })
      }

      return NextResponse.json({
        error: 'Failed to create admin user',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created/updated successfully',
      adminData: data?.[0]
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
