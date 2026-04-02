import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Users, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-xl">H</div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">HadirQu</span>
        </div>
        <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
            Revolusi Absensi <br />
            <span className="text-blue-600">Digital Sekolah</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            HadirQu adalah platform absensi pintar yang memudahkan guru dan admin mengelola kehadiran siswa secara real-time, akurat, dan transparan.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200">
              Mulai Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Mengapa Memilih HadirQu?</h2>
            <p className="text-slate-600">Solusi modern untuk manajemen sekolah yang lebih efisien.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<CheckCircle className="w-8 h-8 text-blue-600" />}
              title="Absensi Mandiri"
              description="Guru dapat melakukan absensi mandiri dengan mudah melalui dashboard pribadi."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-blue-600" />}
              title="Manajemen Siswa"
              description="Kelola data siswa dan kehadiran kelas dalam satu platform terintegrasi."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-blue-600" />}
              title="Rekap Otomatis"
              description="Laporan kehadiran harian, mingguan, dan bulanan tersedia secara instan."
            />
          </div>
        </div>
      </section>

      {/* What is Digital Attendance? */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Apa itu Absensi Digital?</h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Absensi digital adalah sistem pencatatan kehadiran yang menggunakan teknologi informasi untuk menggantikan metode manual berbasis kertas. Dengan absensi digital, data kehadiran disimpan secara aman di cloud dan dapat diakses kapan saja.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-slate-700"><strong>Akurasi Tinggi:</strong> Mengurangi kesalahan pencatatan manual.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-slate-700"><strong>Efisiensi Waktu:</strong> Proses absensi hanya butuh beberapa detik.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-slate-700"><strong>Transparansi:</strong> Memudahkan pemantauan oleh pihak sekolah.</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl aspect-square flex items-center justify-center p-12">
             <div className="bg-white/10 backdrop-blur-md w-full h-full rounded-2xl border border-white/20 flex flex-col items-center justify-center text-white">
                <BarChart3 className="w-24 h-24 mb-4" />
                <span className="text-2xl font-bold">Data Real-time</span>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-100 text-center text-slate-500">
        <p>&copy; 2026 HadirQu. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-all">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
