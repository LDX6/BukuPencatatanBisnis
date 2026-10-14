import { useState, useEffect } from 'react';
import { Transaction, Product, DailySales } from '../types';
import { getTransactions, getProducts, formatCurrency, formatDate, exportToCSV, downloadCSV } from '../store';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    setTransactions(getTransactions());
    setProducts(getProducts());
  }, []);

  const filteredTransactions = transactions.filter(t => {
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = filteredTransactions.length;
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Daily sales data for chart
  const dailySales: Record<string, DailySales> = {};
  filteredTransactions.forEach(t => {
    if (!dailySales[t.date]) {
      dailySales[t.date] = { date: t.date, total: 0, count: 0 };
    }
    dailySales[t.date].total += t.total;
    dailySales[t.date].count += 1;
  });
  const chartData = Object.values(dailySales).sort((a, b) => a.date.localeCompare(b.date));

  // Payment method breakdown
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  filteredTransactions.forEach(t => {
    if (!paymentBreakdown[t.paymentMethod]) {
      paymentBreakdown[t.paymentMethod] = { count: 0, total: 0 };
    }
    paymentBreakdown[t.paymentMethod].count += 1;
    paymentBreakdown[t.paymentMethod].total += t.total;
  });

  // Product sales breakdown
  const productBreakdown: Record<string, { name: string; qty: number; revenue: number }> = {};
  filteredTransactions.forEach(t => {
    t.items.forEach(item => {
      if (!productBreakdown[item.productId]) {
        productBreakdown[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productBreakdown[item.productId].qty += item.quantity;
      productBreakdown[item.productId].revenue += item.subtotal;
    });
  });
  const sortedProducts = Object.values(productBreakdown).sort((a, b) => b.revenue - a.revenue);

  const handleExport = () => {
    const csv = exportToCSV(filteredTransactions, products);
    const filename = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">📋 Laporan Penjualan</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Filter Periode
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-500 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-500 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-sm text-gray-500">Total Pendapatan</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-sm text-gray-500">Jumlah Transaksi</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{totalTransactions}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-sm text-gray-500">Rata-rata Transaksi</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(avgTransaction)}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Grafik Penjualan Harian
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickFormatter={(date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} />
              <YAxis fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => formatDate(label)} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Payment Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" /> Metode Pembayaran
        </h3>
        {Object.keys(paymentBreakdown).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(paymentBreakdown).map(([method, data]) => (
              <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{method}</p>
                  <p className="text-sm text-gray-500">{data.count} transaksi</p>
                </div>
                <span className="font-semibold text-indigo-600">{formatCurrency(data.total)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Belum ada data</p>
        )}
      </div>

      {/* Product Sales Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" /> Penjualan per Produk
        </h3>
        {sortedProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Produk</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Qty</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-gray-800">{product.name}</td>
                    <td className="py-3 px-2 text-center text-gray-600">{product.qty}</td>
                    <td className="py-3 px-2 text-right font-medium text-indigo-600">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Belum ada data penjualan produk</p>
        )}
      </div>
    </div>
  );
}
