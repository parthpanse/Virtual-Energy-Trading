import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Bidding from './pages/Bidding';
import Orders from './pages/Orders';
import PnL from './pages/PnL';
import { setApiBaseUrl } from './services/api';
import { config } from './config';

function App() {
  useEffect(() => {
    // Initialize API configuration
    const apiUrl = config.getApiUrl();
    console.log('Setting API URL to:', apiUrl);
    setApiBaseUrl(apiUrl);
  }, []);

  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bidding" element={<Bidding />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/pnl" element={<PnL />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
