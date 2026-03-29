import React from 'react';
import { Calendar, Download, DollarSign, Receipt, Package, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time store performance and terminal health status.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors text-slate-700">
            <Calendar className="w-4 h-4" />
            Today: Oct 24, 2023
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12.5%</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Today's Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">Rp 2.450.000</h3>
          <p className="text-xs text-slate-400 mt-2">v.s. Rp 2.175.000 yesterday</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+8%</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Transactions</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">148</h3>
          <p className="text-xs text-slate-400 mt-2">Avg. ticket: Rp 16.554</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">Normal</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Items Sold</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">842</h3>
          <p className="text-xs text-slate-400 mt-2">Peak hour: 12:00 PM - 1:00 PM</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Yellow alert</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Low Stock Items</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">14</h3>
          <p className="text-xs text-slate-400 mt-2">Requires immediate restock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-lg text-slate-900">Sales Trends</h4>
              <p className="text-xs text-slate-500">Hourly revenue performance for current session</p>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button className="px-3 py-1 text-xs font-bold bg-white rounded shadow-sm text-blue-600">Today</button>
              <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">7D</button>
              <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">1M</button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2 border-b border-slate-100 pb-2">
            {[30, 45, 85, 70, 55, 40, 20].map((height, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t ${height === 85 ? 'bg-blue-100 border-t-2 border-blue-500' : height === 70 ? 'bg-blue-50 border-t-2 border-blue-300' : 'bg-slate-100'}`} 
                  style={{ height: `${height}%` }}
                ></div>
                <span className={`text-[10px] font-bold uppercase ${height === 85 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg text-slate-900">Top Products</h4>
            <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Rice 5kg', cat: 'Staple Goods', sold: 142, rev: 'Rp 6.8M' },
              { name: 'Cooking Oil', cat: 'Cooking Needs', sold: 98, rev: 'Rp 4.2M' },
              { name: 'Sugar', cat: 'Groceries', sold: 87, rev: 'Rp 1.1M' },
              { name: 'Instant Noodles', cat: 'Packaged', sold: 65, rev: 'Rp 325k' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{i + 1}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.cat} • {item.sold} sold</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-blue-600">{item.rev}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
