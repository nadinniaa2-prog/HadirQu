import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileBarChart, 
  Database, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AppLayoutProps {
  profile: Profile | null;
}

export default function AppLayout({ profile }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { 
      label: 'Dashboard', 
      path: '/app', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['admin', 'guru']
    },
    { 
      label: 'Absensi Guru', 
      path: '/app/absensi-guru', 
      icon: <UserCheck className="w-5 h-5" />,
      roles: ['admin', 'guru']
    },
    { 
      label: 'Absensi Siswa', 
      path: '/app/absensi-siswa', 
      icon: <Users className="w-5 h-5" />,
      roles: ['admin', 'guru']
    },
    { 
      label: 'Rekap Siswa', 
      path: '/app/rekap-siswa', 
      icon: <FileBarChart className="w-5 h-5" />,
      roles: ['admin', 'guru']
    },
    { 
      label: 'Rekap Guru', 
      path: '/app/rekap-guru', 
      icon: <FileBarChart className="w-5 h-5" />,
      roles: ['admin']
    },
    { 
      label: 'Data Siswa', 
      path: '/app/data-siswa', 
      icon: <Database className="w-5 h-5" />,
      roles: ['admin']
    },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(profile?.role || ''));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-gradient-to-b from-blue-900 to-blue-700 text-white transition-all duration-300 flex flex-col z-50",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-400 rounded-lg flex items-center justify-center text-blue-900 font-bold">H</div>
              <span className="text-xl font-bold tracking-tight">HadirQu</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group",
                  isActive 
                    ? "bg-sky-400 text-blue-900 font-bold shadow-lg shadow-sky-400/20" 
                    : "text-blue-100 hover:bg-white/10"
                )}
              >
                <div className={cn("transition-transform group-hover:scale-110", isActive ? "text-blue-900" : "text-sky-300")}>
                  {item.icon}
                </div>
                {isSidebarOpen && <span>{item.label}</span>}
                {isSidebarOpen && isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-400 rounded-full flex items-center justify-center text-blue-900 font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{profile?.full_name}</p>
                <p className="text-xs text-sky-300 capitalize">{profile?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-xl font-bold text-slate-800">
            {filteredMenu.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
