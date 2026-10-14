import { useState, useEffect } from 'react';
import { Transaction, Product } from '../types';
import { getTransactions, getProducts, formatCurrency, formatDate, exportToCSV, downloadCSV } from '../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Download as DownloadIcon, FileText, Calendar as CalendarIcon, TrendingUp as TrendIcon, Printer } from 'lucide-react';

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'payments' | 'profit'>('overview');

  useEffect(() => {
    setTransactions(getTransactions());
    setProducts(getProducts());
  }, []);

  const completedTx = transactions.filter(t => t.status === 'completed');
  const filtered = completedTx.filter(t => {
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });

  const totalRevenue = filtered.reduce((s, t) => s + t.total, 0);
  const totalProfit = filtered.reduce((s, t) => s + t.items.reduce((is, item) => is + ((item.price - item.costPrice) * item.quantity), 0), 0);
  const totalDiscount = filtered.reduce((s, t) => s + t.discount, 0);
  const totalTax = filtered.reduce((s, t) => s + t.tax, 0);
  const avgTransaction = filtered.length > 0 ? totalRevenue / filtered.length : 0;
  const totalItemsSold = filtered.reduce((s, t) => s + t.items.reduce((is, item) => is + item.quantity, 0), 0);

  // Daily chart
  const dailyData: Record<string, { date: string; revenue: number; profit: number; count: number }> = {};
  filtered.forEach(t => {
    if (!dailyData[t.date]) dailyData[t.date] = { date: t.date, revenue: 0, profit: 0, count: 0 };
    dailyData[t.date].revenue += t.total;
    dailyData[t.date].profit += t.items.reduce((is, item) => is + ((item.price - item.costPrice) * item.quantity), 0);
    dailyData[t.date].count += 1;
  });
  const chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  // Product breakdown
  const productBreakdown: Record<string, { name: string; qty: number; revenue: number; profit: number; cost: number }> = {};
  filtered.forEach(t => {
    t.items.forEach(item => {
      if (!productBreakdown[item.productId]) productBreakdown[item.productId] = { name: item.productName, qty: 0, revenue: 0, profit: 0, cost: 0 };
      productBreakdown[item.productId].qty += item.quantity;
      productBreakdown[item.productId].revenue += item.subtotal;
      productBreakdown[item.productId].profit += (item.price - item.costPrice) * item.quantity;
      productBreakdown[item.productId].cost += item.costPrice * item.quantity;
    });
  });
  const sortedProducts = Object.values(productBreakdown).sort((a, b) => b.revenue - a.revenue);

  // Payment breakdown
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  filtered.forEach(t => {
    if (!paymentBreakdown[t.paymentMethod]) paymentBreakdown[t.paymentMethod] = { count: 0, total: 0 };
    paymentBreakdown[t.paymentMethod].count += 1;
    paymentBreakdown[t.paymentMethod].total += t.total;
  });

  const handleExport = () => {
    const csv = exportToCSV(filtered, products);
    downloadCSV(csv, `laporan-${dateFrom || 'awal'}-sampai-${dateTo || 'sekarang'}.csv`);
  };

  const tabs = [
    { id: 'overview' as const, label: '📊 Ringkasan' },
    { id: 'products' as const, label: '📦 Produk' },
    { id: 'payments' as const, label: '💳 Pembayaran' },
    { id: 'profit' as const, label: '💎 Laba Rugi' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Laporan Penjualan</h1>
          <p className="text-sm text-gray-500">{filtered.length} transaksi dalam periode</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition shadow-md">
          <DownloadIcon className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { const d = new Date(); setDateFrom(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]); }}
              className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100">Bulan Ini</button>
            <button onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Reset</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Pendapatan</p>
          <p className="text-lg font-bold text-indigo-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Laba Kotor</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalProfit)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Transaksi</p>
          <p className="text-lg font-bold text-purple-600">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Rata-rata</p>
          <p className="text-lg font-bold text-amber-600">{formatCurrency(avgTransaction)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Item Terjual</p>
          <p className="text-lg font-bold text-pink-600">{totalItemsSold}</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="font-semibold text-gray-700 mb-4">📈 Grafik Penjualan Harian</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={11} tickFormatter={(d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} />
                <YAxis fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(l) => formatDate(l)} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} name="Pendapatan" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} name="Laba" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="font-semibold text-gray-700 mb-4">📦 Detail Penjualan Produk</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-gray-600">Produk</th>
                  <th className="text-center py-2 px-2 text-gray-600">Qty</th>
                  <th className="text-right py-2 px-2 text-gray-600">Pendapatan</th>
                  <th className="text-right py-2 px-2 text-gray-600">Laba</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">{p.name}</td>
                    <td className="py-2 px-2 text-center">{p.qty}</td>
                    <td className="py-2 px-2 text-right text-indigo-600 font-medium">{formatCurrency(p.revenue)}</td>
                    <td className="py-2 px-2 text-right text-emerald-600">{formatCurrency(p.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="font-semibold text-gray-700 mb-4">💳 Breakdown Pembayaran</h3>
          <div className="space-y-3">
            {Object.entries(paymentBreakdown).map(([method, data]) => (
              <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{method}</p>
                  <p className="text-sm text-gray-500">{data.count} transaksi</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-600">{formatCurrency(data.total)}</p>
                  <p className="text-xs text-gray-400">{((data.total / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profit' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="font-semibold text-gray-700 mb-4">💎 Laporan Laba Rugi</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="font-medium text-indigo-800">Pendapatan Kotor</span>
                <span className="font-bold text-indigo-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-800">Harga Pokok Penjualan (HPP)</span>
                <span className="font-bold text-red-600">-{formatCurrency(totalRevenue - totalProfit)}</span>
              </div>
              <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                <span className="font-medium text-amber-800">Total Diskon</span>
                <span className="font-bold text-amber-600">-{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between p-3 bg-emerald-50 rounded-lg">
                <span className="font-bold text-emerald-800 text-lg">LABA KOTOR</span>
                <span className="font-bold text-emerald-600 text-lg">{formatCurrency(totalProfit)}</span>
              </div>
              <div className="text-center text-sm text-gray-500">
                Margin: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="font-semibold text-gray-700 mb-4">📈 Tren Laba Harian</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={11} tickFormatter={(d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric' })} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Laba" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
