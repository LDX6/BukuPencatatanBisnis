export interface BusinessProfile {
  name: string;
  owner: string;
  address: string;
  phone: string;
  logo: string;
  currency: string;
  taxRate: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  category: string;
  unit: string;
  description: string;
  image: string;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  costPrice: number;
  discount: number;
  subtotal: number;
  scannedImage?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId?: string;
  customerName?: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'amount';
  tax: number;
  taxRate: number;
  total: number;
  paymentMethod: string;
  paidAmount: number;
  changeAmount: number;
  status: 'completed' | 'pending' | 'returned' | 'cancelled';
  note: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalPurchase: number;
  totalDebt: number;
  points: number;
  createdAt: string;
}

export interface DebtRecord {
  id: string;
  type: 'receivable' | 'payable';
  customerId?: string;
  customerName: string;
  description: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  transactionId?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  totalPurchase: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
  createdAt: string;
}

export interface ScannedProduct {
  id: string;
  name: string;
  confidence: number;
  price: number;
  image: string;
  matchedProductId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DailySales {
  date: string;
  total: number;
  count: number;
  profit: number;
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface TemplateSettings {
  // Receipt/Struk Template
  receipt: {
    header: string;
    footer: string;
    showLogo: boolean;
    showBusinessName: boolean;
    showAddress: boolean;
    showPhone: boolean;
    showDate: boolean;
    showInvoiceNumber: boolean;
    showCashierName: boolean;
    showCustomerName: boolean;
    showItemSKU: boolean;
    showItemPrice: boolean;
    showSubtotal: boolean;
    showDiscount: boolean;
    showTax: boolean;
    showPaymentMethod: boolean;
    showChange: boolean;
    showItemCount: boolean;
    showBarcode: boolean;
    paperSize: '58mm' | '80mm' | 'A4' | 'A5';
    fontSize: 'small' | 'medium' | 'large';
    alignment: 'left' | 'center' | 'right';
    separator: 'dash' | 'line' | 'none';
    thankYouMessage: string;
  };
  
  // Invoice Template
  invoice: {
    title: string;
    header: string;
    footer: string;
    showLogo: boolean;
    showBusinessInfo: boolean;
    showCustomerInfo: boolean;
    showPaymentTerms: boolean;
    showDueDate: boolean;
    showNotes: boolean;
    showSubtotal: boolean;
    showTax: boolean;
    showDiscount: boolean;
    showShippingCost: boolean;
    showGrandTotal: boolean;
    showSignature: boolean;
    signatureTitle: string;
    paymentTerms: string;
    notes: string;
    theme: 'professional' | 'modern' | 'minimal' | 'colorful';
    primaryColor: string;
    secondaryColor: string;
  };
  
  // Report Template
  report: {
    title: string;
    header: string;
    footer: string;
    showLogo: boolean;
    showBusinessInfo: boolean;
    showPeriod: boolean;
    showSummary: boolean;
    showDailyBreakdown: boolean;
    showProductBreakdown: boolean;
    showPaymentBreakdown: boolean;
    showProfitLoss: boolean;
    showCharts: boolean;
    showRecommendations: boolean;
    dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
    currencyFormat: 'symbol' | 'code' | 'full';
    includeGraphs: boolean;
    includeTables: boolean;
    theme: 'professional' | 'modern' | 'minimal';
    primaryColor: string;
  };
  
  // Product Label Template
  productLabel: {
    showName: boolean;
    showPrice: boolean;
    showSKU: boolean;
    showBarcode: boolean;
    showCategory: boolean;
    showWeight: boolean;
    showExpiryDate: boolean;
    showBusinessName: boolean;
    labelSize: 'small' | 'medium' | 'large';
    labelShape: 'rectangle' | 'rounded' | 'circle';
    showBorder: boolean;
    borderColor: string;
    backgroundColor: string;
    textColor: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  
  // Debt Note Template
  debtNote: {
    title: string;
    header: string;
    footer: string;
    showLogo: boolean;
    showBusinessInfo: boolean;
    showDebtorInfo: boolean;
    showAmount: boolean;
    showDueDate: boolean;
    showPaymentSchedule: boolean;
    showSignature: boolean;
    showWitness: boolean;
    signatureTitle: string;
    witnessTitle: string;
    terms: string;
    theme: 'formal' | 'simple' | 'detailed';
  };
  
  // Export Template
  export: {
    format: 'csv' | 'excel' | 'pdf';
    includeHeader: boolean;
    includeFooter: boolean;
    includeSummary: boolean;
    includeCharts: boolean;
    dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
    currencyFormat: 'symbol' | 'code' | 'full';
    separator: ',' | ';' | '\t';
    encoding: 'UTF-8' | 'ISO-8859-1';
    includeBOM: boolean;
  };
}

export type Page = 'dashboard' | 'pos' | 'products' | 'transactions' | 'reports' | 'customers' | 'debts' | 'stock' | 'ai' | 'settings';

