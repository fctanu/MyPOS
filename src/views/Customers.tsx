import React from 'react';
import { Search, Filter, Plus, User, Mail, Phone, MoreVertical, Star, TrendingUp } from 'lucide-react';

export default function Customers() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Customers</h2>
          <p className="text-slate-500 text-sm">Manage your customer relationships and loyalty programs.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Customers</p>
            <h3 className="text-2xl font-extrabold text-slate-900">1,248</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Active Members</p>
            <h3 className="text-2xl font-extrabold text-slate-900">892</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Avg. Spend</p>
            <h3 className="text-2xl font-extrabold text-slate-900">Rp 450k</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold bg-slate-50">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Budi Santoso', email: 'budi.santoso@email.com', phone: '+62 812-3456-7890', status: 'Gold', spent: 'Rp 12,500,000', color: 'amber' },
                { name: 'Siti Aminah', email: 'siti.aminah@email.com', phone: '+62 813-4567-8901', status: 'Silver', spent: 'Rp 5,200,000', color: 'slate' },
                { name: 'Andi Wijaya', email: 'andi.wijaya@email.com', phone: '+62 814-5678-9012', status: 'Platinum', spent: 'Rp 28,400,000', color: 'purple' },
              ].map((cust, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {cust.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{cust.name}</p>
                        <p className="text-xs text-slate-500">ID: CUST-{1000 + i}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {cust.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {cust.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-${cust.color}-100 text-${cust.color}-700`}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{cust.spent}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
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
