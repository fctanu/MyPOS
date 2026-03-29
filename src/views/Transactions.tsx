import React from 'react';
import { Search, UserPlus, Minus, Plus, X, Truck, ChevronRight } from 'lucide-react';

export default function Transactions() {
  return (
    <div className="flex h-[calc(100vh-64px)] -m-8 bg-slate-50 overflow-hidden">
      {/* Left Panel: Products */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-slate-100">
            <button className="px-4 py-1.5 bg-slate-100 text-blue-700 font-bold text-sm rounded-lg">All Items</button>
            <button className="px-4 py-1.5 text-slate-600 font-medium text-sm hover:bg-slate-50 rounded-lg">Apparel</button>
            <button className="px-4 py-1.5 text-slate-600 font-medium text-sm hover:bg-slate-50 rounded-lg">Footwear</button>
            <button className="px-4 py-1.5 text-slate-600 font-medium text-sm hover:bg-slate-50 rounded-lg">Accessories</button>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 pb-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { name: 'Nebula Runner X1', sku: 'FW-90', cat: 'Footwear', price: '$129.00', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200&h=200' },
              { name: 'Nordic Minimalist Watch', sku: 'AC-22', cat: 'Accessories', price: '$85.50', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200&h=200' },
              { name: 'Sonic-Pro Headphones', sku: 'EL-05', cat: 'Electronics', price: '$299.99', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200&h=200' },
              { name: 'Heritage Leather Bag', sku: 'BG-12', cat: 'Accessories', price: '$210.00', img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=200&h=200' },
            ].map((prod, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="aspect-square rounded-lg mb-4 overflow-hidden bg-slate-100">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded-full uppercase">{prod.cat}</span>
                  <span className="text-[10px] text-slate-500 font-medium">SKU: {prod.sku}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-3 truncate">{prod.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-slate-900">{prod.price}</span>
                  <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Cart */}
      <div className="w-[400px] bg-white h-full flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10 border-l border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-slate-900">Active Transaction</h2>
            <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
              <UserPlus className="w-4 h-4" />
              New Customer
            </button>
          </div>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-200 outline-none mb-4">
            <option>Sarah Williams (Tier: Gold)</option>
            <option>Guest Checkout</option>
          </select>
          <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight block">Loyalty Points</span>
              <span className="text-sm font-extrabold text-blue-900">2,450 pts</span>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Apply Points</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {[
            { name: 'Nebula Runner X1', meta: 'Size: 42 • Color: Red', qty: 1, price: '$129.00', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100&h=100' },
            { name: 'Nordic Minimalist Watch', meta: 'Material: Silver/Leather', qty: 2, price: '$171.00', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100&h=100' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <img src={item.img} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate w-32">{item.name}</p>
                  <p className="text-[10px] text-slate-500">{item.meta}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 rounded-lg px-1.5 py-1">
                  <button className="text-slate-500 hover:text-blue-600"><Minus className="w-3 h-3" /></button>
                  <span className="mx-2 text-xs font-bold w-4 text-center">{item.qty}</span>
                  <button className="text-slate-500 hover:text-blue-600"><Plus className="w-3 h-3" /></button>
                </div>
                <span className="text-sm font-bold w-14 text-right">{item.price}</span>
                <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <div className="pt-4">
            <button className="w-full border-2 border-dashed border-slate-200 py-3 rounded-xl text-slate-500 font-bold text-xs flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 transition-colors">
              <Truck className="w-4 h-4" />
              ADD DELIVERY OPTION
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-t-3xl border-t border-slate-200">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="font-bold text-slate-900">$300.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Discount (5%)</span>
              <span className="font-bold text-red-500">-$15.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Estimated Tax</span>
              <span className="font-bold text-slate-900">$22.80</span>
            </div>
            <div className="flex justify-between items-end pt-3 mt-3 border-t border-slate-200">
              <span className="text-base font-bold text-slate-900">Total Amount</span>
              <span className="text-2xl font-extrabold text-blue-700 tracking-tight">$307.80</span>
            </div>
          </div>
          <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-3">
            COMPLETE PAYMENT
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">Clear Cart</button>
            <button className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-colors">Cancel Sale</button>
          </div>
        </div>
      </div>
    </div>
  );
}
