import React, { useState, useEffect } from 'react';
import { supabase, Profile, Student, StudentAttendance as SAttendance } from '../lib/supabase';
import { motion } from 'motion/react';
import { Users, Search, CheckCircle2, XCircle, AlertCircle, Clock, Save } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface StudentAttendanceProps {
  profile: Profile | null;
}

export default function StudentAttendance({ profile }: StudentAttendanceProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'hadir' | 'izin' | 'sakit' | 'alfa'>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from('students').select('*').order('name');
      if (error) throw error;
      setStudents(data || []);
      
      // Extract unique classes
      const uniqueClasses = Array.from(new Set((data || []).map(s => s.class))).sort();
      setClasses(uniqueClasses);
      if (uniqueClasses.length > 0) setSelectedClass(uniqueClasses[0]);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: 'hadir' | 'izin' | 'sakit' | 'alfa') => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!profile || Object.keys(attendanceData).length === 0) return;
    setSubmitting(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const timestamp = new Date().toISOString();
      
      const inserts = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: studentId,
        teacher_id: profile.id,
        date: today,
        status,
        timestamp,
      }));

      const { error } = await supabase.from('student_attendance').insert(inserts);
      if (error) throw error;
      
      alert('Absensi siswa berhasil disimpan!');
      setAttendanceData({});
    } catch (error: any) {
      alert('Gagal menyimpan absensi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.class === selectedClass && 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-64">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Pilih Kelas</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Cari Siswa</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan nama siswa..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700">NISN</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Nama Siswa</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{student.nisn}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <StatusButton 
                          active={attendanceData[student.id] === 'hadir'} 
                          onClick={() => handleStatusChange(student.id, 'hadir')}
                          label="H"
                          color="bg-green-500"
                          title="Hadir"
                        />
                        <StatusButton 
                          active={attendanceData[student.id] === 'izin'} 
                          onClick={() => handleStatusChange(student.id, 'izin')}
                          label="I"
                          color="bg-orange-500"
                          title="Izin"
                        />
                        <StatusButton 
                          active={attendanceData[student.id] === 'sakit'} 
                          onClick={() => handleStatusChange(student.id, 'sakit')}
                          label="S"
                          color="bg-red-500"
                          title="Sakit"
                        />
                        <StatusButton 
                          active={attendanceData[student.id] === 'alfa'} 
                          onClick={() => handleStatusChange(student.id, 'alfa')}
                          label="A"
                          color="bg-slate-900"
                          title="Alfa"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada siswa ditemukan untuk kelas ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-6 h-6" />
           </div>
           <div>
              <p className="text-sm font-bold text-slate-800">{Object.keys(attendanceData).length} Siswa Terpilih</p>
              <p className="text-xs text-slate-500">Pastikan semua data sudah benar sebelum menyimpan.</p>
           </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(attendanceData).length === 0}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Simpan Absensi
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function StatusButton({ active, onClick, label, color, title }: { 
  active: boolean, 
  onClick: () => void, 
  label: string, 
  color: string,
  title: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-10 h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center",
        active 
          ? `${color} text-white shadow-lg scale-110` 
          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
      )}
    >
      {label}
    </button>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
