import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';
import {useAuthStore} from "../../features/auth/context/auth.store.js"

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    role :""
  });

  const {admin,updateProfile} = useAuthStore()


  useEffect(() => {
  if (admin && !editing) {
    setProfile({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.number || '',
      address: admin.address || '',
      bio: admin.bio || '',
      role: admin.role,
    });
  }
}, [admin]);

  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
   
    const data = {
      address : profile.address,
      bio : profile.bio,
      number : profile.phone
    }
      const res = await updateProfile(data)
    console.log(res)

    console.log(profile)


     setEditing(false);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="p-8 max-w-4xl m-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">Profile</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Manage your admin account details
        </p>
      </div>

      <div className="bg-card border border-border p-8">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-2xl">
              BJ
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground">{profile.name}</h2>
            <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mt-1">
              {profile.role}
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6 ">
          {[
            { label: 'Full Name', key: 'name' as const, icon: User, type: 'text' },
            { label: 'Email Address', key: 'email' as const, icon: Mail, type: 'email' },
            { label: 'Phone Number', key: 'phone' as const, icon: Phone, type: 'tel' },
            { label: 'Address', key: 'address' as const, icon: MapPin, type: 'text' },
          ].map((field) => (
            <div key={field.key}>
              <label className="flex items-center gap-2 font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
                <field.icon className="h-3.5 w-3.5" />
                {field.label}
              </label>
              <input
                type={field.type}
                value={profile[field.key]}
                placeholder={`Enter ${field.label}`}
                 disabled={field.key === "email" ? true : !editing}
                onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-default"
              />
            </div>
          ))}

          <div>
            <label className="block font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
              Bio
            </label>
            <textarea
              rows={3}
              value={profile.bio}
              disabled={!editing}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-default resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-border">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-body text-xs tracking-[0.15em] uppercase px-6 py-3 hover:bg-primary/90 transition-colors"
              >
                <Save className="h-3.5 w-3.5" /> Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="font-body text-xs tracking-[0.15em] uppercase px-6 py-3 border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-primary text-primary-foreground font-body text-xs tracking-[0.15em] uppercase px-6 py-3 hover:bg-primary/90 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
