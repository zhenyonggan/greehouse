
-- Drop existing policies for users to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for admins" ON users;
DROP POLICY IF EXISTS "Enable update access for admins" ON users;
DROP POLICY IF EXISTS "Enable delete access for admins" ON users;

-- Re-create policies with permissive access for authenticated users (Temporary fix)
-- 1. Read access: Allow authenticated users to view users
CREATE POLICY "Enable read access for authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Insert access: Allow authenticated users to insert (Temporary fix)
CREATE POLICY "Enable insert access for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Update access: Allow authenticated users to update (Temporary fix)
CREATE POLICY "Enable update access for authenticated users" ON users
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Delete access: Allow authenticated users to delete (Temporary fix)
CREATE POLICY "Enable delete access for authenticated users" ON users
  FOR DELETE USING (auth.role() = 'authenticated');
  
-- Also fix user_roles policies
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
CREATE POLICY "Enable read access for authenticated users" ON user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON user_roles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Enable update access for authenticated users" ON user_roles
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable delete access for authenticated users" ON user_roles
  FOR DELETE USING (auth.role() = 'authenticated');
