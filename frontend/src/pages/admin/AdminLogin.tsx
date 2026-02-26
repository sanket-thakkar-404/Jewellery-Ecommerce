import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import {useAuthStore} from '../../features/auth/context/auth.store.js'

export default function AdminLogin() {
  const navigate = useNavigate();
  const {login ,loading,error } = useAuthStore()
  const [fieldErrors, setFieldErrors] = useState({
  email: "",
  password: "",
});
  const [formData , setFormData] = useState({
    email :"",
    password :""
  })

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const res = await login(formData);
  console.log(res)

  if (res.success) {
    toast.success("Welcome back, Admin");
    navigate("/admin/dashboard");
  } else {
    if (res.errors) {
      setFieldErrors({
        email: res.errors.email || "",
        password: res.errors.password || "",
      });
    } else {
      toast.error(res.message);
    }
  }

};

  if(loading){
    return (
      <div className='h-screen flex justify-center items-center text-2xl'> 
        loading.....
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl text-foreground">Admin Portal</h1>
          <p className="font-body text-xs text-muted-foreground mt-1">Babulal Jewellers</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@babulal.com"
              className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          {fieldErrors.email && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.email}
            </p>
          )}
          </div>
          <div>
            <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
             {fieldErrors.password && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.password}
            </p>
          )}
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-body text-xs tracking-[0.15em] uppercase px-8 py-4 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
          <p className="font-body text-[10px] text-muted-foreground text-center">
            Demo: admin@babulal.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
