'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, Save, ImagePlus, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const subcategories: Record<string, string[]> = {
  furniture: ['Bed', 'Sofa', 'Table', 'Chair', 'Bookshelf', 'Wardrobe', 'Desk'],
  appliance: ['Refrigerator', 'Washing Machine', 'TV', 'AC', 'Microwave', 'Water Purifier', 'Geyser'],
};

const FALLBACK_IMG = '/images/placeholder.svg';

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
    images: '',
  });

  // Image management state
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

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
        const p = data.product || data;
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
        if (p.images?.length) setImageUrls(p.images);
      }
    } catch {
      toast.error('Failed to load product');
    } finally {
      setFetching(false);
    }
  };

  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLocalPreview(dataUrl);
      const updated = [...imageUrls];
      updated[0] = dataUrl;
      setImageUrls(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addUrlField = () => setImageUrls([...imageUrls, '']);

  const removeUrlField = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated.length ? updated : ['']);
    if (previewIndex >= updated.length) setPreviewIndex(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalImages = imageUrls.filter(Boolean);

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
      images: finalImages.length ? finalImages : [FALLBACK_IMG],
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

  const activePreview = imageUrls[previewIndex] || FALLBACK_IMG;

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

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Image Panel ── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ImagePlus className="w-4 h-4" /> Product Images
              </h2>

              {/* Live preview */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={localPreview || activePreview}
                  alt="Product preview"
                  fill
                  className="object-cover"
                  sizes="300px"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                />
              </div>

              {/* Thumbnail strip */}
              {imageUrls.filter(Boolean).length > 1 && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {imageUrls.filter(Boolean).map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setPreviewIndex(i); setLocalPreview(null); }}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${previewIndex === i ? 'border-primary-500' : 'border-transparent'}`}
                    >
                      <Image
                        src={url}
                        alt={`Preview ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="56px"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Local file upload */}
              <label className="block mb-3">
                <span className="text-xs font-medium text-gray-600 block mb-1">Upload from device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLocalFile}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
              </label>

              {/* URL inputs */}
              <div>
                <span className="text-xs font-medium text-gray-600 block mb-1">Or paste image URLs</span>
                <div className="space-y-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="flex gap-1">
                      <input
                        type="url"
                        placeholder={`https://example.com/image${i + 1}.jpg`}
                        value={url}
                        onChange={(e) => handleUrlChange(i, e.target.value)}
                        className="input-field text-xs flex-1 !py-2"
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrlField(i)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {imageUrls.length < 4 && (
                  <button
                    type="button"
                    onClick={addUrlField}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <ImagePlus className="w-3.5 h-3.5" /> Add another image URL
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Recommended: Unsplash high-res URLs or upload from device.
              </p>
            </div>
          </div>

          {/* ── Main Form ── */}
          <div className="lg:col-span-2 card p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: subcategories[e.target.value][0] })}
                  className="input-field"
                >
                  <option value="furniture">Furniture</option>
                  <option value="appliance">Appliance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field min-h-[100px] resize-none"
                placeholder="Detailed product description..."
                required
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹) *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹) *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock *</label>
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

            {/* Extras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 72 × 36 × 18 inches"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features <span className="text-gray-400 font-normal">(comma-separated)</span>
              </label>
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
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    }>
      <AddProductContent />
    </Suspense>
  );
}
