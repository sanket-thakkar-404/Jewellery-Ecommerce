import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { products as initialProducts, categories, formatPrice, type Product } from '@/lib/mockData';
import { toast } from 'sonner';
import {useProductStore}  from "../../features/product/context/product.store.js"

export default function AdminProducts() {

  const {getProduct , createProduct ,products ,loading , updateProduct,deleteProduct} = useProductStore()
  const [existingImages, setExistingImages] = useState([]);
  const [isDelete , setIsDeleted] = useState(null)
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Necklaces',
    price: '',
    priceOnRequest: false,
    description: '',
    featured: false,
    images: []
  });


  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ name: '', category: 'Necklaces', price: '', priceOnRequest: false, description: '', featured: false ,images: []});
    setEditingId(null);
    setShowAdd(false);
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price?.toString() || '',
      priceOnRequest: product.priceOnRequest,
      description: product.description,
      featured: product.featured,
      images: []
    });
    setEditingId(product.id);
    setExistingImages(product.images);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleted(id)
    const res = await deleteProduct(id)
    if(res.success){
      toast.success('Product deleted');
    } else {
      toast.error(res.message)
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  const formData = new FormData();

  formData.append("name", form.name);
  formData.append("category", form.category);
  
  if (!form.priceOnRequest) {
  formData.append("price", form.price);
}
  formData.append("priceOnRequest", String(form.priceOnRequest));
  formData.append("featured", String(form.featured));
  formData.append("description", form.description);

  form.images.forEach((image) => {
    formData.append("images", image);
  });
  let res;
if (editingId) {
  res = await updateProduct(editingId, formData);

  if (res.success) {
    toast.success("Product updated successfully");
  } else {
    toast.error(res.message);
    return;
  }

} else {
  res = await createProduct(formData);

  if (res.success) {
    toast.success("Product added successfully");
  } else {
    toast.error(res.message);
    return;
  }
}



    setShowAdd(false);
  
  }
  useEffect(()=>{
    getProduct()
  },[getProduct])


  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground">Products</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Manage your jewelry collection
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-body text-xs tracking-[0.15em] uppercase px-6 py-3 hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
          <div className="bg-card border  border-border p-6 mb-5">
            <h2 className="font-display text-xl mb-6">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="block">
              {editingId && existingImages.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {existingImages.map((img, index) => (
                      <img
                        key={index}
                        src={img.url || img}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              <div className='flex gap-5 items-center w-full'>
                <div className='w-full'>
                <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-3">
                  Product Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className='w-full'>
                <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-2 mt-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full block p-5 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option className='bg-red-500' key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              </div>
            <div className='flex items-center w-full gap-5'>
                <div className="md:col-span-2 w-full">
                <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-2 mt-2">
                  Product Images
                </label>
                <input
                  type="file"
                  required
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, images: Array.from(e.target.files) })
                  }
                  className="w-full px-4 py-3 bg-background border border-border font-body text-sm"
                />
              </div>
              <div className='w-full'>
                <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-2 mt-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  disabled={form.priceOnRequest}
                  className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>
            </div>
              <div className="flex items-end gap-6 mt-2">
                <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.priceOnRequest}
                    onChange={(e) => setForm({ ...form, priceOnRequest: e.target.checked })}
                    className="accent-primary"
                  />
                  Price on Request
                </label>
                <label className="mt-2 flex items-center gap-2 font-body text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="accent-primary"
                  />
                  Featured
                </label>
              </div>
              <div className="md:col-span-2 mt-2">
                <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-primary text-primary-foreground font-body text-xs tracking-[0.15em] uppercase px-8 py-3 transition-colors
                    ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"}
                  `}
                >
                  {loading
                    ? editingId
                      ? "Updating..."
                      : "Adding..."
                    : editingId
                      ? "Update"
                      : "Add"} Product
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-border font-body text-xs tracking-[0.15em] uppercase px-8 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Product', 'Category', 'Price', 'Featured', 'Views', 'Actions'].map((h) => (
                <th key={h} className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
         <tbody>
  {!filtered  ||filtered.length === 0 ? (
    <tr>
      <td
        colSpan={6}
        className="text-center py-10 font-body text-sm text-muted-foreground"
      >
        No products found. Please add some products.
      </td>
    </tr>
  ) : (
    filtered.map((p) => (
      <tr
        key={p._id || p.id}
        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
      >
        <td className="font-body text-sm p-4">{p.name}</td>
        <td className="font-body text-sm text-muted-foreground p-4">
          {p.category}
        </td>
        <td className="font-body text-sm p-4">
          {p.priceOnRequest ? (
            <span className="text-muted-foreground italic">
              On Request
            </span>
          ) : (
            formatPrice(p.price!)
          )}
        </td>
        <td className="p-4">
          {p.featured && (
            <span className="bg-accent/20 text-accent font-body text-[10px] tracking-wider uppercase px-2 py-1">
              Featured
            </span>
          )}
        </td>
        <td className="font-body text-sm text-muted-foreground p-4">
          {p.viewCount}
        </td>
        <td className="p-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(p)}
             className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
           <button
              onClick={() => handleDelete(p._id)}
              disabled={isDelete === p._id}
              className={`p-2 transition-colors ${
                isDelete === p._id
                  ? "opacity-50 cursor-not-allowed"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
        </table>
      </div>
    </div>
  );
}
