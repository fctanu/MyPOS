import React from 'react';
import { Plus, Search, Filter, Building2, Coffee, Package, Beef, Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Suppliers() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Suppliers</h1>
          <p className="text-slate-500 text-sm max-w-lg">Manage supplier data and procurement relationships to ensure your inventory chain remains uninterrupted.</p>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by supplier name or contact..." 
            className="w-full bg-slate-50 border-transparent rounded-lg py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-50 border-transparent rounded-lg py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select className="bg-slate-50 border-transparent rounded-lg py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer">
            <option>Newest First</option>
            <option>Alphabetical (A-Z)</option>
            <option>Last Purchase</option>
          </select>
          <button className="bg-slate-50 p-2.5 rounded-lg text-slate-600 hover:text-blue-600 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Supplier Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Person</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Phone & Address</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Products</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Global Harvest Co.', id: 'SUP-8829', contact: 'Elena Rodriguez', phone: '+1 (555) 012-9934', addr: '822 Industrial Way, Portland, OR', tags: ['Produce', 'Grain'], status: 'Active', icon: Building2 },
                { name: 'PureStream Beverages', id: 'SUP-4410', contact: 'Marcus Vane', phone: '+1 (555) 902-1145', addr: '45 Springs Blvd, Denver, CO', tags: ['Drinks', 'Dairy'], status: 'Active', icon: Coffee },
                { name: 'PaperPro Logistics', id: 'SUP-1102', contact: 'Sarah Jenkins', phone: '+1 (555) 233-0091', addr: '12 Warehouse Row, Chicago, IL', tags: ['Packaging'], status: 'Inactive', icon: Package },
                { name: 'Artisan Butcher Hub', id: 'SUP-9932', contact: 'David Cho', phone: '+1 (555) 771-3342', addr: '201 Market St, Austin, TX', tags: ['Meat', 'Poultry'], status: 'Active', icon: Beef },
              ].map((sup, i) => {
                const Icon = sup.icon;
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{sup.name}</p>
                          <p className="text-xs text-slate-500">ID: {sup.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{sup.contact}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{sup.phone}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">{sup.addr}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {sup.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${sup.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{sup.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-white rounded-md text-blue-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">Showing <span className="text-slate-900">1-4</span> of <span className="text-slate-900">24</span> suppliers</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-md flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center bg-blue-600 text-white font-bold text-xs">1</button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors">2</button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors">3</button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
