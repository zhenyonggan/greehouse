
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yyhvuygwwoosixsfozgp.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5aHZ1eWd3d29vc2l4c2ZvemdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTYxNzIsImV4cCI6MjA4NzU5MjE3Mn0._ccbLJjyvYDbWSREp9Zq_z1F_4Pn5khBgNbhELTfM3c'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRoles() {
  const email = 'admin@example.com'
  
  // 1. Login
  const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: 'password123'
  })

  if (loginError) {
    console.error('Login failed:', loginError.message)
    return
  }

  const userId = session.user.id
  console.log('Logged in user ID:', userId)

  // 2. Check user_roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*, roles(*)')
    .eq('user_id', userId)

  if (rolesError) {
    console.error('Error fetching roles:', rolesError.message)
  } else {
    console.log('User roles:', JSON.stringify(roles, null, 2))
  }
}

checkRoles()
