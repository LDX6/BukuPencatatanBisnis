import { Product, Transaction, Customer, DebtRecord, Supplier, StockMovement, BusinessProfile, Notification, TemplateSettings } from './types';

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
  templateSettings: 'bukukas_template_settings',
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

// Template Settings
export function getTemplateSettings(): TemplateSettings {
  const saved = getOne<TemplateSettings>(KEYS.templateSettings);
  if (saved) return saved;
  
  // Default template settings
  return {
    receipt: {
      header: '',
      footer: '',
      showLogo: true,
      showBusinessName: true,
      showAddress: true,
      showPhone: true,
      showDate: true,
      showInvoiceNumber: true,
      showCashierName: false,
      showCustomerName: true,
      showItemSKU: false,
      showItemPrice: true,
      showSubtotal: true,
      showDiscount: true,
      showTax: true,
      showPaymentMethod: true,
      showChange: true,
      showItemCount: true,
      showBarcode: false,
      paperSize: '80mm',
      fontSize: 'medium',
      alignment: 'center',
      separator: 'dash',
      thankYouMessage: 'Terima kasih atas kunjungan Anda!',
    },
    invoice: {
      title: 'INVOICE',
      header: '',
      footer: 'Pembayaran diharapkan dalam 30 hari',
      showLogo: true,
      showBusinessInfo: true,
      showCustomerInfo: true,
      showPaymentTerms: true,
      showDueDate: true,
      showNotes: true,
      showSubtotal: true,
      showTax: true,
      showDiscount: true,
      showShippingCost: false,
      showGrandTotal: true,
      showSignature: false,
      signatureTitle: 'Hormat kami',
      paymentTerms: 'Net 30',
      notes: '',
      theme: 'professional',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
    },
    report: {
      title: 'LAPORAN PENJUALAN',
      header: '',
      footer: '',
      showLogo: true,
      showBusinessInfo: true,
      showPeriod: true,
      showSummary: true,
      showDailyBreakdown: true,
      showProductBreakdown: true,
      showPaymentBreakdown: true,
      showProfitLoss: true,
      showCharts: true,
      showRecommendations: true,
      dateFormat: 'dd/MM/yyyy',
      currencyFormat: 'symbol',
      includeGraphs: true,
      includeTables: true,
      theme: 'professional',
      primaryColor: '#6366f1',
    },
    productLabel: {
      showName: true,
      showPrice: true,
      showSKU: true,
      showBarcode: true,
      showCategory: false,
      showWeight: false,
      showExpiryDate: false,
      showBusinessName: false,
      labelSize: 'medium',
      labelShape: 'rounded',
      showBorder: true,
      borderColor: '#e5e7eb',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontSize: 'medium',
    },
    debtNote: {
      title: 'SURAT PERJANJIAN HUTANG',
      header: '',
      footer: '',
      showLogo: true,
      showBusinessInfo: true,
      showDebtorInfo: true,
      showAmount: true,
      showDueDate: true,
      showPaymentSchedule: true,
      showSignature: true,
      showWitness: false,
      signatureTitle: 'Debitur',
      witnessTitle: 'Saksi',
      terms: 'Saya yang bertanda tangan di bawah ini menyatakan berhutang dan akan melunasi sesuai jadwal yang disepakati.',
      theme: 'formal',
    },
    export: {
      format: 'csv',
      includeHeader: true,
      includeFooter: true,
      includeSummary: true,
      includeCharts: false,
      dateFormat: 'dd/MM/yyyy',
      currencyFormat: 'symbol',
      separator: ',',
      encoding: 'UTF-8',
      includeBOM: true,
    },
  };
}

export function saveTemplateSettings(settings: TemplateSettings): void {
  setOne(KEYS.templateSettings, settings);
}

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
  const template = getTemplateSettings();
  const profile = getProfile();
  const exportSettings = template.export;
  
  let csv = '';
  
  // Header
  if (exportSettings.includeHeader) {
    csv += `${template.report.title}\n`;
    csv += `${profile.name}\n`;
    if (profile.address) csv += `${profile.address}\n`;
    if (profile.phone) csv += `Telp: ${profile.phone}\n`;
    csv += `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}\n`;
    csv += '\n';
  }
  
  // Transactions
  csv += '=== DATA TRANSAKSI ===\n';
  csv += `No Invoice${exportSettings.separator}Tanggal${exportSettings.separator}Customer${exportSettings.separator}Subtotal${exportSettings.separator}Diskon${exportSettings.separator}Pajak${exportSettings.separator}Total${exportSettings.separator}Pembayaran${exportSettings.separator}Status${exportSettings.separator}Catatan\n`;
  transactions.forEach(t => {
    csv += `"${t.invoiceNumber}"${exportSettings.separator}"${t.date}"${exportSettings.separator}"${t.customerName||'-'}"${exportSettings.separator}${t.subtotal}${exportSettings.separator}${t.discount}${exportSettings.separator}${t.tax}${exportSettings.separator}${t.total}${exportSettings.separator}"${t.paymentMethod}"${exportSettings.separator}"${t.status}"${exportSettings.separator}"${t.note}"\n`;
  });
  
  csv += '\n=== DATA PRODUK ===\n';
  csv += `SKU${exportSettings.separator}Nama${exportSettings.separator}Harga Jual${exportSettings.separator}Harga Modal${exportSettings.separator}Stok${exportSettings.separator}Min Stok${exportSettings.separator}Kategori${exportSettings.separator}Supplier\n`;
  products.forEach(p => {
    csv += `"${p.sku}"${exportSettings.separator}"${p.name}"${exportSettings.separator}${p.price}${exportSettings.separator}${p.costPrice}${exportSettings.separator}${p.stock}${exportSettings.separator}${p.minStock}${exportSettings.separator}"${p.category}"${exportSettings.separator}"${p.supplier}"\n`;
  });
  
  // Summary
  if (exportSettings.includeSummary) {
    const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.total, 0);
    const totalProfit = transactions.filter(t => t.status === 'completed').reduce((s, t) => {
      return s + t.items.reduce((is, item) => is + (item.subtotal - (item.costPrice * item.quantity)), 0);
    }, 0);
    
    csv += `\n=== RINGKASAN ===\n`;
    csv += `Total Pendapatan${exportSettings.separator}${totalRevenue}\n`;
    csv += `Total Laba Kotor${exportSettings.separator}${totalProfit}\n`;
    csv += `Total Transaksi${exportSettings.separator}${transactions.length}\n`;
  }
  
  // Footer
  if (exportSettings.includeFooter && template.report.footer) {
    csv += `\n${template.report.footer}\n`;
  }
  
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
