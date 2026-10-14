import { useState, useEffect, useRef } from 'react';
import { ChatMessage, Transaction, Product, Customer, DebtRecord, StockMovement } from '../types';
import { getTransactions, getProducts, getCustomers, getDebts, getStockMovements, generateId } from '../store';
import { getAIResponse } from '../utils/aiAssistant';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const greeting: ChatMessage = {
      id: generateId(), role: 'assistant',
      content: '🤖 Halo! Saya AI Assistant pembukuan bisnis Anda.\n\nSaya bisa membantu menganalisis penjualan, memberikan tips, dan menjawab pertanyaan tentang bisnis Anda.\n\nKetik pertanyaan atau gunakan tombol cepat di bawah!',
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;

    const userMessage: ChatMessage = { id: generateId(), role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const data = {
      transactions: getTransactions(),
      products: getProducts(),
      customers: getCustomers(),
      debts: getDebts(),
      stockMovements: getStockMovements(),
    };

    setTimeout(() => {
      const response = getAIResponse(msg, data);
      const assistantMessage: ChatMessage = { id: generateId(), role: 'assistant', content: response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const quickActions = [
    { label: '📊 Analisis', query: 'analisis' },
    { label: '💰 Pendapatan', query: 'total pendapatan' },
    { label: '💎 Laba', query: 'laba' },
    { label: '🏆 Terlaris', query: 'produk terlaris' },
    { label: '📦 Stok', query: 'stok' },
    { label: '💳 Hutang', query: 'hutang' },
    { label: '📅 Hari Ini', query: 'hari ini' },
    { label: '🔮 Prediksi', query: 'prediksi' },
    { label: '💡 Tips', query: 'tips' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
          <p className="text-xs text-gray-500">Analisis & rekomendasi bisnis otomatis</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {quickActions.map((action) => (
          <button key={action.query} onClick={() => handleSend(action.query)}
            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs hover:bg-indigo-100 transition-colors border border-indigo-200">
            {action.label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 mb-3 border">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'assistant' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
            }`}>
              {message.role === 'assistant' ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
              message.role === 'assistant' ? 'bg-white shadow-sm border border-gray-100' : 'bg-indigo-600 text-white'
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
              <p className={`text-[10px] mt-1 ${message.role === 'assistant' ? 'text-gray-400' : 'text-indigo-200'}`}>
                {new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white shadow-sm border rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ketik pertanyaan tentang bisnis Anda..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        <button onClick={() => handleSend()} className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition shadow-md">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
