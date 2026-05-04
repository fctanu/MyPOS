import React from 'react';
import { Plus, Search, Filter, Download, Receipt, Clock, CheckCircle2, DollarSign, ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react';

export default function PurchaseOrders() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Purchase Orders</h2>
          <p className="text-slate-500 text-sm">Manage supplier orders and procurement records</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          New Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+12%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Total PO</p>
          <h3 className="text-2xl font-extrabold text-slate-900">124</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Pending PO</p>
          <h3 className="text-2xl font-extrabold text-slate-900">18</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Completed PO</p>
          <h3 className="text-2xl font-extrabold text-slate-900">106</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Total Purchase Value</p>
          <h3 className="text-2xl font-extrabold text-slate-900">Rp 8,500,000</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
          <h4 className="font-bold text-lg text-slate-900">Order History</h4>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold bg-slate-50">
                <th className="px-8 py-4">PO ID</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: '#PO-2023-0891', sup: 'Global Logistics Co.', date: 'Oct 24, 2023', items: 12, total: 'Rp 1,250,000', status: 'Completed', color: 'green' },
                { id: '#PO-2023-0892', sup: 'Summit Manufacturing', date: 'Oct 25, 2023', items: 45, total: 'Rp 4,120,000', status: 'Pending', color: 'amber' },
                { id: '#PO-2023-0893', sup: 'Alpha Vision Ltd.', date: 'Oct 26, 2023', items: 8, total: 'Rp 980,000', status: 'Completed', color: 'green' },
              ].map((po, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-4 font-bold text-slate-900">{po.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{po.sup}</td>
                  <td className="px-6 py-4 text-slate-500">{po.date}</td>
                  <td className="px-6 py-4 text-slate-500">{po.items} items</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{po.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-${po.color}-100 text-${po.color}-700`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="text-blue-600 font-bold text-sm hover:underline flex items-center justify-end gap-1 w-full">
                      View <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
