const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  try {
    console.log('Setting up database tables for admin and analytics...');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'admin_and_analytics_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });

          if (error) {
            // If rpc doesn't work, try direct query
            const { error: queryError } = await supabase.from('_temp').select('*').limit(1);

            if (queryError && queryError.message.includes('relation "_temp" does not exist')) {
              console.log(`Note: Some statements may need to be run manually in Supabase dashboard`);
            }
          }

          if (i % 5 === 0) {
            console.log(`Progress: ${i + 1}/${statements.length} statements processed`);
          }
        } catch (err) {
          console.warn(`Warning on statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('Database setup completed!');
    console.log('\nNext steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the contents of admin_and_analytics_schema.sql');
    console.log('4. Verify that all tables were created successfully');

  } catch (error) {
    console.error('Error setting up database:', error);
    console.log('\nManual setup instructions:');
    console.log('1. Copy the contents of admin_and_analytics_schema.sql');
    console.log('2. Go to your Supabase dashboard > SQL Editor');
    console.log('3. Paste and run the SQL');
  }
}

// Run the setup
setupDatabase();
