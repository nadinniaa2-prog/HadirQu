import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase, Profile } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import TeacherAttendance from './pages/TeacherAttendance';
import StudentAttendance from './pages/StudentAttendance';
import StudentRecap from './pages/StudentRecap';
import TeacherRecap from './pages/TeacherRecap';
import StudentData from './pages/StudentData';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/app" />} />
        
        <Route path="/app" element={session ? <AppLayout profile={profile} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard profile={profile} />} />
          <Route path="absensi-guru" element={<TeacherAttendance profile={profile} />} />
          <Route path="absensi-siswa" element={<StudentAttendance profile={profile} />} />
          <Route path="rekap-siswa" element={<StudentRecap profile={profile} />} />
          {profile?.role === 'admin' && (
            <>
              <Route path="rekap-guru" element={<TeacherRecap profile={profile} />} />
              <Route path="data-siswa" element={<StudentData profile={profile} />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
}
