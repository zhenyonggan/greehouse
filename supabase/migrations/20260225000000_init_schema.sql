
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(50),
  position VARCHAR(50),
  skills JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- 大棚表
CREATE TABLE IF NOT EXISTS greenhouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  area DECIMAL(10,2),
  structure_type VARCHAR(50),
  equipment JSONB DEFAULT '{}',
  capacity INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  manager_id UUID REFERENCES users(id),
  built_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 作物表
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  variety VARCHAR(100),
  description TEXT,
  growth_stages JSONB DEFAULT '[]',
  environmental_requirements JSONB DEFAULT '{}',
  planting_guide TEXT,
  growth_period_days INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 作物批次表
CREATE TABLE IF NOT EXISTS crop_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  greenhouse_id UUID REFERENCES greenhouses(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  batch_code VARCHAR(50) UNIQUE NOT NULL,
  planting_area DECIMAL(10,2),
  planting_quantity INTEGER,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  growth_stage VARCHAR(50),
  status VARCHAR(20) DEFAULT 'growing',
  assigned_worker_id UUID REFERENCES users(id),
  notes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 农事任务类型表
CREATE TABLE IF NOT EXISTS farming_task_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  required_materials JSONB DEFAULT '[]',
  estimated_duration_minutes INTEGER,
  applicable_stages JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 农事任务表
CREATE TABLE IF NOT EXISTS farming_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  greenhouse_id UUID REFERENCES greenhouses(id) ON DELETE CASCADE,
  task_type_id UUID REFERENCES farming_task_types(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  planned_date DATE NOT NULL,
  planned_start_time TIME,
  planned_end_time TIME,
  assigned_worker_id UUID REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  requirements JSONB DEFAULT '{}',
  materials_needed JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 农事记录表
CREATE TABLE IF NOT EXISTS farming_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES farming_tasks(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id),
  execution_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  actual_materials_used JSONB DEFAULT '[]',
  notes TEXT,
  photos JSONB DEFAULT '[]',
  weather_conditions VARCHAR(100),
  execution_result VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_greenhouses_manager_id ON greenhouses(manager_id);
CREATE INDEX IF NOT EXISTS idx_crop_batches_greenhouse_id ON crop_batches(greenhouse_id);
CREATE INDEX IF NOT EXISTS idx_crop_batches_crop_id ON crop_batches(crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_batches_status ON crop_batches(status);
CREATE INDEX IF NOT EXISTS idx_farming_tasks_greenhouse_id ON farming_tasks(greenhouse_id);
CREATE INDEX IF NOT EXISTS idx_farming_tasks_crop_batch_id ON farming_tasks(crop_batch_id);
CREATE INDEX IF NOT EXISTS idx_farming_tasks_assigned_worker_id ON farming_tasks(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_farming_tasks_planned_date ON farming_tasks(planned_date);
CREATE INDEX IF NOT EXISTS idx_farming_tasks_status ON farming_tasks(status);
CREATE INDEX IF NOT EXISTS idx_farming_records_task_id ON farming_records(task_id);
CREATE INDEX IF NOT EXISTS idx_farming_records_worker_id ON farming_records(worker_id);
CREATE INDEX IF NOT EXISTS idx_farming_records_execution_date ON farming_records(execution_date);

-- 初始化数据
INSERT INTO roles (name, description, permissions) VALUES
('admin', '系统管理员', '["manage_users", "manage_roles", "manage_greenhouses", "manage_crops", "manage_farming", "view_reports"]'),
('manager', '大棚管理员', '["manage_greenhouses", "manage_crops", "manage_farming", "view_reports"]'),
('technician', '技术人员', '["view_assigned_greenhouses", "manage_farming", "view_reports"]'),
('worker', '普通工人', '["view_assigned_tasks", "execute_tasks", "view_own_records"]')
ON CONFLICT (name) DO NOTHING;

INSERT INTO farming_task_types (name, category, description, required_materials, estimated_duration_minutes, applicable_stages) VALUES
('播种', '种植', '将种子播撒到土壤中', '[{"name": "种子", "unit": "粒"}, {"name": "土壤", "unit": "kg"}]', 60, '["preparation"]'),
('灌溉', '养护', '给作物补充水分', '[{"name": "水", "unit": "L"}]', 30, '["growing", "flowering", "fruiting"]'),
('施肥', '养护', '给作物补充营养', '[{"name": "肥料", "unit": "kg"}]', 45, '["growing", "flowering", "fruiting"]'),
('除草', '养护', '清除杂草', '[{"name": "除草工具", "unit": "件"}]', 90, '["growing"]'),
('病虫害防治', '保护', '预防和治疗病虫害', '[{"name": "农药", "unit": "L"}, {"name": "喷雾器", "unit": "台"}]', 60, '["growing", "flowering"]'),
('采收', '收获', '收获成熟的作物', '[{"name": "采收工具", "unit": "件"}, {"name": "包装箱", "unit": "个"}]', 120, '["harvest"]')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenhouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farming_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE farming_records ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for initial setup to allow development, will refine later)
-- Granting basic access to anon and authenticated users for now to facilitate development
GRANT SELECT ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT SELECT ON greenhouses TO anon;
GRANT ALL ON greenhouses TO authenticated;
GRANT SELECT ON crops TO anon;
GRANT ALL ON crops TO authenticated;
GRANT SELECT ON farming_tasks TO anon;
GRANT ALL ON farming_tasks TO authenticated;
GRANT SELECT ON farming_records TO anon;
GRANT ALL ON farming_records TO authenticated;
GRANT SELECT ON roles TO anon;
GRANT ALL ON roles TO authenticated;
GRANT SELECT ON user_roles TO anon;
GRANT ALL ON user_roles TO authenticated;
GRANT SELECT ON crop_batches TO anon;
GRANT ALL ON crop_batches TO authenticated;
GRANT SELECT ON farming_task_types TO anon;
GRANT ALL ON farming_task_types TO authenticated;

-- Policies
-- Admin can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Users can view own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

-- Admins and managers can manage all greenhouses
CREATE POLICY "Admins and managers can manage all greenhouses" ON greenhouses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager')
    )
  );

-- Technicians can view assigned greenhouses
CREATE POLICY "Technicians can view assigned greenhouses" ON greenhouses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'technician'
      AND (greenhouses.manager_id = auth.uid() OR greenhouses.id IN (
        SELECT greenhouse_id FROM crop_batches WHERE assigned_worker_id = auth.uid()
      ))
    )
  );

-- Workers can view assigned tasks
CREATE POLICY "Workers can view assigned tasks" ON farming_tasks
  FOR SELECT USING (
    assigned_worker_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager', 'technician')
    )
  );
