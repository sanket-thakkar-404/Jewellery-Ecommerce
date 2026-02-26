import { LayoutDashboard, Package, MessageSquare, User,ShieldPlus } from "lucide-react";

export const adminLinks = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Enquiries", path: "/admin/enquiries", icon: MessageSquare },
  { label: "Manage Admin", path: "/admin/manage", icon: ShieldPlus },
  { label: "Profile", path: "/admin/profile", icon: User },
];

export const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Collection', path: '/products' },
  { label: 'About', path: '/about' },
  { label: 'Enquiry', path: '/enquiry' },
];
