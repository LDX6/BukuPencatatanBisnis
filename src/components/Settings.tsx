import { useState } from 'react';
import { Download, Trash2, Database, Info } from 'lucide-react';
import { getTransactions, getProducts, exportToCSV, downloadCSV } from '../store';

export default function Settings() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExportAll = () => {
    const transactions = getTransactions();
    const products = getProducts();
    const csv = exportToCSV(transactions, products);
    const filename = `backup-bukukas-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleClearAll = () => {
    localStorage.clear();
    setShowConfirm(false);
    alert('Semua data telah dihapus!');
    window.location.reload();
  };

  const transactions = getTransactions();
  const products = getProducts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">⚙️ Pengaturan</h1>

      {/* App Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">BukuKas AI</h2>
            <p className="text-sm text-gray-500">AI Agent Pembukuan Penjualan Bisnis</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>📌 Versi: 1.0.0</p>
          <p>💾 Data tersimpan di: Local Storage Browser</p>
          <p>📊 Total Produk: {products.length}</p>
          <p>🧾 Total Transaksi: {transactions.length}</p>
          <p>🤖 AI Assistant: Aktif</p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">✨ Fitur Aplikasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <p className="font-medium text-indigo-800">📊 Dashboard</p>
            <p className="text-sm text-indigo-600">Ringkasan penjualan dengan grafik visual</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="font-medium text-purple-800">📦 Manajemen Produk</p>
            <p className="text-sm text-purple-600">Kelola produk dan stok inventory</p>
          </div>
          <div className="p-3 bg-pink-50 rounded-lg">
            <p className="font-medium text-pink-800">🛒 Transaksi</p>
            <p className="text-sm text-pink-600">Catat penjualan dengan mudah</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="font-medium text-emerald-800">📋 Laporan</p>
            <p className="text-sm text-emerald-600">Laporan lengkap & export CSV</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="font-medium text-amber-800">🤖 AI Assistant</p>
            <p className="text-sm text-amber-600">Analisis & rekomendasi bisnis</p>
          </div>
          <div className="p-3 bg-cyan-50 rounded-lg">
            <p className="font-medium text-cyan-800">💾 Export Data</p>
            <p className="text-sm text-cyan-600">Download data dalam format CSV</p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" /> Manajemen Data
        </h2>
        <div className="space-y-3">
          <button
            onClick={handleExportAll}
            className="w-full flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors text-left"
          >
            <Download className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">Export Semua Data</p>
              <p className="text-sm text-emerald-600">Download semua data dalam format CSV</p>
            </div>
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Hapus Semua Data</p>
              <p className="text-sm text-red-600">Hapus semua data (tidak bisa dikembalikan)</p>
            </div>
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">💡 Tips Penggunaan</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>1. 📝 Selalu catat transaksi setiap hari agar data akurat</p>
          <p>2. 📦 Tambahkan produk terlebih dahulu sebelum membuat transaksi</p>
          <p>3. 🤖 Gunakan AI Assistant untuk mendapatkan insight bisnis</p>
          <p>4. 💾 Rutin export data sebagai backup</p>
          <p>5. 📊 Periksa dashboard secara berkala untuk memantau performa</p>
          <p>6. ⚠️ Perhatikan stok rendah agar tidak kehabisan produk</p>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">⚠️ Konfirmasi</h3>
            <p className="text-gray-600 mb-4">Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex gap-3">
              <button
                onClick={handleClearAll}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
