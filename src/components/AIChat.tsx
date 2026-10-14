import { useState, useEffect, useRef } from 'react';
import { ChatMessage, Transaction, Product } from '../types';
import { getTransactions, getProducts, generateId } from '../store';
import { getAIResponse } from '../aiAssistant';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTransactions(getTransactions());
    setProducts(getProducts());

    // Initial greeting
    const greeting: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '🤖 Halo! Saya AI Assistant pembukuan bisnis Anda. Saya siap membantu menganalisis penjualan, memberikan tips, dan menjawab pertanyaan tentang bisnis Anda.\n\nSilakan ketik pertanyaan atau perintah seperti:\n• "analisis" - untuk analisis lengkap\n• "total pendapatan" - untuk melihat total\n• "produk terlaris" - untuk melihat produk laris\n• "tips" - untuk tips bisnis',
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Get AI response
    const aiResponse = getAIResponse(input, transactions, products);
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    };

    setTimeout(() => {
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: '📊 Analisis', query: 'analisis' },
    { label: '💰 Total', query: 'total pendapatan' },
    { label: '🏆 Terlaris', query: 'produk terlaris' },
    { label: '⚠️ Stok', query: 'stok' },
    { label: '📅 Hari Ini', query: 'hari ini' },
    { label: '💡 Tips', query: 'tips' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
          <p className="text-sm text-gray-500">Tanya apa saja tentang bisnis Anda</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickActions.map((action) => (
          <button
            key={action.query}
            onClick={() => {
              setInput(action.query);
              setTimeout(() => {
                const userMessage: ChatMessage = {
                  id: generateId(),
                  role: 'user',
                  content: action.query,
                  timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, userMessage]);
                const aiResponse = getAIResponse(action.query, transactions, products);
                const assistantMessage: ChatMessage = {
                  id: generateId(),
                  role: 'assistant',
                  content: aiResponse,
                  timestamp: new Date().toISOString(),
                };
                setTimeout(() => {
                  setMessages(prev => [...prev, assistantMessage]);
                }, 500);
                setInput('');
              }, 100);
            }}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm hover:bg-indigo-100 transition-colors border border-indigo-200"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-gray-50 rounded-xl p-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'assistant'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
            }`}>
              {message.role === 'assistant' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'assistant'
                ? 'bg-white shadow-sm border border-gray-100'
                : 'bg-indigo-600 text-white'
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'assistant' ? 'text-gray-400' : 'text-indigo-200'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ketik pertanyaan Anda..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
