import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY) || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'guru';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  class: string;
}

export interface TeacherAttendance {
  id: string;
  teacher_id: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa';
  timestamp: string;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa';
  timestamp: string;
}
