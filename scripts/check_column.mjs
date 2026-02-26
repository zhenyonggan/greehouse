
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yyhvuygwwoosixsfozgp.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5aHZ1eWd3d29vc2l4c2ZvemdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTYxNzIsImV4cCI6MjA4NzU5MjE3Mn0._ccbLJjyvYDbWSREp9Zq_z1F_4Pn5khBgNbhELTfM3c'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumn() {
  console.log('Checking columns in farming_tasks...')
  // Try to insert with crop_batch_id to see if it fails
  const { error } = await supabase
      .from('farming_tasks')
      .select('crop_batch_id')
      .limit(1);

  if (error) {
    console.log('Error selecting crop_batch_id (Expected):', error.message)
  } else {
    console.log('crop_batch_id still exists!')
  }
}

checkColumn()
