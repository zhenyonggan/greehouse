
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  department?: string;
  position?: string;
  skills?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  roles: string[];
  permissions: string[];
  isLoading: boolean;
  login: (user: User, session: any, roles: string[], permissions: string[]) => void;
  logout: () => void;
}

export interface GrowthStage {
  name: string;
  duration_days: number;
  description?: string;
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  variety?: string;
  description?: string;
  growth_stages?: GrowthStage[];
  environmental_requirements?: Record<string, any>;
  planting_guide?: string;
  growth_period_days?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Greenhouse {
  id: string;
  code: string;
  name: string;
  location?: string;
  area: number;
  structure_type?: string;
  equipment?: Record<string, any>;
  capacity?: number;
  status: 'active' | 'inactive' | 'maintenance';
  manager_id?: string;
  built_date?: string;
  created_at: string;
  updated_at: string;
  manager?: User; // Joined field
}

export interface CropBatch {
  id: string;
  greenhouse_id: string;
  crop_id: string;
  batch_code: string;
  planting_area: number;
  planting_quantity?: number;
  planting_date: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  growth_stage?: string;
  status: 'growing' | 'harvested' | 'failed';
  assigned_worker_id?: string;
  notes?: Record<string, any>;
  created_at: string;
  updated_at: string;
  crop?: Crop; // Joined field
  greenhouse?: Greenhouse; // Joined field
  assigned_worker?: User; // Joined field
}

export interface FarmingTaskType {
  id: string;
  name: string;
  category: string;
  description?: string;
  required_materials?: Record<string, any>[];
  estimated_duration_minutes?: number;
  applicable_stages?: string[];
  is_active: boolean;
  created_at: string;
}

export interface FarmingTask {
  id: string;
  greenhouse_id: string;
  // crop_batch_id removed
  task_type_id: string;
  title: string;
  description?: string;
  planned_date: string;
  planned_start_time?: string;
  planned_end_time?: string;
  assigned_worker_id?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requirements?: Record<string, any>;
  materials_needed?: Record<string, any>[];
  created_at: string;
  updated_at: string;
  greenhouse?: Greenhouse; // Joined field
  // crop_batch removed
  task_type?: FarmingTaskType; // Joined field
  assigned_worker?: User; // Joined field
}

export interface FarmingRecord {
  id: string;
  task_id: string;
  worker_id: string;
  execution_date: string;
  start_time?: string;
  end_time?: string;
  actual_materials_used?: Record<string, any>[];
  notes?: string;
  photos?: string[];
  weather_conditions?: string;
  execution_result?: string;
  created_at: string;
  task?: FarmingTask; // Joined field
  worker?: User; // Joined field
}
