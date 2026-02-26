
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yyhvuygwwoosixsfozgp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5aHZ1eWd3d29vc2l4c2ZvemdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTYxNzIsImV4cCI6MjA4NzU5MjE3Mn0._ccbLJjyvYDbWSREp9Zq_z1F_4Pn5khBgNbhELTfM3c'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
  const email = 'admin@example.com'
  const password = 'password123'

  console.log(`Creating user ${email}...`)
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'System Admin'
      }
    }
  })

  if (error) {
    console.error('Error creating user:', error.message)
  } else {
    console.log('User created successfully.')
    if (data.user && !data.user.email_confirmed_at) {
        console.log('User created but not confirmed. The trigger should confirm it automatically.')
    } else {
        console.log('User created and confirmed.')
    }
  }
}

createAdmin()
