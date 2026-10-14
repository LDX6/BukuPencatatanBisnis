import { useState, useEffect } from 'react';
import { Customer } from '../types';
import { getCustomers, saveCustomers, generateId, formatCurrency } from '../store';
import { Plus, Edit2, Trash2, Users, Search, Star, Phone, Mail } from 'lucide-react';

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => { setCustomers(getCustomers()); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: editing ? editing.id : generateId(),
      name: form.name, phone: form.phone, email: form.email, address: form.address,
      totalPurchase: editing ? editing.totalPurchase : 0,
      totalDebt: editing ? editing.totalDebt : 0,
      points: editing ? editing.points : 0,
      createdAt: editing ? editing.createdAt : new Date().toISOString(),
    };
    const updated = editing ? customers.map(c => c.id === editing.id ? customer : c) : [...customers, customer];
    saveCustomers(updated);
    setCustomers(updated);
    resetForm();
  };

  const resetForm = () => { setForm({ name: '', phone: '', email: '', address: '' }); setEditing(null); setShowForm(false); };

  const handleEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus pelanggan ini?')) {
      const updated = customers.filter(c => c.id !== id);
      saveCustomers(updated);
      setCustomers(updated);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const getLevel = (points: number) => {
    if (points >= 1000) return { name: 'Platinum', color: 'bg-gray-200 text-gray-800', icon: '💎' };
    if (points >= 500) return { name: 'Gold', color: 'bg-amber-100 text-amber-800', icon: '🥇' };
    if (points >= 100) return { name: 'Silver', color: 'bg-blue-100 text-blue-800', icon: '🥈' };
    return { name: 'Bronze', color: 'bg-orange-100 text-orange-800', icon: '🥉' };
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 Manajemen Pelanggan</h1>
          <p className="text-sm text-gray-500">{customers.length} pelanggan terdaftar</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md">
          <Plus className="w-4 h-4" /> Tambah Pelanggan
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Cari pelanggan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{editing ? '✏️ Edit' : '➕ Tambah'} Pelanggan</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" required placeholder="Nama *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
              <input type="text" placeholder="No. Telepon" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
              <textarea placeholder="Alamat" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" rows={2} />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">{editing ? 'Update' : 'Simpan'}</button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-100 py-2 rounded-lg">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer List */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const level = getLevel(c.points);
            return (
              <div key={c.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{c.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${level.color}`}>{level.icon} {level.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(c)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  {c.phone && <p className="text-sm text-gray-500 flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.phone}</p>}
                  {c.email && <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.email}</p>}
                </div>
                <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Total Belanja</p>
                    <p className="font-semibold text-indigo-600 text-sm">{formatCurrency(c.totalPurchase)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Poin Loyalty</p>
                    <p className="font-semibold text-amber-600 text-sm flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {c.points}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada pelanggan</p>
        </div>
      )}
    </div>
  );
}
