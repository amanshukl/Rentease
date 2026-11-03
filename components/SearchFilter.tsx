'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { label: 'All', value: '' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'Appliances', value: 'appliance' },
];

const furnitureSubcategories = [
  'All',
  'Sofa',
  'Bed',
  'Table',
  'Chair',
  'Wardrobe',
  'Bookshelf',
  'Desk',
];

const applianceSubcategories = [
  'All',
  'Refrigerator',
  'Washing Machine',
  'Air Conditioner',
  'Microwave',
  'Television',
  'Water Purifier',
];

const priceRanges = [
  { label: 'All Prices', value: '' },
  { label: 'Budget (Under ₹500)', value: '0-500' },
  { label: 'Mid-range (₹500 - ₹2,000)', value: '500-2000' },
  { label: 'Premium (₹2,000+)', value: '2000-99999' },
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name: A to Z', value: 'name-asc' },
];

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSubcategory = searchParams.get('subcategory') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPrice = searchParams.get('price') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset page when filters change
      params.delete('page');
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const subcategories =
    currentCategory === 'furniture'
      ? furnitureSubcategories
      : currentCategory === 'appliance'
      ? applianceSubcategories
      : [];

  const clearFilters = () => {
    router.push('/products');
  };

  const hasActiveFilters =
    currentCategory || currentSubcategory || currentSearch || currentPrice;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateParams({ search: (e.target as HTMLInputElement).value });
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== currentSearch) {
                updateParams({ search: e.target.value });
              }
            }}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                updateParams({ category: cat.value, subcategory: '' })
              }
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200',
                currentCategory === cat.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      {subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategory
          </label>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => {
              const value = sub === 'All' ? '' : sub.toLowerCase();
              return (
                <button
                  key={sub}
                  onClick={() => updateParams({ subcategory: value })}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                    currentSubcategory === value
                      ? 'bg-primary-100 text-primary-700 border-primary-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-200'
                  )}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="space-y-1.5">
          {priceRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => updateParams({ price: range.value })}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200',
                currentPrice === range.value
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="input-field appearance-none pr-10 cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-all"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Filters</h2>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="btn-secondary w-full justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters & Sort
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 pb-8">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
