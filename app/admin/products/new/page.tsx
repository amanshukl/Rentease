'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const subcategories: Record<string, string[]> = {
  furniture: ['Bed', 'Sofa', 'Table', 'Chair', 'Bookshelf', 'Wardrobe', 'Desk'],
  appliance: ['Refrigerator', 'Washing Machine', 'TV', 'AC', 'Microwave', 'Water Purifier', 'Geyser'],
};

function AddProductContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'furniture',
    subcategory: 'Bed',
    monthlyRent: '',
    securityDeposit: '',
    brand: '',
    condition: 'new',
    totalStock: '',
    dimensions: '',
    features: '',
    images: '/images/placeholder.svg',
  });

  useEffect(() => {
    if (editId && session?.user.role === 'admin') {
      fetchProduct();
    }
  }, [editId, session]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${editId}`);
      if (res.ok) {
        const data = await res.json();
        const p = data.product;
        setForm({
          name: p.name || '',
          description: p.description || '',
          category: p.category || 'furniture',
          subcategory: p.subcategory || 'Bed',
          monthlyRent: String(p.monthlyRent || ''),
          securityDeposit: String(p.securityDeposit || ''),
          brand: p.brand || '',
          condition: p.condition || 'new',
          totalStock: String(p.totalStock || ''),
          dimensions: p.dimensions || '',
          features: (p.features || []).join(', '),
          images: (p.images || []).join(', '),
        });
      }
    } catch {
      toast.error('Failed to load product');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory,
      monthlyRent: Number(form.monthlyRent),
      securityDeposit: Number(form.securityDeposit),
      brand: form.brand || undefined,
      condition: form.condition,
      totalStock: Number(form.totalStock),
      dimensions: form.dimensions || undefined,
      features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
      images: form.images.split(',').map((i) => i.trim()).filter(Boolean),
    };

    try {
      const url = editId ? `/api/admin/products/${editId}` : '/api/admin/products';
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editId ? 'Product updated!' : 'Product created!');
        router.push('/admin/products');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save product');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {editId ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="e.g., King Size Bed with Mattress"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                    subcategory: subcategories[e.target.value][0],
                  })
                }
                className="input-field"
              >
                <option value="furniture">Furniture</option>
                <option value="appliance">Appliance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                className="input-field"
              >
                {subcategories[form.category]?.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="input-field"
                placeholder="e.g., Samsung, IKEA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="input-field"
              >
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="Detailed product description..."
              required
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
              <input
                type="number"
                value={form.monthlyRent}
                onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
                className="input-field"
                placeholder="999"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                value={form.securityDeposit}
                onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
                className="input-field"
                placeholder="2000"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock</label>
              <input
                type="number"
                value={form.totalStock}
                onChange={(e) => setForm({ ...form, totalStock: e.target.value })}
                className="input-field"
                placeholder="10"
                min="0"
                required
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                className="input-field"
                placeholder="e.g., 72 x 36 x 18 inches"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma-separated)</label>
              <input
                type="text"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="input-field"
                placeholder="/images/placeholder.svg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
            <input
              type="text"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              className="input-field"
              placeholder="Solid wood, Ergonomic design, Easy assembly, 2-year warranty"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button type="submit" disabled={loading} className="btn-primary gap-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> {editId ? 'Update Product' : 'Create Product'}</>
              )}
            </button>
            <Link href="/admin/products" className="btn-ghost">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      }
    >
      <AddProductContent />
    </Suspense>
  );
}
