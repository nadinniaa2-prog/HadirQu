-- 1. Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'guru')) DEFAULT 'guru',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Students Table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nisn TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Teacher Attendance Table
CREATE TABLE teacher_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('hadir', 'izin', 'sakit')) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, date) -- Ensure one attendance per day per teacher
);

-- 4. Create Student Attendance Table
CREATE TABLE student_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('hadir', 'izin', 'sakit', 'alfa')) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profiles." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Students
CREATE POLICY "Students are viewable by authenticated users." ON students
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can insert/update/delete students." ON students
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for Teacher Attendance
CREATE POLICY "Teachers can view their own attendance." ON teacher_attendance
  FOR SELECT TO authenticated USING (auth.uid() = teacher_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Teachers can insert their own attendance." ON teacher_attendance
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id);

-- RLS Policies for Student Attendance
CREATE POLICY "Authenticated users can view student attendance." ON student_attendance
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers and admins can insert student attendance." ON student_attendance
  FOR INSERT TO authenticated WITH CHECK (true);

-- Function to handle new user signup (Optional: Automatically create profile)
-- Note: In the app code, we handle profile creation manually during signup, 
-- but this trigger is a more robust way to do it.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'guru');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
