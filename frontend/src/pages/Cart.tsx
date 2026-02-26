import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/mockData';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-6" />
        <h1 className="font-display text-3xl text-foreground mb-2">Your Cart is Empty</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Explore our collection and add something beautiful.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-xs tracking-[0.15em] uppercase px-8 py-4 hover:bg-primary/90 transition-colors"
        >
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </Link>

      <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-6 border-b border-border pb-6">
              <Link to={`/products/${product.id}`} className="bg-secondary w-24 h-24 flex-shrink-0 overflow-hidden">
                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1">
                <Link to={`/products/${product.id}`} className="font-display text-lg text-foreground hover:text-primary transition-colors">
                  {product.name}
                </Link>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  {product.priceOnRequest ? 'Price on Request' : formatPrice(product.price!)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-8 h-8 border border-border flex items-center justify-center hover:border-primary transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-body text-sm w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-8 h-8 border border-border flex items-center justify-center hover:border-primary transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-secondary p-8">
          <h2 className="font-display text-xl mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
            </div>
          </div>
          <div className="border-t border-border pt-4 mb-8">
            <div className="flex justify-between font-display text-lg">
              <span>Total</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
          </div>
          <Link
            to="/enquiry"
            className="block text-center bg-primary text-primary-foreground font-body text-xs tracking-[0.15em] uppercase px-8 py-4 hover:bg-primary/90 transition-colors w-full"
          >
            Proceed to Enquiry
          </Link>
          <button
            onClick={clearCart}
            className="block text-center font-body text-xs text-muted-foreground mt-4 hover:text-destructive transition-colors w-full"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
