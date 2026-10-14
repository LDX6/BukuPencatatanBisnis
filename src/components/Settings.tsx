import { useState, useEffect } from 'react';
import { BusinessProfile, DebtRecord, StockMovement, Product } from '../types';
import { getProfile, saveProfile, getDebts, saveDebts, getStockMovements, getTransactions, getProducts, generateId, formatCurrency, formatDate, formatDateTime, exportToCSV, downloadCSV } from '../store';
import { Download, Trash2, Database, Info, Users, Package, AlertTriangle, Check, Plus, X, Palette } from 'lucide-react';
import TemplateEditor from './TemplateEditor';

export default function SettingsPage() {
  const [profile, setProfile] = useState<BusinessProfile>(getProfile());
  const [debts, setDebts] = useState<DebtRecord[]>(getDebts());
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(getStockMovements());
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'debts' | 'stock' | 'templates' | 'data'>('profile');
  const [debtForm, setDebtForm] = useState({ type: 'receivable' as 'receivable' | 'payable', customerName: '', description: '', amount: '', dueDate: '' });

  const transactions = getTransactions();
  const products = getProducts();

  const handleSaveProfile = () => {
    saveProfile(profile);
    setShowProfileForm(false);
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const debt: DebtRecord = {
      id: generateId(), type: debtForm.type, customerName: debtForm.customerName,
      description: debtForm.description, amount: Number(debtForm.amount), paidAmount: 0,
      dueDate: debtForm.dueDate, status: 'unpaid', createdAt: new Date().toISOString(),
    };
    const updated = [debt, ...debts];
    saveDebts(updated);
    setDebts(updated);
    setShowDebtForm(false);
    setDebtForm({ type: 'receivable', customerName: '', description: '', amount: '', dueDate: '' });
  };

  const handleDebtPayment = (id: string, amount: number) => {
    const payment = Number(prompt('Masukkan jumlah pembayaran:'));
    if (isNaN(payment) || payment <= 0) return;
    const updated = debts.map(d => {
      if (d.id === id) {
        const newPaid = d.paidAmount + payment;
        const status: DebtRecord['status'] = newPaid >= d.amount ? 'paid' : 'partial';
        return { ...d, paidAmount: newPaid, status };
      }
      return d;
    });
    saveDebts(updated);
    setDebts(updated);
  };

  const handleExportAll = () => {
    const csv = exportToCSV(transactions, products);
    downloadCSV(csv, `backup-bukukas-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleClearAll = () => {
    localStorage.clear();
    setShowConfirm(false);
    window.location.reload();
  };

  const tabs = [
    { id: 'profile' as const, label: '🏪 Profil Toko' },
    { id: 'debts' as const, label: '💳 Hutang/Piutang' },
    { id: 'stock' as const, label: '📦 Mutasi Stok' },
    { id: 'templates' as const, label: '🎨 Template' },
    { id: 'data' as const, label: '💾 Data' },
  ];

  const totalReceivable = debts.filter(d => d.type === 'receivable' && d.status !== 'paid').reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  const totalPayable = debts.filter(d => d.type === 'payable' && d.status !== 'paid').reduce((s, d) => s + (d.amount - d.paidAmount), 0);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">⚙️ Pengaturan</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow text-indigo-700' : 'text-gray-600'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">🏪 Profil Bisnis</h2>
            <button onClick={() => setShowProfileForm(!showProfileForm)} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200">
              {showProfileForm ? 'Batal' : 'Edit'}
            </button>
          </div>
          {showProfileForm ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nama Toko</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pemilik</label>
                  <input type="text" value={profile.owner} onChange={(e) => setProfile({...profile, owner: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Telepon</label>
                  <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pajak (%)</label>
                  <input type="number" value={profile.taxRate} onChange={(e) => setProfile({...profile, taxRate: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Alamat</label>
                  <textarea value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" rows={2} />
                </div>
              </div>
              <button onClick={handleSaveProfile} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Simpan</button>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Nama Toko:</strong> {profile.name || '-'}</p>
              <p><strong>Pemilik:</strong> {profile.owner || '-'}</p>
              <p><strong>Telepon:</strong> {profile.phone || '-'}</p>
              <p><strong>Alamat:</strong> {profile.address || '-'}</p>
              <p><strong>Pajak:</strong> {profile.taxRate}%</p>
              <div className="pt-3 border-t mt-3">
                <p className="text-gray-500">📊 Total Produk: {products.length}</p>
                <p className="text-gray-500">🧾 Total Transaksi: {transactions.length}</p>
                <p className="text-gray-500">💳 Piutang: {formatCurrency(totalReceivable)}</p>
                <p className="text-gray-500">💳 Hutang: {formatCurrency(totalPayable)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debts Tab */}
      {activeTab === 'debts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600">Piutang (orang berhutang)</p>
              <p className="text-xl font-bold text-blue-800">{formatCurrency(totalReceivable)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm text-red-600">Hutang (Anda berhutang)</p>
              <p className="text-xl font-bold text-red-800">{formatCurrency(totalPayable)}</p>
            </div>
          </div>

          <button onClick={() => setShowDebtForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Tambah Hutang/Piutang
          </button>

          {showDebtForm && (
            <div className="bg-white rounded-xl shadow-md p-5">
              <form onSubmit={handleAddDebt} className="space-y-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setDebtForm({...debtForm, type: 'receivable'})}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${debtForm.type === 'receivable' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    📥 Piutang
                  </button>
                  <button type="button" onClick={() => setDebtForm({...debtForm, type: 'payable'})}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${debtForm.type === 'payable' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    📤 Hutang
                  </button>
                </div>
                <input type="text" required placeholder="Nama orang/toko" value={debtForm.customerName} onChange={(e) => setDebtForm({...debtForm, customerName: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                <input type="text" required placeholder="Keterangan" value={debtForm.description} onChange={(e) => setDebtForm({...debtForm, description: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                <input type="number" required placeholder="Jumlah (Rp)" value={debtForm.amount} onChange={(e) => setDebtForm({...debtForm, amount: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                <input type="date" required value={debtForm.dueDate} onChange={(e) => setDebtForm({...debtForm, dueDate: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">Simpan</button>
                  <button type="button" onClick={() => setShowDebtForm(false)} className="flex-1 bg-gray-100 py-2 rounded-lg">Batal</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-2">
            {debts.filter(d => d.status !== 'paid').map(debt => (
              <div key={debt.id} className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${debt.type === 'receivable' ? 'border-blue-500' : 'border-red-500'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{debt.customerName}</p>
                    <p className="text-sm text-gray-500">{debt.description}</p>
                    <p className="text-xs text-gray-400">Jatuh tempo: {debt.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatCurrency(debt.amount)}</p>
                    <p className="text-sm text-emerald-600">Terbayar: {formatCurrency(debt.paidAmount)}</p>
                    <p className="text-sm text-red-600">Sisa: {formatCurrency(debt.amount - debt.paidAmount)}</p>
                  </div>
                </div>
                <button onClick={() => handleDebtPayment(debt.id, debt.amount)} className="mt-2 text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-200">
                  💰 Catat Pembayaran
                </button>
              </div>
            ))}
            {debts.filter(d => d.status !== 'paid').length === 0 && (
              <p className="text-center text-gray-400 py-8">Tidak ada hutang/piutang aktif</p>
            )}
          </div>
        </div>
      )}

      {/* Stock Movements Tab */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📦 Riwayat Mutasi Stok</h2>
          <div className="space-y-2">
            {stockMovements.slice(0, 50).map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    m.type === 'in' ? 'bg-green-100 text-green-700' :
                    m.type === 'out' ? 'bg-red-100 text-red-700' :
                    m.type === 'return' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {m.type === 'in' ? '↓' : m.type === 'out' ? '↑' : m.type === 'return' ? '↩' : '±'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{m.productName}</p>
                    <p className="text-xs text-gray-500">{m.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${m.type === 'in' || m.type === 'return' ? 'text-green-600' : 'text-red-600'}`}>
                    {m.type === 'in' || m.type === 'return' ? '+' : '-'}{Math.abs(m.quantity)}
                  </p>
                  <p className="text-xs text-gray-400">{m.previousStock} → {m.newStock}</p>
                </div>
              </div>
            ))}
            {stockMovements.length === 0 && (
              <p className="text-center text-gray-400 py-8">Belum ada mutasi stok</p>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && <TemplateEditor />}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">💾 Manajemen Data</h2>
            <div className="space-y-3">
              <button onClick={handleExportAll} className="w-full flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition text-left">
                <Download className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-800">Export Semua Data</p>
                  <p className="text-sm text-emerald-600">Download data dalam format CSV</p>
                </div>
              </button>
              <button onClick={() => setShowConfirm(true)} className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition text-left">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Hapus Semua Data</p>
                  <p className="text-sm text-red-600">Hapus semua data (tidak bisa dikembalikan)</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">✨ Fitur Aplikasi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                '📊 Dashboard dengan grafik visual',
                '🛒 POS dengan scan gambar produk',
                '📦 Manajemen produk & stok',
                '📋 Laporan lengkap & export',
                '🤖 AI Assistant analisis bisnis',
                '💳 Tracking hutang/piutang',
                '👥 Manajemen pelanggan',
                '📦 Mutasi stok otomatis',
                '💎 Laporan laba rugi',
                '📸 Scan gambar untuk identifikasi produk',
              ].map((f, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded-lg">{f}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">⚠️ Konfirmasi</h3>
            <p className="text-gray-600 mb-4">Hapus semua data? Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={handleClearAll} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Ya, Hapus</button>
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
