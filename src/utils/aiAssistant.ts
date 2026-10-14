import { Product, Transaction, Customer, DebtRecord, StockMovement } from '../types';
import { formatCurrency } from '../store';

export function getAIResponse(message: string, data: {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  debts: DebtRecord[];
  stockMovements: StockMovement[];
}): string {
  const lowerMsg = message.toLowerCase();
  const { transactions, products, customers, debts } = data;
  
  const completedTx = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTx.reduce((sum, t) => sum + t.total, 0);
  const totalProfit = completedTx.reduce((sum, t) => {
    return sum + t.items.reduce((is, item) => is + ((item.price - item.costPrice) * item.quantity), 0);
  }, 0);
  
  // Analisis lengkap
  if (lowerMsg.includes('analisis') || lowerMsg.includes('analisa') || lowerMsg.includes('analysis') || lowerMsg.includes('ringkasan')) {
    const now = new Date();
    const last7 = completedTx.filter(t => (now.getTime() - new Date(t.createdAt).getTime()) / 86400000 <= 7);
    const last30 = completedTx.filter(t => (now.getTime() - new Date(t.createdAt).getTime()) / 86400000 <= 30);
    const last7Rev = last7.reduce((s, t) => s + t.total, 0);
    const last30Rev = last30.reduce((s, t) => s + t.total, 0);
    
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    completedTx.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 3);
    
    const lowStock = products.filter(p => p.stock <= p.minStock);
    const unpaidDebts = debts.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount - d.paidAmount), 0);
    
    let r = `📊 **ANALISIS LENGKAP BISNIS ANDA**\n\n`;
    r += `━━━ 📈 Performa Keuangan ━━━\n`;
    r += `💰 Total Pendapatan: ${formatCurrency(totalRevenue)}\n`;
    r += `💎 Total Laba Kotor: ${formatCurrency(totalProfit)}\n`;
    r += `📊 Margin Laba: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%\n`;
    r += `🧾 Total Transaksi: ${completedTx.length}\n`;
    r += `💵 Rata-rata/Transaksi: ${formatCurrency(completedTx.length > 0 ? totalRevenue / completedTx.length : 0)}\n\n`;
    
    r += `━━━ 📅 Tren Penjualan ━━━\n`;
    r += `7 Hari Terakhir: ${formatCurrency(last7Rev)} (${last7.length} transaksi)\n`;
    r += `30 Hari Terakhir: ${formatCurrency(last30Rev)} (${last30.length} transaksi)\n\n`;
    
    if (topProducts.length > 0) {
      r += `━━━ 🏆 Produk Terlaris ━━━\n`;
      topProducts.forEach((p, i) => {
        r += `${i + 1}. ${p.name}: ${p.qty} unit (${formatCurrency(p.revenue)})\n`;
      });
      r += '\n';
    }
    
    if (lowStock.length > 0) {
      r += `━━━ ⚠️ Peringatan Stok ━━━\n`;
      lowStock.forEach(p => {
        r += `• ${p.name}: ${p.stock}/${p.minStock} unit\n`;
      });
      r += '\n';
    }
    
    if (unpaidDebts > 0) {
      r += `━━━ 💳 Hutang/Piutang ━━━\n`;
      r += `Total belum tertagih: ${formatCurrency(unpaidDebts)}\n\n`;
    }
    
    r += `━━━ 💡 Rekomendasi ━━━\n`;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    if (margin < 20) r += `• ⚡ Margin laba rendah (${margin.toFixed(1)}%), pertimbangkan naikkan harga atau kurangi biaya modal\n`;
    if (last7.length < 5) r += `• 📢 Transaksi minggu ini sedikit, tingkatkan promosi\n`;
    if (lowStock.length > 0) r += `• 📦 Segera restok ${lowStock.length} produk yang stoknya menipis\n`;
    if (customers.length < 10) r += `• 👥 Bangun database pelanggan untuk program loyalitas\n`;
    if (totalRevenue > 0 && margin > 30) r += `• ✅ Margin laba bagus! Pertahankan dan scale up\n`;
    r += `• 📊 Rutin pantau dashboard untuk keputusan berbasis data`;
    
    return r;
  }
  
  if (lowerMsg.includes('total') || lowerMsg.includes('pendapatan') || lowerMsg.includes('revenue')) {
    return `💰 **Ringkasan Pendapatan:**\n\n• Total Pendapatan: ${formatCurrency(totalRevenue)}\n• Total Laba Kotor: ${formatCurrency(totalProfit)}\n• Margin: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%\n• Dari ${completedTx.length} transaksi`;
  }
  
  if (lowerMsg.includes('laba') || lowerMsg.includes('profit') || lowerMsg.includes('keuntungan')) {
    return `💎 **Analisis Laba:**\n\n• Laba Kotor: ${formatCurrency(totalProfit)}\n• Margin Laba: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%\n\n💡 Tips: Margin laba sehat biasanya 20-40% untuk retail dan 50-70% untuk F&B.`;
  }
  
  if (lowerMsg.includes('produk') || lowerMsg.includes('terlaris') || lowerMsg.includes('best')) {
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    completedTx.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    });
    const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
    if (sorted.length === 0) return 'Belum ada data penjualan produk.';
    
    let r = '🏆 **Ranking Produk:**\n\n';
    sorted.slice(0, 10).forEach((item, idx) => {
      r += `${idx + 1}. ${item.name}\n   📦 ${item.qty} unit | 💰 ${formatCurrency(item.revenue)}\n\n`;
    });
    return r;
  }
  
  if (lowerMsg.includes('stok') || lowerMsg.includes('stock') || lowerMsg.includes('inventory')) {
    const lowStock = products.filter(p => p.stock <= p.minStock);
    const outOfStock = products.filter(p => p.stock === 0);
    const totalValue = products.reduce((s, p) => s + (p.costPrice * p.stock), 0);
    
    let r = `📦 **Status Inventory:**\n\n`;
    r += `• Total Produk: ${products.length}\n`;
    r += `• Nilai Inventory: ${formatCurrency(totalValue)}\n`;
    r += `• Stok Rendah: ${lowStock.length} produk\n`;
    r += `• Habis: ${outOfStock.length} produk\n\n`;
    
    if (lowStock.length > 0) {
      r += `⚠️ **Perlu Restok:**\n`;
      lowStock.forEach(p => {
        r += `• ${p.name}: ${p.stock}/${p.minStock} unit\n`;
      });
    }
    return r;
  }
  
  if (lowerMsg.includes('hutang') || lowerMsg.includes('piutang') || lowerMsg.includes('debt')) {
    const receivables = debts.filter(d => d.type === 'receivable' && d.status !== 'paid');
    const payables = debts.filter(d => d.type === 'payable' && d.status !== 'paid');
    const totalReceivable = receivables.reduce((s, d) => s + (d.amount - d.paidAmount), 0);
    const totalPayable = payables.reduce((s, d) => s + (d.amount - d.paidAmount), 0);
    
    let r = `💳 **Status Hutang/Piutang:**\n\n`;
    r += `📥 Piutang (orang berhutang ke Anda): ${formatCurrency(totalReceivable)}\n`;
    r += `📤 Hutang (Anda berhutang): ${formatCurrency(totalPayable)}\n`;
    r += `📊 Selisih: ${formatCurrency(totalReceivable - totalPayable)}\n\n`;
    
    if (receivables.length > 0) {
      r += `**Piutang Belum Lunas:**\n`;
      receivables.forEach(d => {
        r += `• ${d.customerName}: ${formatCurrency(d.amount - d.paidAmount)} (Jatuh tempo: ${d.dueDate})\n`;
      });
    }
    return r;
  }
  
  if (lowerMsg.includes('hari ini') || lowerMsg.includes('today')) {
    const today = new Date().toISOString().split('T')[0];
    const todayTx = completedTx.filter(t => t.date === today);
    const todayTotal = todayTx.reduce((s, t) => s + t.total, 0);
    const todayProfit = todayTx.reduce((s, t) => s + t.items.reduce((is, item) => is + ((item.price - item.costPrice) * item.quantity), 0), 0);
    
    return `📅 **Penjualan Hari Ini:**\n\n• Transaksi: ${todayTx.length}\n• Pendapatan: ${formatCurrency(todayTotal)}\n• Laba: ${formatCurrency(todayProfit)}`;
  }
  
  if (lowerMsg.includes('minggu') || lowerMsg.includes('week')) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const weekTx = completedTx.filter(t => new Date(t.createdAt) >= weekAgo);
    const weekTotal = weekTx.reduce((s, t) => s + t.total, 0);
    
    return `📅 **Penjualan Minggu Ini:**\n\n• Transaksi: ${weekTx.length}\n• Pendapatan: ${formatCurrency(weekTotal)}\n• Rata-rata/hari: ${formatCurrency(weekTotal / 7)}`;
  }
  
  if (lowerMsg.includes('pelanggan') || lowerMsg.includes('customer')) {
    if (customers.length === 0) return 'Belum ada data pelanggan. Tambahkan pelanggan di menu Pelanggan.';
    
    const topCustomers = [...customers].sort((a, b) => b.totalPurchase - a.totalPurchase).slice(0, 5);
    let r = `👥 **Top Pelanggan:**\n\n`;
    topCustomers.forEach((c, i) => {
      r += `${i + 1}. ${c.name}\n   💰 Total belanja: ${formatCurrency(c.totalPurchase)}\n   ⭐ Poin: ${c.points}\n\n`;
    });
    r += `Total pelanggan terdaftar: ${customers.length}`;
    return r;
  }
  
  if (lowerMsg.includes('tips') || lowerMsg.includes('saran') || lowerMsg.includes('rekomendasi') || lowerMsg.includes('sarankan')) {
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    let r = `💡 **Tips Mengembangkan Bisnis:**\n\n`;
    r += `**Strategi Keuangan:**\n`;
    r += `1. 💰 Jaga margin laba di atas 20%\n`;
    r += `2. 📊 Catat semua pengeluaran untuk hitung laba bersih\n`;
    r += `3. 💳 Kelola piutang dengan ketat, tetapkan jatuh tempo\n\n`;
    r += `**Strategi Penjualan:**\n`;
    r += `4. 🎯 Fokus pada produk terlaris, optimasi stoknya\n`;
    r += `5. 🎁 Buat program bundling untuk naikkan nilai transaksi\n`;
    r += `6. 👥 Bangun program loyalitas pelanggan\n\n`;
    r += `**Strategi Operasional:**\n`;
    r += `7. 📦 Monitor stok secara rutin, hindari overstock\n`;
    r += `8. 📱 Manfaatkan media sosial untuk promosi gratis\n`;
    r += `9. 🤝 Jaga hubungan baik dengan supplier untuk harga terbaik\n\n`;
    r += `**Berdasarkan Data Anda:**\n`;
    if (margin < 20) r += `• ⚡ Margin Anda ${margin.toFixed(1)}% - pertimbangkan optimasi harga\n`;
    else r += `• ✅ Margin ${margin.toFixed(1)}% sudah bagus!\n`;
    if (completedTx.length > 0) r += `• 📈 Rata-rata transaksi ${formatCurrency(totalRevenue / completedTx.length)}\n`;
    return r;
  }
  
  if (lowerMsg.includes('forecast') || lowerMsg.includes('prediksi') || lowerMsg.includes('proyeksi')) {
    const now = new Date();
    const last30 = completedTx.filter(t => (now.getTime() - new Date(t.createdAt).getTime()) / 86400000 <= 30);
    const last30Rev = last30.reduce((s, t) => s + t.total, 0);
    const dailyAvg = last30Rev / 30;
    
    let r = `🔮 **Proyeksi Penjualan:**\n\n`;
    r += `Berdasarkan 30 hari terakhir:\n`;
    r += `• Rata-rata harian: ${formatCurrency(dailyAvg)}\n`;
    r += `• Proyeksi bulan depan: ${formatCurrency(dailyAvg * 30)}\n`;
    r += `• Proyeksi 3 bulan: ${formatCurrency(dailyAvg * 90)}\n\n`;
    r += `💡 Tips: Proyeksi ini berdasarkan tren saat ini. Tingkatkan promosi untuk hasil lebih baik!`;
    return r;
  }
  
  // Default
  return `🤖 **AI Assistant BukuKas**\n\nSaya bisa membantu Anda dengan:\n\n` +
    `📊 **"analisis"** - Analisis lengkap bisnis\n` +
    `💰 **"total pendapatan"** - Ringkasan pendapatan\n` +
    `💎 **"laba"** - Analisis keuntungan\n` +
    `🏆 **"produk terlaris"** - Ranking produk\n` +
    `📦 **"stok"** - Status inventory\n` +
    `💳 **"hutang"** - Status piutang/hutang\n` +
    `👥 **"pelanggan"** - Top pelanggan\n` +
    `📅 **"hari ini"** - Penjualan hari ini\n` +
    `📅 **"minggu ini"** - Penjualan minggu ini\n` +
    `🔮 **"prediksi"** - Proyeksi penjualan\n` +
    `💡 **"tips"** - Tips bisnis\n\n` +
    `Silakan tanya apa saja!`;
}
