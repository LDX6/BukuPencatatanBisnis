import { Product, Transaction } from './types';
import { formatCurrency } from './store';

export function analyzeSales(transactions: Transaction[], products: Product[]): string {
  if (transactions.length === 0) {
    return 'Belum ada data transaksi. Silakan tambahkan transaksi penjualan terlebih dahulu.';
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const avgTransaction = totalRevenue / transactions.length;
  
  // Find best selling products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSales[item.productId].qty += item.quantity;
      productSales[item.productId].revenue += item.subtotal;
    });
  });

  const sortedProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue);
  
  const topProduct = sortedProducts[0];
  
  // Recent trend
  const now = new Date();
  const last7Days = transactions.filter(t => {
    const diff = (now.getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const last7DaysRevenue = last7Days.reduce((sum, t) => sum + t.total, 0);

  let response = `📊 **Analisis Penjualan Bisnis Anda:**\n\n`;
  response += `💰 Total Pendapatan: ${formatCurrency(totalRevenue)}\n`;
  response += `📋 Total Transaksi: ${transactions.length} transaksi\n`;
  response += `📈 Rata-rata per Transaksi: ${formatCurrency(avgTransaction)}\n`;
  response += `📅 Pendapatan 7 Hari Terakhir: ${formatCurrency(last7DaysRevenue)}\n\n`;
  
  if (topProduct) {
    response += `🏆 Produk Terlaris: **${topProduct[1].name}**\n`;
    response += `   Terjual ${topProduct[1].qty} unit dengan pendapatan ${formatCurrency(topProduct[1].revenue)}\n\n`;
  }

  // Recommendations
  response += `💡 **Rekomendasi:**\n`;
  
  if (avgTransaction < 100000) {
    response += `• Pertimbangkan program bundling untuk meningkatkan nilai transaksi\n`;
  }
  
  if (last7Days.length < 3) {
    response += `• Transaksi 7 hari terakhir sedikit (${last7Days.length}), coba tingkatkan promosi\n`;
  }

  const lowStockProducts = products.filter(p => p.stock < 10);
  if (lowStockProducts.length > 0) {
    response += `• ⚠️ Stok rendah: ${lowStockProducts.map(p => p.name).join(', ')} - segera restok!\n`;
  }

  response += `\n• Pantau terus penjualan harian untuk mengidentifikasi tren\n`;
  response += `• Gunakan data ini untuk merencanakan strategi pemasaran`;

  return response;
}

export function getAIResponse(message: string, transactions: Transaction[], products: Product[]): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('total') || lowerMsg.includes('pendapatan') || lowerMsg.includes('revenue')) {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    return `💰 Total pendapatan bisnis Anda saat ini adalah **${formatCurrency(totalRevenue)}** dari ${transactions.length} transaksi.`;
  }
  
  if (lowerMsg.includes('produk') || lowerMsg.includes('terlaris') || lowerMsg.includes('best')) {
    const productSales: Record<string, { name: string; qty: number }> = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, qty: 0 };
        }
        productSales[item.productId].qty += item.quantity;
      });
    });
    
    const sorted = Object.entries(productSales).sort((a, b) => b[1].qty - a[1].qty);
    if (sorted.length === 0) return 'Belum ada data penjualan produk.';
    
    let response = '🏆 **Produk Terlaris:**\n\n';
    sorted.slice(0, 5).forEach((item, idx) => {
      response += `${idx + 1}. ${item[1].name} - ${item[1].qty} unit terjual\n`;
    });
    return response;
  }
  
  if (lowerMsg.includes('stok') || lowerMsg.includes('stock') || lowerMsg.includes('inventory')) {
    const lowStock = products.filter(p => p.stock < 10);
    if (lowStock.length === 0) return '✅ Semua produk memiliki stok yang cukup (di atas 10 unit).';
    
    let response = '⚠️ **Produk dengan Stok Rendah:**\n\n';
    lowStock.forEach(p => {
      response += `• ${p.name}: ${p.stock} unit tersisa\n`;
    });
    response += '\nSegera lakukan restok untuk menghindari kehabisan!';
    return response;
  }
  
  if (lowerMsg.includes('analisis') || lowerMsg.includes('analisa') || lowerMsg.includes('analysis')) {
    return analyzeSales(transactions, products);
  }
  
  if (lowerMsg.includes('tips') || lowerMsg.includes('saran') || lowerMsg.includes('rekomendasi')) {
    return `💡 **Tips Mengembangkan Bisnis Anda:**\n\n` +
      `1. 📊 Catat semua transaksi secara konsisten\n` +
      `2. 🎯 Fokus pada produk terlaris untuk optimasi stok\n` +
      `3. 💰 Pertimbangkan program loyalty untuk pelanggan setia\n` +
      `4. 📱 Manfaatkan media sosial untuk promosi\n` +
      `5. 📈 Evaluasi penjualan mingguan untuk identifikasi tren\n` +
      `6. 🤝 Bangun hubungan baik dengan pelanggan\n` +
      `7. 💡 Diversifikasi produk berdasarkan permintaan pasar`;
  }
  
  if (lowerMsg.includes('hari ini') || lowerMsg.includes('today')) {
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === today);
    const todayTotal = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    return `📅 **Penjualan Hari Ini:**\n\n` +
      `• Jumlah Transaksi: ${todayTransactions.length}\n` +
      `• Total Pendapatan: ${formatCurrency(todayTotal)}`;
  }
  
  if (lowerMsg.includes('minggu') || lowerMsg.includes('week')) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    const weekTotal = weekTransactions.reduce((sum, t) => sum + t.total, 0);
    return `📅 **Penjualan Minggu Ini:**\n\n` +
      `• Jumlah Transaksi: ${weekTransactions.length}\n` +
      `• Total Pendapatan: ${formatCurrency(weekTotal)}\n` +
      `• Rata-rata per Hari: ${formatCurrency(weekTotal / 7)}`;
  }
  
  // Default response
  return `🤖 Halo! Saya AI Assistant pembukuan Anda. Saya bisa membantu:\n\n` +
    `• Ketik **"analisis"** untuk analisis lengkap penjualan\n` +
    `• Ketik **"total"** atau **"pendapatan"** untuk melihat total pendapatan\n` +
    `• Ketik **"produk terlaris"** untuk melihat produk paling laris\n` +
    `• Ketik **"stok"** untuk cek stok rendah\n` +
    `• Ketik **"hari ini"** untuk penjualan hari ini\n` +
    `• Ketik **"minggu ini"** untuk penjualan minggu ini\n` +
    `• Ketik **"tips"** untuk tips mengembangkan bisnis\n\n` +
    `Silakan tanyakan apa saja tentang bisnis Anda!`;
}
