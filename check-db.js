// Check database and create assessment tables
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndCreateTables() {
  console.log('🔍 Checking assessment tables...');

  const tables = ['assessment_questions', 'assessment_invitations', 'assessment_responses', 'assessment_results'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log('❌', table, '- Does not exist');
      } else {
        console.log('✅', table, '- Exists');
      }
    } catch (err) {
      console.log('❌', table, '- Error:', err.message);
    }
  }

  console.log('\n📝 Creating assessment tables...');

  try {
    // Read the schema file
    const schema = fs.readFileSync('./fellowship_assessment_schema.sql', 'utf8');

    // Split into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

    console.log('Found', statements.length, 'SQL statements to execute');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

        try {
          await supabase.rpc('exec_sql', { sql: statement });
          console.log('✅ Success');
        } catch (err) {
          console.log('⚠️  Warning:', err.message);
          // Continue with next statement
        }
      }
    }

    console.log('\n🎉 Assessment tables creation completed!');
    console.log('Please refresh your browser and try the assessment again.');

  } catch (error) {
    console.log('❌ Error creating tables:', error.message);
  }
}

checkAndCreateTables();
