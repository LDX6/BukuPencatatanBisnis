import { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProducts, saveProducts, generateId, formatCurrency, getStockMovements, saveStockMovements } from '../store';
import { Plus, Edit2, Trash2, Package, Search, Upload, Camera, Image } from 'lucide-react';

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '', sku: '', barcode: '', price: '', costPrice: '', stock: '', minStock: '5',
    category: '', unit: 'pcs', description: '', image: '', supplier: '',
  });

  useEffect(() => { setProducts(getProducts()); }, []);

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const product: Product = {
      id: editingProduct ? editingProduct.id : generateId(),
      name: formData.name,
      sku: formData.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      barcode: formData.barcode || Math.floor(Math.random() * 9000000000000 + 1000000000000).toString(),
      price: Number(formData.price),
      costPrice: Number(formData.costPrice),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      category: formData.category,
      unit: formData.unit,
      description: formData.description,
      image: formData.image,
      supplier: formData.supplier,
      createdAt: editingProduct ? editingProduct.createdAt : now,
      updatedAt: now,
    };

    let updated: Product[];
    if (editingProduct) {
      updated = products.map(p => p.id === editingProduct.id ? product : p);
      // Track stock change
      if (product.stock !== editingProduct.stock) {
        const movements = getStockMovements();
        movements.unshift({
          id: generateId(), productId: product.id, productName: product.name,
          type: 'adjustment', quantity: product.stock - editingProduct.stock,
          previousStock: editingProduct.stock, newStock: product.stock,
          reason: 'Manual adjustment', date: now, createdAt: now,
        });
        saveStockMovements(movements);
      }
    } else {
      updated = [...products, product];
    }

    saveProducts(updated);
    setProducts(updated);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', barcode: '', price: '', costPrice: '', stock: '', minStock: '5', category: '', unit: 'pcs', description: '', image: '', supplier: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name, sku: p.sku, barcode: p.barcode, price: p.price.toString(),
      costPrice: p.costPrice.toString(), stock: p.stock.toString(), minStock: p.minStock.toString(),
      category: p.category, unit: p.unit, description: p.description, image: p.image, supplier: p.supplier,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
      setProducts(updated);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 200;
          let w = img.width, h = img.height;
          if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize; } }
          else { if (h > maxSize) { w = w * maxSize / h; h = maxSize; } }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          setFormData(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.6) }));
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 Manajemen Produk</h1>
          <p className="text-sm text-gray-500">{products.length} produk terdaftar</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Cari produk, SKU, kategori..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Kategori</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800">{editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {formData.image ? (
                    <img src={formData.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Foto</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: Kopi Susu Gula Aren" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="Auto-generate" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input type="text" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="Auto-generate" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (Rp) *</label>
                  <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="15000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Modal (Rp) *</label>
                  <input type="number" required value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="8000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                  <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Stok</label>
                  <input type="number" value={formData.minStock} onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                  <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="Minuman" list="categories" />
                  <datalist id="categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500">
                    <option value="pcs">Pcs</option>
                    <option value="kg">Kg</option>
                    <option value="liter">Liter</option>
                    <option value="pack">Pack</option>
                    <option value="box">Box</option>
                    <option value="gelas">Gelas</option>
                    <option value="porsi">Porsi</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input type="text" value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="Nama supplier" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" rows={2} placeholder="Deskripsi produk..." />
                </div>
              </div>

              {formData.price && formData.costPrice && (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-sm text-indigo-700">💰 Margin: <strong>{formatCurrency(Number(formData.price) - Number(formData.costPrice))}</strong> ({((Number(formData.price) - Number(formData.costPrice)) / Number(formData.price) * 100).toFixed(1)}%)</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
                  {editingProduct ? 'Update' : 'Simpan'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group">
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-10 h-10 text-gray-400" />
                )}
                {product.stock <= product.minStock && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {product.stock === 0 ? 'Habis' : 'Stok Rendah'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(product)} className="p-2 bg-white rounded-full shadow-md hover:bg-indigo-50"><Edit2 className="w-4 h-4 text-indigo-600" /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-white rounded-full shadow-md hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-400">{product.sku}</p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{product.category}</span>
                </div>
                <div className="mt-3 flex justify-between items-end">
                  <div>
                    <p className="text-base font-bold text-indigo-600">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-gray-400">Modal: {formatCurrency(product.costPrice)}</p>
                  </div>
                  <p className={`text-sm font-medium ${product.stock <= product.minStock ? 'text-red-500' : 'text-gray-600'}`}>
                    {product.stock} {product.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Belum ada produk</p>
          <p className="text-gray-400 text-sm mt-1">Klik "Tambah Produk" untuk memulai</p>
        </div>
      )}
    </div>
  );
}
