import React, { useState, useEffect } from 'react';
import { supabase, Profile, TeacherAttendance as TAttendance } from '../lib/supabase';
import { motion } from 'motion/react';
import { UserCheck, Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface TeacherAttendanceProps {
  profile: Profile | null;
}

export default function TeacherAttendance({ profile }: TeacherAttendanceProps) {
  const [attendance, setAttendance] = useState<TAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', profile?.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (status: 'hadir' | 'izin' | 'sakit') => {
    if (!profile) return;
    setSubmitting(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { error } = await supabase.from('teacher_attendance').insert({
        teacher_id: profile.id,
        date: today,
        status,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;
      fetchTodayAttendance();
    } catch (error: any) {
      alert('Gagal melakukan absensi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
          <Clock className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{format(currentTime, 'HH:mm:ss')}</h1>
        <p className="text-slate-500 font-medium">{format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}</p>
      </div>

      {attendance ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Absensi Berhasil!</h2>
          <p className="text-green-700">Anda telah melakukan absensi hari ini dengan status <span className="font-bold uppercase">{attendance.status}</span>.</p>
          <p className="text-green-600 text-sm mt-2">Waktu: {format(new Date(attendance.timestamp), 'HH:mm:ss')}</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <AttendanceButton 
            status="hadir" 
            label="Hadir" 
            color="bg-blue-600 hover:bg-blue-700" 
            icon={<UserCheck className="w-6 h-6" />}
            onClick={() => handleAttendance('hadir')}
            disabled={submitting}
          />
          <AttendanceButton 
            status="izin" 
            label="Izin" 
            color="bg-orange-500 hover:bg-orange-600" 
            icon={<Calendar className="w-6 h-6" />}
            onClick={() => handleAttendance('izin')}
            disabled={submitting}
          />
          <AttendanceButton 
            status="sakit" 
            label="Sakit" 
            color="bg-red-500 hover:bg-red-600" 
            icon={<AlertCircle className="w-6 h-6" />}
            onClick={() => handleAttendance('sakit')}
            disabled={submitting}
          />
        </div>
      )}

      <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Informasi Penting
        </h3>
        <ul className="text-sm text-slate-600 space-y-2 list-disc ml-5">
          <li>Absensi hanya dapat dilakukan satu kali setiap harinya.</li>
          <li>Pastikan status yang Anda pilih sudah sesuai dengan kondisi Anda.</li>
          <li>Jika terjadi kesalahan, silakan hubungi admin sekolah.</li>
        </ul>
      </div>
    </div>
  );
}

function AttendanceButton({ status, label, color, icon, onClick, disabled }: { 
  status: string, 
  label: string, 
  color: string, 
  icon: React.ReactNode, 
  onClick: () => void,
  disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${color} text-white p-8 rounded-3xl flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-200`}
    >
      <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
        {icon}
      </div>
      <span className="text-xl font-bold">{label}</span>
    </button>
  );
}
