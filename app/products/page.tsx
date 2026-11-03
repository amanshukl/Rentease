'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/lib/utils';

const categories = [
  { label: 'All', value: '' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'Appliances', value: 'appliance' },
];

const subcategories: Record<string, string[]> = {
  furniture: ['bed', 'sofa', 'table', 'chair', 'wardrobe', 'bookshelf'],
  appliance: ['refrigerator', 'washing-machine', 'tv', 'ac', 'microwave', 'geyser'],
};

const conditions = [
  { label: 'All', value: '' },
  { label: 'Brand New', value: 'new' },
  { label: 'Like New', value: 'like-new' },
  { label: 'Good', value: 'good' },
];

const sortOptions = [
  { label: 'Relevance', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
];

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  monthlyRent: number;
  securityDeposit: number;
  images: string[];
  brand?: string;
  condition: 'new' | 'like-new' | 'good';
  availableStock: number;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subcategory, setSubcategory] = useState(searchParams.get('subcategory') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);
      if (condition) params.set('condition', condition);
      if (sort) params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, subcategory, condition, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL on filter change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (condition) params.set('condition', condition);
    if (sort) params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [search, category, subcategory, condition, sort, page, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSubcategory('');
    setCondition('');
    setSort('');
    setPage(1);
  };

  const hasActiveFilters = search || category || subcategory || condition || sort;

  const availableSubcategories = category ? subcategories[category] || [] : [
    ...subcategories.furniture,
    ...subcategories.appliance,
  ];

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                setSubcategory('');
                setPage(1);
              }}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                category === cat.value
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {availableSubcategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Type</h3>
          <div className="space-y-2">
            <button
              onClick={() => { setSubcategory(''); setPage(1); }}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                !subcategory ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              All Types
            </button>
            {availableSubcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => { setSubcategory(sub); setPage(1); }}
                className={cn(
                  'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize',
                  subcategory === sub
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {sub.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Condition */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Condition</h3>
        <div className="space-y-2">
          {conditions.map((c) => (
            <button
              key={c.value}
              onClick={() => { setCondition(c.value); setPage(1); }}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                condition === c.value
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full btn-ghost text-red-600 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="section-title">Our Products</h1>
          <p className="section-subtitle">Browse our collection of premium rental furniture & appliances</p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-field w-auto hidden sm:block"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="btn-secondary lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
              </p>
              {/* Mobile sort */}
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="input-field w-auto text-sm sm:hidden"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-ghost disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .map((p, idx, arr) => (
                        <span key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={cn(
                              'w-10 h-10 rounded-xl text-sm font-medium transition-colors',
                              page === p
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            )}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn-ghost disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl p-6 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
