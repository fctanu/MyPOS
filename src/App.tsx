/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Inventory from './views/Inventory';
import Suppliers from './views/Suppliers';
import Customers from './views/Customers';
import PurchaseOrders from './views/PurchaseOrders';
import Transactions from './views/Transactions';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'suppliers': return <Suppliers />;
      case 'customers': return <Customers />;
      case 'purchase-orders': return <PurchaseOrders />;
      case 'transactions': return <Transactions />;
      default: return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Coming Soon</h2>
            <p className="text-slate-500">This view is under construction.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
}
