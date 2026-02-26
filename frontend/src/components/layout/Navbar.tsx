import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { navLinks } from '@/config/Navlinks';


export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl lg:text-2xl font-semibold tracking-wide text-primary flex items-center ">
            <img src="https://www.babulaljewellers.com/images/favicon.png" alt=""  className='w-10'/>
            Babulal Jewellers
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <li key={l.path}>
              <Link
                to={l.path}
                className={`font-body text-sm tracking-widest uppercase transition-colors hover:text-primary ${
                  location.pathname === l.path
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/products" className="hidden md:block text-muted-foreground hover:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative text-muted-foreground hover:text-primary transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <ul className="flex flex-col py-4 px-6 gap-4">
            {navLinks.map((l) => (
              <li key={l.path}>
                <Link
                  to={l.path}
                  onClick={() => setMobileOpen(false)}
                  className={`font-body text-sm tracking-widest uppercase ${
                    location.pathname === l.path
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
