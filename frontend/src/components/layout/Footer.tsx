import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl mb-4">Babulal Jewellers</h3>
            <p className="font-body text-sm leading-relaxed opacity-80">
              Crafting timeless elegance since generations. Each piece tells a story
              of heritage, artistry, and uncompromising quality.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase mb-4 opacity-60">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Collection', path: '/products' },
                { label: 'Enquiry', path: '/enquiry' },
                { label: 'Cart', path: '/cart' },
              ].map((l) => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className="font-body text-sm opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase mb-4 opacity-60">
              Visit Us
            </h4>
            <address className="font-body text-sm not-italic leading-relaxed opacity-80">
              Babulal Jewellers<br />
              123 Jewellers Lane, Zaveri Bazaar<br />
              Mumbai, Maharashtra 400002<br />
              <span className="block mt-2">+91 22 1234 5678</span>
              <span>info@babulaljewellers.com</span>
            </address>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="font-body text-xs opacity-50 tracking-wider">
            © {new Date().getFullYear()} Babulal Jewellers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
