
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yyhvuygwwoosixsfozgp.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5aHZ1eWd3d29vc2l4c2ZvemdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTYxNzIsImV4cCI6MjA4NzU5MjE3Mn0._ccbLJjyvYDbWSREp9Zq_z1F_4Pn5khBgNbhELTfM3c'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testFetchTasks() {
  console.log('Testing fetch tasks...')
  const { data, error } = await supabase
      .from('farming_tasks')
      .select('*, greenhouse:greenhouses(name), task_type:farming_task_types(name), assigned_worker:users(full_name)')
      .range(0, 9);

  if (error) {
    console.error('Error fetching tasks:', error)
  } else {
    console.log('Tasks fetched successfully:', data)
  }
}

testFetchTasks()
