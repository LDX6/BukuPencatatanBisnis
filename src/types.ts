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

export type Page = 'dashboard' | 'pos' | 'products' | 'transactions' | 'reports' | 'customers' | 'debts' | 'stock' | 'ai' | 'settings';

