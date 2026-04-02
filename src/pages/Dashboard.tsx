import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { motion } from 'motion/react';
import { Users, UserCheck, FileBarChart, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DashboardProps {
  profile: Profile | null;
}

export default function Dashboard({ profile }: DashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    teacherPresent: 0,
    totalTeachers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Total Students
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      
      // Present Today (Students)
      const { count: presentCount } = await supabase
        .from('student_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'hadir');

      // Total Teachers
      const { count: teacherCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // Teacher Present Today
      const { count: teacherPresentCount } = await supabase
        .from('teacher_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'hadir');

      setStats({
        totalStudents: studentCount || 0,
        presentToday: presentCount || 0,
        teacherPresent: teacherPresentCount || 0,
        totalTeachers: teacherCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { 
      label: 'Total Siswa', 
      value: stats.totalStudents, 
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    { 
      label: 'Siswa Hadir Hari Ini', 
      value: stats.presentToday, 
      icon: <UserCheck className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-100'
    },
    { 
      label: 'Total Guru', 
      value: stats.totalTeachers, 
      icon: <Users className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-50',
      border: 'border-purple-100'
    },
    { 
      label: 'Guru Hadir Hari Ini', 
      value: stats.teacherPresent, 
      icon: <UserCheck className="w-6 h-6 text-orange-600" />,
      bg: 'bg-orange-50',
      border: 'border-orange-100'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Halo, {profile?.full_name}! 👋</h1>
            <p className="text-blue-100">Selamat datang di dashboard HadirQu. Mari kelola absensi hari ini.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <Calendar className="w-6 h-6 text-sky-300" />
            <div className="text-right">
              <p className="text-sm font-medium text-sky-200">{format(new Date(), 'EEEE', { locale: id })}</p>
              <p className="text-lg font-bold">{format(new Date(), 'dd MMMM yyyy', { locale: id })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-3xl border ${card.border} ${card.bg} flex items-center justify-between shadow-sm`}
          >
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{card.label}</p>
              <p className="text-3xl font-extrabold text-slate-900">{card.value}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm">
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions / Info */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h3>
            <button className="text-blue-600 text-sm font-bold hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                   <Clock className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-800">Absensi Guru Berhasil</p>
                   <p className="text-xs text-slate-500">Anda telah melakukan absensi mandiri hari ini.</p>
                </div>
                <span className="ml-auto text-xs font-medium text-slate-400">Baru saja</span>
             </div>
             {/* Placeholder for more activities */}
             <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                   <Users className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-800">Data Siswa Diperbarui</p>
                   <p className="text-xs text-slate-500">Admin menambahkan 5 siswa baru ke kelas X-A.</p>
                </div>
                <span className="ml-auto text-xs font-medium text-slate-400">2 jam yang lalu</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <FileBarChart className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">Laporan Mingguan</h3>
           <p className="text-slate-500 text-sm mb-6">Lihat perkembangan kehadiran siswa dan guru dalam satu minggu terakhir.</p>
           <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
              Buka Laporan
           </button>
        </div>
      </div>
    </div>
  );
}
