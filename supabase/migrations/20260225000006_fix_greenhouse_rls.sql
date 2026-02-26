
-- Drop existing policies for greenhouses to avoid conflicts
DROP POLICY IF EXISTS "Admins and managers can manage all greenhouses" ON greenhouses;
DROP POLICY IF EXISTS "Technicians can view assigned greenhouses" ON greenhouses;
DROP POLICY IF EXISTS "Enable read access for all users" ON greenhouses;
DROP POLICY IF EXISTS "Enable insert access for admins and managers" ON greenhouses;
DROP POLICY IF EXISTS "Enable update access for admins and managers" ON greenhouses;
DROP POLICY IF EXISTS "Enable delete access for admins and managers" ON greenhouses;

-- Re-create policies with explicit permissions
-- 1. Read access: Allow authenticated users to view greenhouses (simplifies logic for now, can be restricted later)
CREATE POLICY "Enable read access for authenticated users" ON greenhouses
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Insert access: Allow admins and managers to insert
CREATE POLICY "Enable insert access for admins and managers" ON greenhouses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager')
    )
  );

-- 3. Update access: Allow admins and managers to update
CREATE POLICY "Enable update access for admins and managers" ON greenhouses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager')
    )
  );

-- 4. Delete access: Allow admins and managers to delete
CREATE POLICY "Enable delete access for admins and managers" ON greenhouses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager')
    )
  );
