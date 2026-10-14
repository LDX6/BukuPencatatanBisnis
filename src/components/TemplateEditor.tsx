import { useState, useEffect } from 'react';
import { TemplateSettings } from '../types';
import { getTemplateSettings, saveTemplateSettings, getProfile } from '../store';
import { Save, Eye, RotateCcw, FileText, Receipt, Tag, FileBarChart, CreditCard, Download, Palette } from 'lucide-react';

export default function TemplateEditor() {
  const [settings, setSettings] = useState<TemplateSettings>(getTemplateSettings());
  const [activeTab, setActiveTab] = useState<'receipt' | 'invoice' | 'report' | 'label' | 'debt' | 'export'>('receipt');
  const [showPreview, setShowPreview] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const profile = getProfile();

  const handleSave = () => {
    saveTemplateSettings(settings);
    alert('✅ Template berhasil disimpan!');
  };

  const handleReset = () => {
    if (confirm('Reset template ke pengaturan default?')) {
      localStorage.removeItem('bukukas_template_settings');
      setSettings(getTemplateSettings());
    }
  };

  // Preset templates
  const presets = {
    minimalist: {
      name: '🎯 Minimalis',
      description: 'Bersih dan sederhana',
      apply: () => {
        setSettings({
          ...settings,
          receipt: {
            ...settings.receipt,
            showLogo: false,
            showAddress: false,
            showPhone: false,
            showCashierName: false,
            showItemSKU: false,
            showBarcode: false,
            separator: 'none',
            thankYouMessage: 'Terima kasih!',
          },
          invoice: {
            ...settings.invoice,
            theme: 'minimal',
            primaryColor: '#1f2937',
            secondaryColor: '#6b7280',
          },
        });
      }
    },
    professional: {
      name: '💼 Profesional',
      description: 'Lengkap dan formal',
      apply: () => {
        setSettings({
          ...settings,
          receipt: {
            ...settings.receipt,
            showLogo: true,
            showBusinessName: true,
            showAddress: true,
            showPhone: true,
            showDate: true,
            showInvoiceNumber: true,
            showCashierName: true,
            showCustomerName: true,
            showItemSKU: true,
            showItemPrice: true,
            showSubtotal: true,
            showDiscount: true,
            showTax: true,
            showPaymentMethod: true,
            showChange: true,
            showItemCount: true,
            showBarcode: true,
            separator: 'line',
            thankYouMessage: 'Terima kasih atas kepercayaan Anda. Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.',
          },
          invoice: {
            ...settings.invoice,
            theme: 'professional',
            showLogo: true,
            showBusinessInfo: true,
            showCustomerInfo: true,
            showPaymentTerms: true,
            showDueDate: true,
            showNotes: true,
            showSubtotal: true,
            showTax: true,
            showDiscount: true,
            showGrandTotal: true,
            showSignature: true,
            primaryColor: '#1e40af',
            secondaryColor: '#3b82f6',
          },
        });
      }
    },
    modern: {
      name: '✨ Modern',
      description: 'Warna-warni dan menarik',
      apply: () => {
        setSettings({
          ...settings,
          receipt: {
            ...settings.receipt,
            showLogo: true,
            showBusinessName: true,
            showAddress: false,
            showPhone: true,
            separator: 'dash',
            thankYouMessage: '🎉 Terima kasih! Jangan lupa follow IG kami @toko_kamu',
          },
          invoice: {
            ...settings.invoice,
            theme: 'colorful',
            primaryColor: '#8b5cf6',
            secondaryColor: '#ec4899',
          },
          productLabel: {
            ...settings.productLabel,
            labelShape: 'rounded',
            backgroundColor: '#f3f4f6',
            borderColor: '#8b5cf6',
            textColor: '#1f2937',
          },
        });
      }
    },
    thermal: {
      name: '🖨️ Thermal Printer',
      description: 'Optimized untuk printer thermal',
      apply: () => {
        setSettings({
          ...settings,
          receipt: {
            ...settings.receipt,
            paperSize: '58mm',
            fontSize: 'small',
            alignment: 'center',
            showLogo: false,
            showAddress: false,
            showItemSKU: false,
            showBarcode: false,
            separator: 'dash',
            thankYouMessage: 'Thank you!',
          },
        });
      }
    },
  };



  const tabs = [
    { id: 'receipt' as const, label: 'Struk', icon: Receipt, color: 'from-blue-500 to-cyan-500' },
    { id: 'invoice' as const, label: 'Invoice', icon: FileText, color: 'from-purple-500 to-pink-500' },
    { id: 'report' as const, label: 'Laporan', icon: FileBarChart, color: 'from-emerald-500 to-teal-500' },
    { id: 'label' as const, label: 'Label Produk', icon: Tag, color: 'from-amber-500 to-orange-500' },
    { id: 'debt' as const, label: 'Nota Hutang', icon: CreditCard, color: 'from-red-500 to-rose-500' },
    { id: 'export' as const, label: 'Export', icon: Download, color: 'from-indigo-500 to-violet-500' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🎨 Editor Template</h2>
          <p className="text-sm text-gray-500">Kustomisasi semua template pembukuan</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowPresets(!showPresets)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition shadow-md">
            <Palette className="w-4 h-4" /> Preset
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
            <Eye className="w-4 h-4" /> {showPreview ? 'Tutup Preview' : 'Preview'}
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">
            <Save className="w-4 h-4" /> Simpan
          </button>
        </div>
      </div>

      {/* Presets Panel */}
      {showPresets && (
        <div className="bg-white rounded-xl shadow-md p-5 animate-fade-in">
          <h3 className="font-bold text-gray-800 text-lg mb-4">⚡ Pilih Preset Template</h3>
          <p className="text-sm text-gray-500 mb-4">Pilih preset untuk quick setup. Anda masih bisa mengedit setelahnya.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => { preset.apply(); setShowPresets(false); }}
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-indigo-300"
              >
                <div className="text-2xl mb-2">{preset.name.split(' ')[0]}</div>
                <div className="font-semibold text-gray-800">{preset.name.split(' ').slice(1).join(' ')}</div>
                <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Settings Panel */}
        <div className="bg-white rounded-xl shadow-md p-5 space-y-4">
          {/* Receipt Template */}
          {activeTab === 'receipt' && (
            <>
              <h3 className="font-bold text-gray-800 text-lg">🧾 Template Struk/Receipt</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Header (di atas struk)</label>
                  <textarea
                    value={settings.receipt.header}
                    onChange={(e) => setSettings({...settings, receipt: {...settings.receipt, header: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                    placeholder="Contoh: Selamat datang di toko kami!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pesan Terima Kasih</label>
                  <input
                    type="text"
                    value={settings.receipt.thankYouMessage}
                    onChange={(e) => setSettings({...settings, receipt: {...settings.receipt, thankYouMessage: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer (di bawah struk)</label>
                  <textarea
                    value={settings.receipt.footer}
                    onChange={(e) => setSettings({...settings, receipt: {...settings.receipt, footer: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                    placeholder="Contoh: Barang yang sudah dibeli tidak dapat dikembalikan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Kertas</label>
                    <select
                      value={settings.receipt.paperSize}
                      onChange={(e) => setSettings({...settings, receipt: {...settings.receipt, paperSize: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="58mm">58mm (Kecil)</option>
                      <option value="80mm">80mm (Standar)</option>
                      <option value="A4">A4</option>
                      <option value="A5">A5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Font</label>
                    <select
                      value={settings.receipt.fontSize}
                      onChange={(e) => setSettings({...settings, receipt: {...settings.receipt, fontSize: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="small">Kecil</option>
                      <option value="medium">Sedang</option>
                      <option value="large">Besar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Perataan</label>
                    <select
                      value={settings.receipt.alignment}
                      onChange={(e) => setSettings({...settings, receipt: {...settings.receipt, alignment: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="left">Kiri</option>
                      <option value="center">Tengah</option>
                      <option value="right">Kanan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
                    <select
                      value={settings.receipt.separator}
                      onChange={(e) => setSettings({...settings, receipt: {...settings.receipt, separator: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="dash">Garis Putus (-)</option>
                      <option value="line">Garis Solid (─)</option>
                      <option value="none">Tanpa Garis</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tampilkan Informasi:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'showLogo', label: 'Logo' },
                      { key: 'showBusinessName', label: 'Nama Toko' },
                      { key: 'showAddress', label: 'Alamat' },
                      { key: 'showPhone', label: 'No. Telepon' },
                      { key: 'showDate', label: 'Tanggal' },
                      { key: 'showInvoiceNumber', label: 'No. Invoice' },
                      { key: 'showCashierName', label: 'Nama Kasir' },
                      { key: 'showCustomerName', label: 'Nama Pelanggan' },
                      { key: 'showItemSKU', label: 'SKU Produk' },
                      { key: 'showItemPrice', label: 'Harga Item' },
                      { key: 'showSubtotal', label: 'Subtotal' },
                      { key: 'showDiscount', label: 'Diskon' },
                      { key: 'showTax', label: 'Pajak' },
                      { key: 'showPaymentMethod', label: 'Metode Bayar' },
                      { key: 'showChange', label: 'Kembalian' },
                      { key: 'showItemCount', label: 'Jumlah Item' },
                      { key: 'showBarcode', label: 'Barcode' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(settings.receipt as any)[item.key]}
                          onChange={(e) => setSettings({
                            ...settings,
                            receipt: { ...settings.receipt, [item.key]: e.target.checked }
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Invoice Template */}
          {activeTab === 'invoice' && (
            <>
              <h3 className="font-bold text-gray-800 text-lg">📄 Template Invoice</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Invoice</label>
                  <input
                    type="text"
                    value={settings.invoice.title}
                    onChange={(e) => setSettings({...settings, invoice: {...settings.invoice, title: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Header</label>
                  <textarea
                    value={settings.invoice.header}
                    onChange={(e) => setSettings({...settings, invoice: {...settings.invoice, header: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer</label>
                  <textarea
                    value={settings.invoice.footer}
                    onChange={(e) => setSettings({...settings, invoice: {...settings.invoice, footer: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                    <select
                      value={settings.invoice.theme}
                      onChange={(e) => setSettings({...settings, invoice: {...settings.invoice, theme: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="professional">Profesional</option>
                      <option value="modern">Modern</option>
                      <option value="minimal">Minimal</option>
                      <option value="colorful">Colorful</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Syarat Pembayaran</label>
                    <input
                      type="text"
                      value={settings.invoice.paymentTerms}
                      onChange={(e) => setSettings({...settings, invoice: {...settings.invoice, paymentTerms: e.target.value}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                      placeholder="Net 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Utama</label>
                    <input
                      type="color"
                      value={settings.invoice.primaryColor}
                      onChange={(e) => setSettings({...settings, invoice: {...settings.invoice, primaryColor: e.target.value}})}
                      className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Sekunder</label>
                    <input
                      type="color"
                      value={settings.invoice.secondaryColor}
                      onChange={(e) => setSettings({...settings, invoice: {...settings.invoice, secondaryColor: e.target.value}})}
                      className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={settings.invoice.notes}
                    onChange={(e) => setSettings({...settings, invoice: {...settings.invoice, notes: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tanda Tangan</label>
                  <input
                    type="text"
                    value={settings.invoice.signatureTitle}
                    onChange={(e) => setSettings({...settings, invoice: {...settings.invoice, signatureTitle: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tampilkan Informasi:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'showLogo', label: 'Logo' },
                      { key: 'showBusinessInfo', label: 'Info Bisnis' },
                      { key: 'showCustomerInfo', label: 'Info Pelanggan' },
                      { key: 'showPaymentTerms', label: 'Syarat Bayar' },
                      { key: 'showDueDate', label: 'Jatuh Tempo' },
                      { key: 'showNotes', label: 'Catatan' },
                      { key: 'showSubtotal', label: 'Subtotal' },
                      { key: 'showTax', label: 'Pajak' },
                      { key: 'showDiscount', label: 'Diskon' },
                      { key: 'showShippingCost', label: 'Ongkir' },
                      { key: 'showGrandTotal', label: 'Total' },
                      { key: 'showSignature', label: 'Tanda Tangan' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(settings.invoice as any)[item.key]}
                          onChange={(e) => setSettings({
                            ...settings,
                            invoice: { ...settings.invoice, [item.key]: e.target.checked }
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Report Template */}
          {activeTab === 'report' && (
            <>
              <h3 className="font-bold text-gray-800 text-lg">📊 Template Laporan</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan</label>
                  <input
                    type="text"
                    value={settings.report.title}
                    onChange={(e) => setSettings({...settings, report: {...settings.report, title: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Header</label>
                  <textarea
                    value={settings.report.header}
                    onChange={(e) => setSettings({...settings, report: {...settings.report, header: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer</label>
                  <textarea
                    value={settings.report.footer}
                    onChange={(e) => setSettings({...settings, report: {...settings.report, footer: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                    <select
                      value={settings.report.theme}
                      onChange={(e) => setSettings({...settings, report: {...settings.report, theme: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="professional">Profesional</option>
                      <option value="modern">Modern</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Utama</label>
                    <input
                      type="color"
                      value={settings.report.primaryColor}
                      onChange={(e) => setSettings({...settings, report: {...settings.report, primaryColor: e.target.value}})}
                      className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format Tanggal</label>
                    <select
                      value={settings.report.dateFormat}
                      onChange={(e) => setSettings({...settings, report: {...settings.report, dateFormat: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                      <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format Mata Uang</label>
                    <select
                      value={settings.report.currencyFormat}
                      onChange={(e) => setSettings({...settings, report: {...settings.report, currencyFormat: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="symbol">Simbol (Rp)</option>
                      <option value="code">Kode (IDR)</option>
                      <option value="full">Lengkap (Rupiah)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tampilkan Bagian:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'showLogo', label: 'Logo' },
                      { key: 'showBusinessInfo', label: 'Info Bisnis' },
                      { key: 'showPeriod', label: 'Periode' },
                      { key: 'showSummary', label: 'Ringkasan' },
                      { key: 'showDailyBreakdown', label: 'Detail Harian' },
                      { key: 'showProductBreakdown', label: 'Detail Produk' },
                      { key: 'showPaymentBreakdown', label: 'Detail Pembayaran' },
                      { key: 'showProfitLoss', label: 'Laba Rugi' },
                      { key: 'showCharts', label: 'Grafik' },
                      { key: 'showRecommendations', label: 'Rekomendasi' },
                      { key: 'includeGraphs', label: 'Include Graphs' },
                      { key: 'includeTables', label: 'Include Tables' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(settings.report as any)[item.key]}
                          onChange={(e) => setSettings({
                            ...settings,
                            report: { ...settings.report, [item.key]: e.target.checked }
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Product Label Template */}
          {activeTab === 'label' && (
            <>
              <h3 className="font-bold text-gray-800 text-lg">🏷️ Template Label Produk</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Label</label>
                    <select
                      value={settings.productLabel.labelSize}
                      onChange={(e) => setSettings({...settings, productLabel: {...settings.productLabel, labelSize: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="small">Kecil</option>
                      <option value="medium">Sedang</option>
                      <option value="large">Besar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bentuk Label</label>
                    <select
                      value={settings.productLabel.labelShape}
                      onChange={(e) => setSettings({...settings, productLabel: {...settings.productLabel, labelShape: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="rectangle">Persegi</option>
                      <option value="rounded">Rounded</option>
                      <option value="circle">Lingkaran</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Font</label>
                    <select
                      value={settings.productLabel.fontSize}
                      onChange={(e) => setSettings({...settings, productLabel: {...settings.productLabel, fontSize: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="small">Kecil</option>
                      <option value="medium">Sedang</option>
                      <option value="large">Besar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Border</label>
                    <input
                      type="color"
                      value={settings.productLabel.borderColor}
                      onChange={(e) => setSettings({...settings, productLabel: {...settings.productLabel, borderColor: e.target.value}})}
                      className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Background</label>
                    <input
                      type="color"
                      value={settings.productLabel.backgroundColor}
                      onChange={(e) => setSettings({...settings, productLabel: {...settings.productLabel, backgroundColor: e.target.value}})}
                      className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Text</label>
                    <input
                      type="color"
                      value={settings.productLabel.textColor}
                      onChange={(e) => setSettings({...settings, productLabel: {...settings.productLabel, textColor: e.target.value}})}
                      className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tampilkan Informasi:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'showName', label: 'Nama Produk' },
                      { key: 'showPrice', label: 'Harga' },
                      { key: 'showSKU', label: 'SKU' },
                      { key: 'showBarcode', label: 'Barcode' },
                      { key: 'showCategory', label: 'Kategori' },
                      { key: 'showWeight', label: 'Berat' },
                      { key: 'showExpiryDate', label: 'Tanggal Kadaluarsa' },
                      { key: 'showBusinessName', label: 'Nama Toko' },
                      { key: 'showBorder', label: 'Border' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(settings.productLabel as any)[item.key]}
                          onChange={(e) => setSettings({
                            ...settings,
                            productLabel: { ...settings.productLabel, [item.key]: e.target.checked }
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Debt Note Template */}
          {activeTab === 'debt' && (
            <>
              <h3 className="font-bold text-gray-800 text-lg">💳 Template Nota Hutang</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input
                    type="text"
                    value={settings.debtNote.title}
                    onChange={(e) => setSettings({...settings, debtNote: {...settings.debtNote, title: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Header</label>
                  <textarea
                    value={settings.debtNote.header}
                    onChange={(e) => setSettings({...settings, debtNote: {...settings.debtNote, header: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer</label>
                  <textarea
                    value={settings.debtNote.footer}
                    onChange={(e) => setSettings({...settings, debtNote: {...settings.debtNote, footer: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klausul Perjanjian</label>
                  <textarea
                    value={settings.debtNote.terms}
                    onChange={(e) => setSettings({...settings, debtNote: {...settings.debtNote, terms: e.target.value}})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                    <select
                      value={settings.debtNote.theme}
                      onChange={(e) => setSettings({...settings, debtNote: {...settings.debtNote, theme: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="formal">Formal</option>
                      <option value="simple">Sederhana</option>
                      <option value="detailed">Detail</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tanda Tangan</label>
                    <input
                      type="text"
                      value={settings.debtNote.signatureTitle}
                      onChange={(e) => setSettings({...settings, debtNote: {...settings.debtNote, signatureTitle: e.target.value}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Saksi</label>
                    <input
                      type="text"
                      value={settings.debtNote.witnessTitle}
                      onChange={(e) => setSettings({...settings, debtNote: {...settings.debtNote, witnessTitle: e.target.value}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tampilkan Informasi:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'showLogo', label: 'Logo' },
                      { key: 'showBusinessInfo', label: 'Info Bisnis' },
                      { key: 'showDebtorInfo', label: 'Info Debitur' },
                      { key: 'showAmount', label: 'Jumlah' },
                      { key: 'showDueDate', label: 'Jatuh Tempo' },
                      { key: 'showPaymentSchedule', label: 'Jadwal Bayar' },
                      { key: 'showSignature', label: 'Tanda Tangan' },
                      { key: 'showWitness', label: 'Saksi' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(settings.debtNote as any)[item.key]}
                          onChange={(e) => setSettings({
                            ...settings,
                            debtNote: { ...settings.debtNote, [item.key]: e.target.checked }
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Export Template */}
          {activeTab === 'export' && (
            <>
              <h3 className="font-bold text-gray-800 text-lg">💾 Template Export Data</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                    <select
                      value={settings.export.format}
                      onChange={(e) => setSettings({...settings, export: {...settings.export, format: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
                    <select
                      value={settings.export.separator}
                      onChange={(e) => setSettings({...settings, export: {...settings.export, separator: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value=",">Koma (,)</option>
                      <option value=";">Titik Koma (;)</option>
                      <option value="\t">Tab</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format Tanggal</label>
                    <select
                      value={settings.export.dateFormat}
                      onChange={(e) => setSettings({...settings, export: {...settings.export, dateFormat: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                      <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format Mata Uang</label>
                    <select
                      value={settings.export.currencyFormat}
                      onChange={(e) => setSettings({...settings, export: {...settings.export, currencyFormat: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="symbol">Simbol (Rp)</option>
                      <option value="code">Kode (IDR)</option>
                      <option value="full">Lengkap (Rupiah)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Encoding</label>
                    <select
                      value={settings.export.encoding}
                      onChange={(e) => setSettings({...settings, export: {...settings.export, encoding: e.target.value as any}})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="UTF-8">UTF-8</option>
                      <option value="ISO-8859-1">ISO-8859-1</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Include:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'includeHeader', label: 'Header' },
                      { key: 'includeFooter', label: 'Footer' },
                      { key: 'includeSummary', label: 'Ringkasan' },
                      { key: 'includeCharts', label: 'Grafik' },
                      { key: 'includeBOM', label: 'BOM (Byte Order Mark)' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(settings.export as any)[item.key]}
                          onChange={(e) => setSettings({
                            ...settings,
                            export: { ...settings.export, [item.key]: e.target.checked }
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="font-bold text-gray-800 text-lg mb-4">👁️ Preview Template</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              {activeTab === 'receipt' && (
                <div className="font-mono text-xs space-y-2" style={{ textAlign: settings.receipt.alignment as any }}>
                  {settings.receipt.showLogo && profile.logo && <img src={profile.logo} alt="" className="w-16 h-16 mx-auto object-contain" />}
                  {settings.receipt.showBusinessName && <div className="font-bold">{profile.name}</div>}
                  {settings.receipt.showAddress && profile.address && <div>{profile.address}</div>}
                  {settings.receipt.showPhone && profile.phone && <div>Telp: {profile.phone}</div>}
                  {settings.receipt.header && <div className="mt-2">{settings.receipt.header}</div>}
                  {settings.receipt.separator !== 'none' && <div>{settings.receipt.separator === 'dash' ? '------------------------' : '────────────────────────'}</div>}
                  {settings.receipt.showInvoiceNumber && <div>No: INV-20240101-0001</div>}
                  {settings.receipt.showDate && <div>Tgl: 01/01/2024 10:30</div>}
                  {settings.receipt.showCustomerName && <div>Pelanggan: Budi</div>}
                  {settings.receipt.separator !== 'none' && <div>{settings.receipt.separator === 'dash' ? '------------------------' : '────────────────────────'}</div>}
                  <div>Kopi Susu x2</div>
                  {settings.receipt.showItemPrice && <div className="text-right">Rp 30.000</div>}
                  <div>Nasi Goreng x1</div>
                  {settings.receipt.showItemPrice && <div className="text-right">Rp 15.000</div>}
                  {settings.receipt.separator !== 'none' && <div>{settings.receipt.separator === 'dash' ? '------------------------' : '────────────────────────'}</div>}
                  {settings.receipt.showSubtotal && <div className="flex justify-between"><span>Subtotal:</span><span>Rp 45.000</span></div>}
                  {settings.receipt.showDiscount && <div className="flex justify-between"><span>Diskon:</span><span>-Rp 5.000</span></div>}
                  {settings.receipt.showTax && <div className="flex justify-between"><span>Pajak:</span><span>Rp 0</span></div>}
                  <div className="flex justify-between font-bold"><span>TOTAL:</span><span>Rp 40.000</span></div>
                  {settings.receipt.showPaymentMethod && <div>Tunai: Rp 50.000</div>}
                  {settings.receipt.showChange && <div>Kembali: Rp 10.000</div>}
                  {settings.receipt.separator !== 'none' && <div>{settings.receipt.separator === 'dash' ? '------------------------' : '────────────────────────'}</div>}
                  <div className="mt-2">{settings.receipt.thankYouMessage}</div>
                  {settings.receipt.footer && <div className="mt-2">{settings.receipt.footer}</div>}
                </div>
              )}

              {activeTab === 'invoice' && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start border-b pb-3" style={{ borderColor: settings.invoice.primaryColor }}>
                    <div>
                      {settings.invoice.showLogo && profile.logo && <img src={profile.logo} alt="" className="w-20 h-20 object-contain mb-2" />}
                      {settings.invoice.showBusinessInfo && (
                        <div>
                          <div className="font-bold text-lg" style={{ color: settings.invoice.primaryColor }}>{profile.name}</div>
                          <div className="text-xs text-gray-600">{profile.address}</div>
                          <div className="text-xs text-gray-600">{profile.phone}</div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: settings.invoice.primaryColor }}>{settings.invoice.title}</div>
                      <div className="text-xs">No: INV-20240101-0001</div>
                      <div className="text-xs">Tanggal: 01/01/2024</div>
                    </div>
                  </div>
                  {settings.invoice.showCustomerInfo && (
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Kepada:</div>
                      <div className="font-medium">Budi Santoso</div>
                      <div className="text-xs">Jl. Contoh No. 123</div>
                    </div>
                  )}
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor: settings.invoice.primaryColor, color: 'white' }}>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Harga</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Kopi Susu</td>
                        <td className="p-2 text-center">2</td>
                        <td className="p-2 text-right">Rp 15.000</td>
                        <td className="p-2 text-right">Rp 30.000</td>
                      </tr>
                    </tbody>
                  </table>
                  {settings.invoice.showGrandTotal && (
                    <div className="text-right font-bold text-lg" style={{ color: settings.invoice.primaryColor }}>
                      Total: Rp 30.000
                    </div>
                  )}
                  {settings.invoice.footer && <div className="text-xs text-gray-500 border-t pt-2">{settings.invoice.footer}</div>}
                </div>
              )}

              {activeTab === 'label' && (
                <div
                  className="p-3 text-center"
                  style={{
                    backgroundColor: settings.productLabel.backgroundColor,
                    color: settings.productLabel.textColor,
                    border: settings.productLabel.showBorder ? `2px solid ${settings.productLabel.borderColor}` : 'none',
                    borderRadius: settings.productLabel.labelShape === 'rounded' ? '8px' : settings.productLabel.labelShape === 'circle' ? '50%' : '0',
                  }}
                >
                  {settings.productLabel.showName && <div className="font-bold">Kopi Susu</div>}
                  {settings.productLabel.showPrice && <div className="text-lg font-bold">Rp 15.000</div>}
                  {settings.productLabel.showSKU && <div className="text-xs">SKU: KPS001</div>}
                  {settings.productLabel.showBarcode && <div className="text-xs mt-1">||||| |||| |||||</div>}
                </div>
              )}

              {(activeTab === 'report' || activeTab === 'debt' || activeTab === 'export') && (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Preview untuk template ini akan ditampilkan saat digunakan</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
