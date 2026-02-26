import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import {useAuthStore} from "../../features/auth/context/auth.store.js"

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}



export default function AdminManage() {

const {getAllUsers ,allAdmin,loading, signup , admin} = useAuthStore()


  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
     name: '', email: '', password: '', role: 'admin'
  });


useEffect(()=>{
  getAllUsers()
} , [])




  const handleCreate = async(e: React.FormEvent) => {
    e.preventDefault();
    const res = await signup(form)
    console.log(res)
    // console.log(form)
    // toast.success(`${newAdmin.name} added as ${newAdmin.role}`);
  };

  const handleDelete = (admin: Admin) => {
    if (admin.role === 'superadmin') {
      toast.error('Super Admin cannot be removed');
      return;
    }
    // setAdmins(allAdmin.filter((a) => a._id !== admin._id));
    toast.success(`${admin.name} removed`);
  };

  const roleColor: Record<Admin['role'], string> = {
    admin: 'bg-primary/15 text-primary',
    superadmin: 'bg-accent/60 text-accent-foreground',
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-foreground">Manage Admins</h1>
          <p className="font-body text-xs text-muted-foreground mt-1">Create and manage admin accounts</p>
        </div>
      {admin?.role === "superadmin" && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-body text-xs tracking-[0.12em] uppercase px-5 py-3 hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Admin'}
        </button>
      )}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-border p-6 mb-8 space-y-4">
          <h2 className="font-display text-lg text-foreground mb-2">New Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-1.5">
                Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter name"
                className="w-full px-4 py-2.5 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@babulal.com"
                className="w-full px-4 py-2.5 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-1.5">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="disabled w-full px-4 py-2.5 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Admin">admin</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground font-body text-xs tracking-[0.12em] uppercase px-6 py-3 hover:bg-primary/90 transition-colors mt-2"
          >
            Create Admin
          </button>
        </form>
      )}

      {/* Admin List */}
      <div className="space-y-3">
        {loading ? (
           <p>Loading users...</p>
        ) : !allAdmin || allAdmin.length === 0 ? (

    <p>No user found</p>
  ) : (
    [...allAdmin].sort((a, b) => {
    if (a.role === "superadmin") return -1;
    if (b.role === "superadmin") return 1;
    return 0;
  }).map((user) => {
     return (
       <div
            key={user._id}
            className="flex items-center justify-between bg-card border border-border p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-body text-sm font-medium text-foreground">{user.name}</p>
                <p className="font-body text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-body text-[10px] tracking-[0.1em] uppercase px-3 py-1 rounded-full ${roleColor[user.role]}`}>
                {user.role}
              </span>
              <span className="font-body text-[10px] text-muted-foreground hidden sm:block">{user.createdAt}</span>
            {admin?.role === 'superadmin' &&
              user.role !== 'superadmin' && (
                <button
                  onClick={() => handleDelete(admin)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
     )
})
  )}
    
        </div>
      </div>
    );
}
