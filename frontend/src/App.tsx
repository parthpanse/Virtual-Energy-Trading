import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from '@arco-design/web-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Bidding from './pages/Bidding';
import Orders from './pages/Orders';
import PnL from './pages/PnL';
import './App.css';

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bidding" element={<Bidding />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/pnl" element={<PnL />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
