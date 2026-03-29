import React from 'react';
import { Download, PlusCircle, Filter, MoreVertical, Droplet, Wheat, Package as PkgIcon } from 'lucide-react';

export default function Inventory() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor stock levels and manage inventory updates in real time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Adjust Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-600">
          <p className="text-sm font-medium text-slate-500 mb-2">Total Products</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">284</span>
            <span className="text-xs text-green-600 font-medium">+4 this week</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-slate-500 mb-2">Low Stock Items</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">12</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-slate-500 mb-2">Out of Stock</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-600">4</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-sky-400">
          <p className="text-sm font-medium text-slate-500 mb-2">Stock Updated Today</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">18</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900">Product Inventory</h3>
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500"><Filter className="w-5 h-5" /></button>
              <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Current Stock</th>
                  <th className="px-6 py-4 text-center">Min Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Cooking Oil 1L', sku: 'SKU-101', cat: 'Oil', stock: 8, min: 10, status: 'LOW', color: 'amber', icon: Droplet },
                  { name: 'Rice 5kg', sku: 'SKU-001', cat: 'Rice', stock: 45, min: 10, status: 'IN STOCK', color: 'green', icon: Wheat },
                  { name: 'Sugar 1kg', sku: 'SKU-202', cat: 'Groceries', stock: 0, min: 5, status: 'OUT OF STOCK', color: 'red', icon: PkgIcon },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.sku}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700">{item.cat}</span></td>
                      <td className={`px-6 py-4 text-center font-bold text-${item.color}-600`}>{item.stock}</td>
                      <td className="px-6 py-4 text-center text-slate-500">{item.min}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-${item.color}-50 text-${item.color}-700 border border-${item.color}-200`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-${item.color}-500`}></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 font-bold text-xs hover:underline uppercase tracking-tight">Adjust</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[400px]">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 mb-1">Recent Movement</h3>
            <p className="text-xs text-slate-500">Real-time inventory logs</p>
          </div>
          <div className="flex-1 p-6 space-y-6">
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-50 z-10"></div>
                <div className="w-0.5 h-full bg-slate-100 absolute top-2 bottom-0"></div>
              </div>
              <div className="flex-1 pb-6">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">12:30 PM</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-600">Sale</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">Rice 5kg</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-red-600">-3 units</span>
                  <span className="text-[10px] text-slate-500">Stock: 20</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-50 z-10"></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">14:10 PM</span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-semibold">Restock</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">Sugar 1kg</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-green-600">+10 units</span>
                  <span className="text-[10px] text-slate-500">Stock: 50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
