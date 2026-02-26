import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare, LogOut,User } from 'lucide-react';
import { useEffect } from 'react';
import {useAuthStore} from "../../features/auth/context/auth.store.js"
import { toast } from 'sonner';
import { adminLinks } from '@/config/Navlinks.js';


export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate()
  const {admin , loading , logout,checkAuth} = useAuthStore()

  const handleLogout = async() => {
    const res = await logout();
    if (res.success) {
    toast.success("Admin , logout Successfully");
    navigate("/admin");
  } else {
      toast.error(res.message);
    }

  // const res = await getProfile();
  // console.log(res)
  }

  useEffect(() => {
  const verify = async () => {
    const res = await checkAuth();

    if (!res.success) {
      navigate("/admin");
    }
  };

  verify();
}, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 gradient-luxury text-primary-foreground flex flex-col">
        <div className="p-6 border-b border-primary-foreground/10">
          <Link to="/" className="font-display text-lg">Babulal Jewellers</Link>
          <p className="font-body text-[10px] tracking-widest uppercase opacity-60 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 py-4">
          {adminLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`flex items-center gap-3 px-6 py-3 font-body text-sm transition-colors ${
                location.pathname === l.path
                  ? 'bg-primary-foreground/10 text-primary-foreground'
                  : 'text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5'
              }`}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 font-body text-sm text-primary-foreground/60 hover:text-primary-foreground border-t border-primary-foreground/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-muted overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
