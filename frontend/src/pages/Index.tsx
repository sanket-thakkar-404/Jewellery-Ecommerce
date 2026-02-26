import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import heroImage from '@/assets/hero-jewelry.webp';
import {useProductStore} from "../features/product/context/product.store.js"
import { useEffect } from 'react';

export default function Index() {

  const {products , getProduct} = useProductStore()

  useEffect(()=>{
    getProduct()
  },[])

  if(!products) return (
    <div className='flex justify-center items-center text-4xl'>
      product loading....
    </div>
  )
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury jewelry by Babulal Jewellers"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 lg:px-8">
          <div className="max-w-xl">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary-foreground/70 mb-4 animate-fade-in">
              Since Generations
            </p>
            <h1 className="font-display text-5xl lg:text-7xl text-primary-foreground leading-[1.1] mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Timeless<br />Elegance,<br />Crafted with Soul
            </h1>
            <p className="font-body text-sm text-primary-foreground/80 leading-relaxed mb-8 max-w-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Discover handcrafted jewelry that celebrates heritage and artistry.
              Each piece from Babulal Jewellers is a testament to generations of
              master craftsmanship.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-accent text-accent-foreground font-body text-xs tracking-[0.15em] uppercase px-8 py-4 hover:bg-accent/90 transition-colors animate-fade-in"
              style={{ animationDelay: '0.6s' }}
            >
              Explore Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                Curated Selection
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-foreground">
                Featured Pieces
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((p, i) => (
              <div key={p._id} className="animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Strip */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Our Legacy
          </p>
          <h2 className="font-display text-3xl lg:text-4xl text-secondary-foreground mb-6">
            Where Tradition Meets Artistry
          </h2>
          <p className="font-serif text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
            For generations, Babulal Jewellers has been the trusted name in fine jewelry.
            Our master craftsmen blend age-old techniques with contemporary design,
            creating pieces that become cherished heirlooms. Every gemstone is hand-selected,
            every setting perfected — because true luxury lies in the details.
          </p>
          <Link
            to="/enquiry"
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase border border-secondary-foreground text-secondary-foreground px-8 py-4 hover:bg-secondary-foreground hover:text-secondary transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2 text-center">
            Browse By
          </p>
          <h2 className="font-display text-3xl lg:text-4xl text-foreground text-center mb-12">
            Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Necklaces', 'Rings', 'Earrings', 'Bangles'].map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${cat}`}
                className="group bg-secondary aspect-square flex items-center justify-center relative overflow-hidden hover:bg-primary transition-colors duration-500"
              >
                <span className="font-display text-xl lg:text-2xl text-secondary-foreground group-hover:text-primary-foreground transition-colors duration-500">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
