export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  items: TransactionItem[];
  total: number;
  paymentMethod: string;
  note: string;
  createdAt: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface DailySales {
  date: string;
  total: number;
  count: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
