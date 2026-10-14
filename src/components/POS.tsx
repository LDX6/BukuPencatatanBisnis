import { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionItem, Product, Customer, ScannedProduct } from '../types';
import { getTransactions, saveTransactions, getProducts, saveProducts, getCustomers, saveCustomers, generateId, formatCurrency, getNextInvoiceNumber, getStockMovements, saveStockMovements } from '../store';
import { analyzeImage, uploadImage } from '../utils/imageScanner';
import { Camera, Search, Plus, Minus, Trash2, ShoppingCart, ScanLine, X, Check, CreditCard, Banknote, QrCode, Smartphone } from 'lucide-react';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('0');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [note, setNote] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScannedProduct[]>([]);
  const [scannedImage, setScannedImage] = useState('');
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setProducts(getProducts());
    setCustomers(getCustomers());
    setTransactions(getTransactions());
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = discountType === 'percent' ? subtotal * (Number(discount) / 100) : Number(discount);
  const afterDiscount = subtotal - discountAmount;
  const taxRate = 0;
  const tax = afterDiscount * taxRate;
  const total = afterDiscount + tax;
  const change = Number(paidAmount) - total;

  const addProduct = (product: Product, qty: number = 1) => {
    if (product.stock < qty) { alert('Stok tidak mencukupi!'); return; }
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      if (product.stock < existing.quantity + qty) { alert('Stok tidak mencukupi!'); return; }
      setItems(items.map(i => i.productId === product.id ? {
        ...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * i.price
      } : i));
    } else {
      setItems([...items, {
        productId: product.id, productName: product.name, sku: product.sku,
        quantity: qty, price: product.price, costPrice: product.costPrice,
        discount: 0, subtotal: product.price * qty,
      }]);
    }
  };

  const updateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) { removeItem(productId); return; }
    const product = products.find(p => p.id === productId);
    if (product && product.stock < newQty) { alert('Stok tidak mencukupi!'); return; }
    setItems(items.map(i => i.productId === productId ? { ...i, quantity: newQty, subtotal: newQty * i.price } : i));
  };

  const removeItem = (productId: string) => { setItems(items.filter(i => i.productId !== productId)); };

  const handleScan = async () => {
    try {
      setScanning(true);
      const imageData = await uploadImage();
      setScannedImage(imageData);
      const results = await analyzeImage(imageData, products);
      setScanResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const addScannedProduct = (result: ScannedProduct) => {
    if (result.matchedProductId) {
      const product = products.find(p => p.id === result.matchedProductId);
      if (product) {
        addProduct(product);
        // Attach scanned image to last item
        setItems(prev => {
          const updated = [...prev];
          const lastItem = updated[updated.length - 1];
          if (lastItem) lastItem.scannedImage = scannedImage;
          return updated;
        });
      }
    } else {
      // Add as new item with scanned price
      setItems([...items, {
        productId: result.id, productName: result.name, sku: 'SCAN',
        quantity: 1, price: result.price, costPrice: result.price * 0.6,
        discount: 0, subtotal: result.price, scannedImage,
      }]);
    }
    setShowScanner(false);
    setScanResults([]);
  };

  const handleCheckout = () => {
    if (items.length === 0) { alert('Keranjang kosong!'); return; }
    
    const customer = customers.find(c => c.id === selectedCustomer);
    const invoiceNumber = getNextInvoiceNumber();
    const now = new Date().toISOString();
    
    const transaction: Transaction = {
      id: generateId(), invoiceNumber, date: now.split('T')[0],
      customerId: selectedCustomer || undefined, customerName: customer?.name || 'Umum',
      items, subtotal, discount: discountAmount, discountType, tax, taxRate, total,
      paymentMethod, paidAmount: Number(paidAmount) || total, changeAmount: Math.max(0, change),
      status: 'completed', note, createdAt: now,
    };

    // Update stock
    const updatedProducts = products.map(p => {
      const soldItem = items.find(i => i.productId === p.id);
      if (soldItem) return { ...p, stock: p.stock - soldItem.quantity, updatedAt: now };
      return p;
    });

    // Record stock movements
    const movements = getStockMovements();
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        movements.unshift({
          id: generateId(), productId: product.id, productName: product.name,
          type: 'out', quantity: item.quantity, previousStock: product.stock,
          newStock: product.stock - item.quantity, reason: `Penjualan ${invoiceNumber}`,
          date: now, createdAt: now,
        });
      }
    });

    // Update customer purchase
    if (customer) {
      const updatedCustomers = customers.map(c => c.id === customer.id ? {
        ...c, totalPurchase: c.totalPurchase + total, points: c.points + Math.floor(total / 10000)
      } : c);
      saveCustomers(updatedCustomers);
      setCustomers(updatedCustomers);
    }

    const updatedTx = [transaction, ...transactions];
    saveTransactions(updatedTx);
    saveProducts(updatedProducts);
    saveStockMovements(movements);
    setTransactions(updatedTx);
    setProducts(updatedProducts);
    
    setShowReceipt(transaction);
    setItems([]);
    setSelectedCustomer('');
    setPaidAmount('');
    setDiscount('0');
    setNote('');
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-7rem)]">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari produk..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={handleScan} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition shadow-md">
            <ScanLine className="w-4 h-4" /> <span className="hidden sm:inline">Scan</span>
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
          {filteredProducts.map(product => (
            <button key={product.id} onClick={() => addProduct(product)} disabled={product.stock === 0}
              className={`bg-white rounded-xl shadow-sm p-3 text-left hover:shadow-md transition-all ${product.stock === 0 ? 'opacity-50' : 'hover:scale-[1.02]'}`}>
              <div className="h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">📦</span>}
              </div>
              <p className="font-medium text-gray-800 text-xs truncate">{product.name}</p>
              <p className="text-indigo-600 font-bold text-sm">{formatCurrency(product.price)}</p>
              <p className={`text-xs ${product.stock <= product.minStock ? 'text-red-500' : 'text-gray-400'}`}>Stok: {product.stock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg flex flex-col min-h-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Keranjang</h2>
            <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{items.length} item</span>
          </div>
          <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full mt-2 px-3 py-1.5 text-sm rounded-lg border border-gray-200">
            <option value="">Pelanggan Umum</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keranjang kosong</p>
              <p className="text-xs">Pilih produk atau scan gambar</p>
            </div>
          ) : items.map(item => (
            <div key={item.productId} className="bg-gray-50 rounded-lg p-3 relative">
              {item.scannedImage && (
                <img src={item.scannedImage} alt="" className="absolute top-1 right-1 w-8 h-8 rounded object-cover border border-gray-200" />
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{item.productName}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="font-semibold text-indigo-600 text-sm">{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="border-t p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Diskon:</span>
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-16 px-2 py-1 text-sm rounded border" />
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'percent' | 'amount')} className="px-2 py-1 text-sm rounded border">
              <option value="percent">%</option><option value="amount">Rp</option>
            </select>
            <span className="text-sm text-red-500 ml-auto">-{formatCurrency(discountAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
            <span>TOTAL</span><span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-4 gap-1.5 pt-2">
            {[
              { method: 'Tunai', icon: Banknote, color: 'bg-green-100 text-green-700' },
              { method: 'Transfer', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
              { method: 'QRIS', icon: QrCode, color: 'bg-purple-100 text-purple-700' },
              { method: 'E-Wallet', icon: Smartphone, color: 'bg-amber-100 text-amber-700' },
            ].map(pm => (
              <button key={pm.method} onClick={() => setPaymentMethod(pm.method)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition ${paymentMethod === pm.method ? pm.color + ' ring-2 ring-offset-1 ring-indigo-400' : 'bg-gray-50 text-gray-500'}`}>
                <pm.icon className="w-4 h-4" />{pm.method}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="Jumlah bayar"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <button onClick={() => setPaidAmount(total.toString())} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Pas</button>
          </div>
          {Number(paidAmount) > 0 && change >= 0 && (
            <p className="text-sm text-emerald-600 font-medium">Kembalian: {formatCurrency(change)}</p>
          )}

          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan (opsional)"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />

          <button onClick={handleCheckout} disabled={items.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 shadow-lg">
            💳 Bayar {formatCurrency(total)}
          </button>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">📸 Scan Produk</h2>
              <button onClick={() => { setShowScanner(false); setScanResults([]); }} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            {scanning ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Menganalisis gambar...</p>
                <p className="text-sm text-gray-400">AI sedang mengenali produk</p>
              </div>
            ) : scanResults.length > 0 ? (
              <div className="space-y-3">
                {scannedImage && <img src={scannedImage} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />}
                <p className="text-sm text-gray-600 font-medium">Produk terdeteksi:</p>
                {scanResults.map(result => (
                  <button key={result.id} onClick={() => addScannedProduct(result)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition text-left">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{result.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(result.price)} • {result.matchedProductId ? '✅ Cocok' : '🆕 Baru'}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{(result.confidence * 100).toFixed(0)}%</span>
                  </button>
                ))}
                <button onClick={() => setScanResults([])} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">Scan ulang</button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-purple-600" />
                </div>
                <p className="text-gray-600 mb-4">Ambil foto produk untuk di-scan</p>
                <button onClick={handleScan} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:opacity-90 transition shadow-lg">
                  📸 Ambil / Upload Foto
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Transaksi Berhasil!</h2>
              <p className="text-sm text-gray-500">{showReceipt.invoiceNumber}</p>
            </div>
            <div className="border-t border-dashed pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span>{showReceipt.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pelanggan</span><span>{showReceipt.customerName}</span></div>
              {showReceipt.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.productName} ×{item.quantity}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span><span className="text-indigo-600">{formatCurrency(showReceipt.total)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs mt-1">
                  <span>{showReceipt.paymentMethod}</span>
                  <span>Bayar: {formatCurrency(showReceipt.paidAmount)}</span>
                </div>
                {showReceipt.changeAmount > 0 && (
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Kembalian</span><span>{formatCurrency(showReceipt.changeAmount)}</span>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setShowReceipt(null)} className="w-full mt-4 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium">
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">📋 Riwayat Transaksi Hari Ini</h3>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
              {transactions.filter(t => t.date === new Date().toISOString().split('T')[0]).map(t => (
                <div key={t.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t.invoiceNumber}</span>
                    <span className="text-sm font-bold text-indigo-600">{formatCurrency(t.total)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{t.customerName} • {t.items.length} item • {t.paymentMethod}</p>
                </div>
              ))}
              {transactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <p className="text-center text-gray-400 py-4 text-sm">Belum ada transaksi hari ini</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
