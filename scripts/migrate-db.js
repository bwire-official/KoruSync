const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigrations() {
  try {
    // Get all SQL files from migrations directory
    const migrationsDir = path.join(__dirname, '../supabase/migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log('Found migrations:', files)

    // Execute each migration
    for (const file of files) {
      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      
      // Split SQL into individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.error(`Error running statement in ${file}:`, error)
            console.error('Statement:', statement)
            process.exit(1)
          }
        }
      }
      
      console.log(`Successfully ran migration: ${file}`)
    }

    console.log('All migrations completed successfully!')
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  }
}

runMigrations() 