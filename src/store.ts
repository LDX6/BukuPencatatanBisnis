import { Product, Transaction, Customer, DebtRecord, Supplier, StockMovement, BusinessProfile, Notification } from './types';

const KEYS = {
  products: 'bukukas_products',
  transactions: 'bukukas_transactions',
  customers: 'bukukas_customers',
  debts: 'bukukas_debts',
  suppliers: 'bukukas_suppliers',
  stockMovements: 'bukukas_stock_movements',
  profile: 'bukukas_profile',
  notifications: 'bukukas_notifications',
  invoiceCounter: 'bukukas_invoice_counter',
};

function get<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getOne<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function setOne<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Products
export function getProducts(): Product[] { return get<Product>(KEYS.products); }
export function saveProducts(products: Product[]): void { set(KEYS.products, products); }

// Transactions
export function getTransactions(): Transaction[] { return get<Transaction>(KEYS.transactions); }
export function saveTransactions(transactions: Transaction[]): void { set(KEYS.transactions, transactions); }

// Customers
export function getCustomers(): Customer[] { return get<Customer>(KEYS.customers); }
export function saveCustomers(customers: Customer[]): void { set(KEYS.customers, customers); }

// Debts
export function getDebts(): DebtRecord[] { return get<DebtRecord>(KEYS.debts); }
export function saveDebts(debts: DebtRecord[]): void { set(KEYS.debts, debts); }

// Suppliers
export function getSuppliers(): Supplier[] { return get<Supplier>(KEYS.suppliers); }
export function saveSuppliers(suppliers: Supplier[]): void { set(KEYS.suppliers, suppliers); }

// Stock Movements
export function getStockMovements(): StockMovement[] { return get<StockMovement>(KEYS.stockMovements); }
export function saveStockMovements(movements: StockMovement[]): void { set(KEYS.stockMovements, movements); }

// Profile
export function getProfile(): BusinessProfile {
  return getOne<BusinessProfile>(KEYS.profile) || {
    name: 'Toko Saya',
    owner: '',
    address: '',
    phone: '',
    logo: '',
    currency: 'IDR',
    taxRate: 0,
    createdAt: new Date().toISOString(),
  };
}
export function saveProfile(profile: BusinessProfile): void { setOne(KEYS.profile, profile); }

// Notifications
export function getNotifications(): Notification[] { return get<Notification>(KEYS.notifications); }
export function saveNotifications(notifications: Notification[]): void { set(KEYS.notifications, notifications); }

// Invoice Counter
export function getNextInvoiceNumber(): string {
  const counter = parseInt(localStorage.getItem(KEYS.invoiceCounter) || '0') + 1;
  localStorage.setItem(KEYS.invoiceCounter, counter.toString());
  const date = new Date();
  const prefix = `INV-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  return `${prefix}-${String(counter).padStart(4, '0')}`;
}

// Utility functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
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

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function exportToCSV(transactions: Transaction[], products: Product[]): string {
  let csv = 'LAPORAN PENJUALAN - BukuKas AI\n';
  csv += `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}\n\n`;
  
  csv += '=== DATA TRANSAKSI ===\n';
  csv += 'No Invoice,Tanggal,Customer,Subtotal,Diskon,Pajak,Total,Pembayaran,Status,Catatan\n';
  transactions.forEach(t => {
    csv += `"${t.invoiceNumber}","${t.date}","${t.customerName||'-'}",${t.subtotal},${t.discount},${t.tax},${t.total},"${t.paymentMethod}","${t.status}","${t.note}"\n`;
  });
  
  csv += '\n=== DATA PRODUK ===\n';
  csv += 'SKU,Nama,Harga Jual,Harga Modal,Stok,Min Stok,Kategori,Supplier\n';
  products.forEach(p => {
    csv += `"${p.sku}","${p.name}",${p.price},${p.costPrice},${p.stock},${p.minStock},"${p.category}","${p.supplier}"\n`;
  });
  
  const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.total, 0);
  const totalProfit = transactions.filter(t => t.status === 'completed').reduce((s, t) => {
    return s + t.items.reduce((is, item) => is + (item.subtotal - (item.costPrice * item.quantity)), 0);
  }, 0);
  
  csv += `\n=== RINGKASAN ===\n`;
  csv += `Total Pendapatan,${totalRevenue}\n`;
  csv += `Total Laba Kotor,${totalProfit}\n`;
  csv += `Total Transaksi,${transactions.length}\n`;
  
  return csv;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function addNotification(type: Notification['type'], title: string, message: string): void {
  const notifications = getNotifications();
  notifications.unshift({
    id: generateId(),
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
  saveNotifications(notifications.slice(0, 50));
}

export function checkLowStock(): void {
  const products = getProducts();
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  if (lowStockProducts.length > 0) {
    addNotification('warning', 'Stok Rendah', `${lowStockProducts.length} produk memiliki stok di bawah minimum`);
  }
}
