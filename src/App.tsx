import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import TransactionManager from './components/TransactionManager';
import Reports from './components/Reports';
import AIChat from './components/AIChat';
import Settings from './components/Settings';
import { LayoutDashboard, Package, ShoppingBag, FileText, Bot, Settings as SettingsIcon, Menu, X } from 'lucide-react';

type Page = 'dashboard' | 'products' | 'transactions' | 'reports' | 'ai' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard, emoji: '📊' },
    { id: 'products' as Page, label: 'Produk', icon: Package, emoji: '📦' },
    { id: 'transactions' as Page, label: 'Transaksi', icon: ShoppingBag, emoji: '🛒' },
    { id: 'reports' as Page, label: 'Laporan', icon: FileText, emoji: '📋' },
    { id: 'ai' as Page, label: 'AI Assistant', icon: Bot, emoji: '🤖' },
    { id: 'settings' as Page, label: 'Pengaturan', icon: SettingsIcon, emoji: '⚙️' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductManager />;
      case 'transactions': return <TransactionManager />;
      case 'reports': return <Reports />;
      case 'ai': return <AIChat />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">BukuKas AI</h1>
              <p className="text-xs text-gray-500">Pembukuan Bisnis</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {item.id === 'ai' && (
                  <span className="ml-auto text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full">AI</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
            <p className="text-xs font-medium text-indigo-700">💡 Tips</p>
            <p className="text-xs text-indigo-600 mt-1">Gunakan AI Assistant untuk analisis otomatis bisnis Anda!</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {navItems.find(item => item.id === currentPage)?.emoji}{' '}
                {navItems.find(item => item.id === currentPage)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-gray-500">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
