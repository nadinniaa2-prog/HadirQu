import { useState, useEffect } from 'react';
import { supabase, Profile, TeacherAttendance as TAttendance } from '../lib/supabase';
import { motion } from 'motion/react';
import { FileBarChart, Calendar, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface TeacherRecapProps {
  profile: Profile | null;
}

export default function TeacherRecap({ profile }: TeacherRecapProps) {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecap();
  }, [selectedDate]);

  const fetchRecap = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select(`
          *,
          profiles (full_name, email)
        `)
        .eq('date', selectedDate);

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching recap:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(item => 
    item.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Cari Guru</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan nama guru..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
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
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Nama Guru</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Email</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Waktu Absen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredAttendance.length > 0 ? (
                filteredAttendance.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.profiles.full_name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{item.profiles.email}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase",
                        item.status === 'hadir' ? "bg-green-100 text-green-700" :
                        item.status === 'izin' ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(new Date(item.timestamp), 'HH:mm:ss')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada data absensi guru untuk tanggal ini.
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
