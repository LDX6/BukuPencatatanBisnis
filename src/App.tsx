import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import POS from './components/POS';
import Reports from './components/Reports';
import AIChat from './components/AIChat';
import CustomerManager from './components/CustomerManager';
import SettingsPage from './components/Settings';
import { Page } from './types';
import { getProducts } from './store';
import { LayoutDashboard, Package, ShoppingCart, FileText, Bot, Settings as SettingsIcon, Menu, X, Bell, ScanLine, Users } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const products = getProducts();
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard, emoji: '📊' },
    { id: 'pos' as Page, label: 'Kasir (POS)', icon: ShoppingCart, emoji: '🛒', badge: 'SCAN' },
    { id: 'products' as Page, label: 'Produk', icon: Package, emoji: '📦' },
    { id: 'customers' as Page, label: 'Pelanggan', icon: Users, emoji: '👥' },
    { id: 'reports' as Page, label: 'Laporan', icon: FileText, emoji: '📋' },
    { id: 'ai' as Page, label: 'AI Assistant', icon: Bot, emoji: '🤖' },
    { id: 'settings' as Page, label: 'Pengaturan', icon: SettingsIcon, emoji: '⚙️' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'products': return <ProductManager />;
      case 'customers': return <CustomerManager />;
      case 'reports': return <Reports />;
      case 'ai': return <AIChat />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">BukuKas AI</h1>
              <p className="text-[10px] text-gray-500">AI-Powered Bookkeeping</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Notifications */}
        {lowStockCount > 0 && (
          <div className="mx-3 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <p className="text-xs text-amber-800 font-medium">{lowStockCount} produk stok rendah</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
            <p className="text-xs font-medium text-indigo-700">💡 Fitur Baru!</p>
            <p className="text-[11px] text-indigo-600 mt-0.5">Scan gambar produk di menu Kasir untuk identifikasi otomatis</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {navItems.find(item => item.id === currentPage)?.emoji}{' '}
                {navItems.find(item => item.id === currentPage)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {currentPage === 'pos' && (
                <span className="hidden sm:flex items-center gap-1 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2.5 py-1 rounded-full">
                  <ScanLine className="w-3 h-3" /> Scan Gambar Aktif
                </span>
              )}
              <span className="hidden md:inline text-sm text-gray-500">
                {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
