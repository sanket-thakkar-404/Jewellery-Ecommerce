import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Send } from 'lucide-react';
import { products, formatPrice } from '@/lib/mockData';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import ProductCard from '@/components/products/ProductCard';
import {useProductStore} from "../features/product/context/product.store.js"
import { useEffect } from 'react';

export default function ProductDetail() {
   const {products,getProduct} = useProductStore()
  useEffect(()=>{
    getProduct()
  },[])
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const addItem = useCartStore((s) => s.addItem);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Product Not Found</h1>
          <Link to="/products" className="font-body text-sm text-primary underline">
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (product.priceOnRequest) {
      toast.info('Please send an enquiry for pricing.');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image */}
          <div className="bg-secondary aspect-square overflow-hidden">
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
              {product.category}
            </p>
            <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
              {product.name}
            </h1>
            <p className="font-display text-2xl text-gold mb-6">
              {product.priceOnRequest ? 'Price on Request' : formatPrice(product.price!)}
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {!product.priceOnRequest && (
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body text-xs tracking-[0.15em] uppercase px-8 py-4 hover:bg-primary/90 transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </button>
              )}
              <Link
                to={`/enquiry?product=${product.id}`}
                className="flex items-center justify-center gap-2 border border-primary text-primary font-body text-xs tracking-[0.15em] uppercase px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Send className="h-4 w-4" /> Send Enquiry
              </Link>
            </div>

            {/* Details List */}
            <div className="mt-12 border-t border-border pt-8 space-y-4">
              {[
                ['Category', product.category],
                ['Availability', 'Made to Order'],
                ['Delivery', '2–4 Weeks'],
                ['Certification', 'BIS Hallmark'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">
                    {label}
                  </span>
                  <span className="font-body text-sm text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-secondary py-20 mt-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-2xl text-secondary-foreground mb-10">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
