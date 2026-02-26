import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { products, categories } from '@/lib/mockData';
import ProductCard from '@/components/products/ProductCard';
import {useProductStore} from '../features/product/context/product.store.js'

const ITEMS_PER_PAGE = 8;

export default function Products() {
  
    const {products,getProduct} = useProductStore()
  useEffect(()=>{
    getProduct()
  },[])

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === 'All' || p.category === category;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [search, category]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
            Explore
          </p>
          <h1 className="font-display text-4xl lg:text-5xl text-secondary-foreground">
            Our Collection
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jewelry..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 font-body text-xs tracking-widest uppercase border border-border px-4 py-3"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        {/* Categories */}
        <div className={`flex flex-wrap gap-2 mb-10 ${showFilters ? '' : 'hidden md:flex'}`}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`font-body text-xs tracking-[0.1em] uppercase px-4 py-2 border transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <p className="font-body text-xs text-muted-foreground mb-6">
          {filtered.length} piece{filtered.length !== 1 ? 's' : ''} found
        </p>

        {paginated.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground">No pieces found</p>
            <p className="font-body text-sm text-muted-foreground mt-2">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {paginated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`font-body text-sm w-10 h-10 border transition-colors ${
                  page === p
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
