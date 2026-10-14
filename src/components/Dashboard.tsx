import { useState, useEffect } from 'react';
import { Transaction, Product, Customer } from '../types';
import { formatCurrency, getProducts, getTransactions, getCustomers, getDebts } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Package, Users, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#84cc16'];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setTransactions(getTransactions());
    setProducts(getProducts());
    setCustomers(getCustomers());
  }, []);

  const completedTx = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTx.reduce((sum, t) => sum + t.total, 0);
  const totalProfit = completedTx.reduce((sum, t) => {
    return sum + t.items.reduce((is, item) => is + ((item.price - item.costPrice) * item.quantity), 0);
  }, 0);
  const totalTransactions = completedTx.length;
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const debts = getDebts();
  const unpaidDebts = debts.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayTx = completedTx.filter(t => t.date === dateStr);
    const dayTotal = dayTx.reduce((sum, t) => sum + t.total, 0);
    const dayProfit = dayTx.reduce((s, t) => s + t.items.reduce((is, item) => is + ((item.price - item.costPrice) * item.quantity), 0), 0);
    return {
      date: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      revenue: dayTotal,
      profit: dayProfit,
      count: dayTx.length,
    };
  });

  // Last 30 days trend
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayTx = completedTx.filter(t => t.date === dateStr);
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      total: dayTx.reduce((s, t) => s + t.total, 0),
    };
  });

  // Category breakdown
  const categoryData: Record<string, number> = {};
  completedTx.forEach(t => {
    t.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const category = product?.category || 'Lainnya';
      categoryData[category] = (categoryData[category] || 0) + item.subtotal;
    });
  });
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Top products
  const productSales: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};
  completedTx.forEach(t => {
    t.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0, profit: 0 };
      }
      productSales[item.productId].qty += item.quantity;
      productSales[item.productId].revenue += item.subtotal;
      productSales[item.productId].profit += (item.price - item.costPrice) * item.quantity;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Today vs Yesterday
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const todayRevenue = completedTx.filter(t => t.date === today).reduce((s, t) => s + t.total, 0);
  const yesterdayRevenue = completedTx.filter(t => t.date === yesterday).reduce((s, t) => s + t.total, 0);
  const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard</h1>
          <p className="text-gray-500 text-sm">Ringkasan performa bisnis Anda</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-indigo-200" />
            {revenueChange !== 0 && (
              <span className={`text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${revenueChange > 0 ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
                {revenueChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(revenueChange).toFixed(0)}%
              </span>
            )}
          </div>
          <p className="text-indigo-100 text-xs">Pendapatan</p>
          <p className="text-lg lg:text-xl font-bold mt-0.5">{formatCurrency(totalRevenue)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-emerald-200" />
          </div>
          <p className="text-emerald-100 text-xs">Laba Kotor</p>
          <p className="text-lg lg:text-xl font-bold mt-0.5">{formatCurrency(totalProfit)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-purple-100 text-xs">Transaksi</p>
          <p className="text-lg lg:text-xl font-bold mt-0.5">{totalTransactions}</p>
          <p className="text-purple-200 text-xs mt-0.5">Rata²: {formatCurrency(avgTransaction)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-amber-200" />
          </div>
          <p className="text-amber-100 text-xs">Pelanggan</p>
          <p className="text-lg lg:text-xl font-bold mt-0.5">{customers.length}</p>
          <p className="text-amber-200 text-xs mt-0.5">{products.length} produk</p>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || unpaidDebts > 0) && (
        <div className="space-y-2">
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800"><strong>{lowStockProducts.length} produk</strong> stok rendah: {lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}{lowStockProducts.length > 3 ? '...' : ''}</p>
            </div>
          )}
          {unpaidDebts > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800"><strong>Piutang belum tertagih:</strong> {formatCurrency(unpaidDebts)}</p>
            </div>
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-5">
          <h3 className="text-base font-semibold text-gray-700 mb-4">📈 Penjualan 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Pendapatan" />
              <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Laba" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-base font-semibold text-gray-700 mb-4">🥧 Per Kategori</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">Belum ada data</div>
          )}
        </div>
      </div>

      {/* 30-day trend */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h3 className="text-base font-semibold text-gray-700 mb-4">📉 Tren 30 Hari</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={last30Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={10} interval={4} />
            <YAxis fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Area type="monotone" dataKey="total" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-base font-semibold text-gray-700 mb-4">🏆 Produk Terlaris</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-2">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">{idx + 1}</span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.qty} terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600 text-sm">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-emerald-600">+{formatCurrency(product.profit)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Belum ada data penjualan</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-base font-semibold text-gray-700 mb-4">🧾 Transaksi Terbaru</h3>
          {completedTx.length > 0 ? (
            <div className="space-y-2">
              {completedTx.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{t.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{t.customerName || 'Umum'} • {t.items.length} item</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600 text-sm">{formatCurrency(t.total)}</p>
                    <p className="text-xs text-gray-400">{t.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Belum ada transaksi</p>
          )}
        </div>
      </div>
    </div>
  );
}
