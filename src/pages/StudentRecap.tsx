import { useState, useEffect } from 'react';
import { supabase, Profile, Student, StudentAttendance as SAttendance } from '../lib/supabase';
import { motion } from 'motion/react';
import { FileBarChart, Search, Calendar, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface StudentRecapProps {
  profile: Profile | null;
}

export default function StudentRecap({ profile }: StudentRecapProps) {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchRecap();
  }, [selectedDate, selectedClass]);

  const fetchRecap = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('student_attendance')
        .select(`
          *,
          students (name, nisn, class),
          profiles (full_name)
        `)
        .eq('date', selectedDate);

      if (selectedClass !== 'Semua') {
        // This is a bit tricky with Supabase joined queries, but we can filter after fetching or use a more complex query
        // For simplicity, let's filter by class if selected
      }

      const { data, error } = await query;
      if (error) throw error;

      let filteredData = data || [];
      if (selectedClass !== 'Semua') {
        filteredData = filteredData.filter(item => item.students.class === selectedClass);
      }

      setAttendance(filteredData);

      // Fetch classes for filter
      const { data: studentData } = await supabase.from('students').select('class');
      const uniqueClasses = Array.from(new Set((studentData || []).map(s => s.class))).sort();
      setClasses(['Semua', ...uniqueClasses]);

    } catch (error) {
      console.error('Error fetching recap:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-64">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Pilih Tanggal</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="w-full md:w-64">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Filter Kelas</label>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button className="ml-auto px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export PDF
        </button>
      </div>

      {/* Recap Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Siswa</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Kelas</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Waktu Absen</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Guru Pengabsen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : attendance.length > 0 ? (
                attendance.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{item.students.name}</p>
                      <p className="text-xs text-slate-500">{item.students.nisn}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{item.students.class}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase",
                        item.status === 'hadir' ? "bg-green-100 text-green-700" :
                        item.status === 'izin' ? "bg-orange-100 text-orange-700" :
                        item.status === 'sakit' ? "bg-red-100 text-red-700" :
                        "bg-slate-200 text-slate-700"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(new Date(item.timestamp), 'HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {item.profiles.full_name}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada data absensi untuk tanggal ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
