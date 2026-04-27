import React, { useState, useEffect } from 'react';
import { Type, Save, Package, Smartphone, AlertCircle, Loader2 } from 'lucide-react';

export default function ContentEditor({ projectPath }) {
  const [config, setConfig] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // 1. Load the data when the component mounts
  useEffect(() => {
    async function loadConfig() {
      if (!projectPath) return;
      try {
        const res = await window.electronAPI.invoke('read-config', projectPath);
        if (res.success) {
          setConfig(res.data);
        } else {
          setError(res.error || "Config file not found");
        }
      } catch (error) {
        console.error("Failed to load config:", error);
        setError("Failed to communicate with system");
      }
    }
    loadConfig();
  }, [projectPath]);

  // 2. Save the data back to the local Vite project
  const handleSave = async () => {
    if (!projectPath) return;
    setIsSaving(true);
    try {
      const res = await window.electronAPI.invoke('save-config', projectPath, config);
      if (res.success) {
        // Optional: Trigger a toast notification here
      } else {
        setError("Failed to save changes");
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      setError("Failed to communicate with system");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Helper to update product arrays
  const updateProduct = (index, field, value) => {
    const updatedProducts = [...config.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setConfig({ ...config, products: updatedProducts });
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-brand-darker">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-50" />
        <h3 className="text-white font-bold mb-2">Editor Error</h3>
        <p className="text-gray-500 text-sm max-w-xs">{error}</p>
        <p className="text-xs text-gray-600 mt-4">Make sure your project has a src/data/config.json file.</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-brand-darker p-8 text-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-4" />
        <div className="text-gray-400 text-sm font-medium">Loading catalog data...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-brand-darker">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-brand-darker/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-white">3. Content Editor</h2>
          <p className="text-xs text-gray-500">Edit your website data in real-time</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-gold hover:bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-brand-gold/10 disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Shop Info Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-brand-gold/10 rounded-lg">
              <Type className="w-4 h-4 text-brand-gold" />
            </div>
            <h3 className="text-white font-semibold text-sm">Store Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Shop Name</label>
              <input 
                type="text"
                className="bg-brand-dark border border-gray-800 text-white px-4 py-2.5 rounded-xl w-full text-sm focus:outline-none focus:border-brand-gold transition-colors"
                value={config.shopName || ''}
                onChange={(e) => setConfig({ ...config, shopName: e.target.value })}
                placeholder="e.g. AVSR Saravanaa"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">WhatsApp Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                <input 
                  type="text"
                  className="bg-brand-dark border border-gray-800 text-white pl-10 pr-4 py-2.5 rounded-xl w-full text-sm focus:outline-none focus:border-brand-gold transition-colors"
                  value={config.whatsapp || ''}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  placeholder="e.g. 919876543210"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-gold/10 rounded-lg">
                <Package className="w-4 h-4 text-brand-gold" />
              </div>
              <h3 className="text-white font-semibold text-sm">Product Catalog</h3>
            </div>
            <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded-full font-mono border border-gray-800">
              {config.products?.length || 0} ITEMS
            </span>
          </div>
          
          <div className="space-y-3">
            {config.products?.map((product, index) => (
              <div key={index} className="bg-brand-dark p-4 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-600 uppercase font-bold">Product Name</label>
                    <input 
                      className="bg-transparent text-white border-b border-gray-800 hover:border-gray-700 focus:border-brand-gold p-1 w-full text-sm transition-colors outline-none"
                      value={product.name || ''}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-600 uppercase font-bold">Weight / Size</label>
                      <input 
                        className="bg-transparent text-gray-400 border-b border-gray-800 hover:border-gray-700 focus:border-brand-gold p-1 w-full text-xs transition-colors outline-none"
                        value={product.weight || ''}
                        onChange={(e) => updateProduct(index, 'weight', e.target.value)}
                        placeholder="Weight"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-600 uppercase font-bold">Price</label>
                      <input 
                        className="bg-transparent text-brand-gold font-mono border-b border-gray-800 hover:border-gray-700 focus:border-brand-gold p-1 w-full text-xs transition-colors outline-none"
                        value={product.price || ''}
                        onChange={(e) => updateProduct(index, 'price', e.target.value)}
                        placeholder="Price"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
