import { Product, Transaction } from './types';

const PRODUCTS_KEY = 'bukukas_products';
const TRANSACTIONS_KEY = 'bukukas_transactions';

export function getProducts(): Product[] {
  const data = localStorage.getItem(PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getTransactions(): Transaction[] {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function exportToCSV(transactions: Transaction[], products: Product[]): string {
  let csv = 'LAPORAN PENJUALAN\n';
  csv += `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}\n\n`;
  
  csv += 'DATA TRANSAKSI\n';
  csv += 'ID,Tanggal,Total,Pembayaran,Catatan\n';
  transactions.forEach(t => {
    csv += `${t.id},${t.date},${t.total},${t.paymentMethod},"${t.note}"\n`;
  });
  
  csv += '\nDATA PRODUK\n';
  csv += 'ID,Nama,Harga,Stok,Kategori\n';
  products.forEach(p => {
    csv += `${p.id},${p.name},${p.price},${p.stock},${p.category}\n`;
  });
  
  return csv;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
