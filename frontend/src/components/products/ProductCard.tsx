import { Link } from 'react-router-dom';
import type { Product } from '@/lib/mockData';
import { formatPrice } from '@/lib/mockData';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {

  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.priceOnRequest) {
      toast.info('Please send an enquiry for pricing.');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4">
        {product.images.map((image)=>{
          return (
            <img
          src={image.url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
          )
        })}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-body tracking-[0.15em] uppercase px-3 py-1">
            Featured
          </span>
        )}
        <button
          onClick={handleAdd}
          className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-2.5 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-primary/90"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>
      <div>
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
          {product.category}
        </p>
        <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {product.priceOnRequest ? 'Price on Request' : formatPrice(product.price!)}
        </p>
      </div>
    </Link>
  );
}
