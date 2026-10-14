import { useState, useEffect } from 'react';
import { Transaction, TransactionItem, Product } from '../types';
import { getTransactions, saveTransactions, getProducts, saveProducts, generateId, formatCurrency, formatDate } from '../store';
import { Plus, Trash2, ShoppingBag, Receipt } from 'lucide-react';

export default function TransactionManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [note, setNote] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTransactions(getTransactions());
    setProducts(getProducts());
  }, []);

  const addItem = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    if (product.stock < quantity) {
      alert('Stok tidak mencukupi!');
      return;
    }

    const existingItem = items.find(item => item.productId === selectedProduct);
    if (existingItem) {
      setItems(items.map(item =>
        item.productId === selectedProduct
          ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.price }
          : item
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Tambahkan minimal satu produk!');
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      date: transactionDate,
      items,
      total,
      paymentMethod,
      note,
      createdAt: new Date().toISOString(),
    };

    // Update stock
    const updatedProducts = products.map(p => {
      const soldItem = items.find(item => item.productId === p.id);
      if (soldItem) {
        return { ...p, stock: p.stock - soldItem.quantity };
      }
      return p;
    });

    const updatedTransactions = [transaction, ...transactions];
    saveTransactions(updatedTransactions);
    saveProducts(updatedProducts);
    setTransactions(updatedTransactions);
    setProducts(updatedProducts);
    resetForm();
  };

  const resetForm = () => {
    setItems([]);
    setPaymentMethod('Tunai');
    setNote('');
    setSelectedProduct('');
    setQuantity(1);
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      saveTransactions(updatedTransactions);
      setTransactions(updatedTransactions);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.date.includes(searchTerm) ||
    t.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    t.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">🛒 Transaksi Penjualan</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Transaksi Baru
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Cari transaksi (tanggal, produk, catatan)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🧾 Transaksi Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Add Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tambah Produk</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatCurrency(p.price)} (Stok: {p.stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Item Penjualan:</h4>
                  {items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-indigo-600">{formatCurrency(item.subtotal)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-bold text-lg text-gray-800">Total:</span>
                    <span className="font-bold text-xl text-indigo-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Tunai">💵 Tunai</option>
                  <option value="Transfer">🏦 Transfer Bank</option>
                  <option value="QRIS">📱 QRIS</option>
                  <option value="E-Wallet">💳 E-Wallet (OVO/GoPay/Dana)</option>
                  <option value="Kredit">📝 Kredit/Hutang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Contoh: Pembelian oleh Budi"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  💾 Simpan Transaksi
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{formatDate(transaction.date)}</p>
                    <p className="text-sm text-gray-500">{transaction.paymentMethod}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-indigo-600">{formatCurrency(transaction.total)}</span>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pl-13">
                <div className="space-y-1">
                  {transaction.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      • {item.productName} x{item.quantity} = {formatCurrency(item.subtotal)}
                    </p>
                  ))}
                </div>
                {transaction.note && (
                  <p className="text-sm text-gray-400 mt-2 italic">📝 {transaction.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Belum ada transaksi</p>
          <p className="text-gray-400 text-sm mt-1">Klik "Transaksi Baru" untuk memulai pencatatan</p>
        </div>
      )}
    </div>
  );
}
