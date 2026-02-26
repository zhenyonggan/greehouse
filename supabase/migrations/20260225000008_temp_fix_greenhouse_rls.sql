
-- Drop existing policies for greenhouses to avoid conflicts
DROP POLICY IF EXISTS "Admins and managers can manage all greenhouses" ON greenhouses;
DROP POLICY IF EXISTS "Technicians can view assigned greenhouses" ON greenhouses;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON greenhouses;
DROP POLICY IF EXISTS "Enable insert access for admins and managers" ON greenhouses;
DROP POLICY IF EXISTS "Enable update access for admins and managers" ON greenhouses;
DROP POLICY IF EXISTS "Enable delete access for admins and managers" ON greenhouses;

-- Re-create policies with permissive access for authenticated users (Temporary fix)
-- 1. Read access: Allow authenticated users to view greenhouses
CREATE POLICY "Enable read access for authenticated users" ON greenhouses
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Insert access: Allow authenticated users to insert (Temporary fix)
CREATE POLICY "Enable insert access for authenticated users" ON greenhouses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Update access: Allow authenticated users to update (Temporary fix)
CREATE POLICY "Enable update access for authenticated users" ON greenhouses
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Delete access: Allow authenticated users to delete (Temporary fix)
CREATE POLICY "Enable delete access for authenticated users" ON greenhouses
  FOR DELETE USING (auth.role() = 'authenticated');
