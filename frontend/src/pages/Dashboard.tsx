import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './Dashboard.css';

interface DashboardStats {
  totalBids: number;
  executedContracts: number;
  currentPrice: number;
  dailyPnL: number;
}

interface PriceData {
  hour: number;
  price: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalBids: 0,
    executedContracts: 0,
    currentPrice: 0,
    dailyPnL: 0,
  });
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [dayAheadPrices, setDayAheadPrices] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load statistics
      const [bidsResponse, contractsResponse, marketResponse, dayAheadResponse, pnlResponse] = await Promise.all([
        apiService.getBids('user123'),
        apiService.getContracts({ user_id: 'user123' }),
        apiService.getRealTimePrices(),
        apiService.getDayAheadPrices(),
        apiService.getPnLSummary(new Date().toISOString().split('T')[0], 'user123'),
      ]);

      const bids = bidsResponse.data || [];
      const contracts = contractsResponse.data || [];
      const marketData = marketResponse.data?.prices || [];
      const dayAheadData = dayAheadResponse.data?.prices || [];
      const pnlData = pnlResponse.data || { total_pnl: 0 };

      // Calculate current price (latest real-time price)
      const currentPrice = marketData.length > 0 ? marketData[marketData.length - 1].price : 0;

      // Process day-ahead prices
      const dayAheadPriceMap: { [key: number]: number } = {};
      dayAheadData.forEach((item: any) => {
        if (item.data_type === 'DAY_AHEAD') {
          dayAheadPriceMap[item.hour] = item.price;
        }
      });
      setDayAheadPrices(dayAheadPriceMap);

      setStats({
        totalBids: bids.length,
        executedContracts: contracts.filter((c: any) => c.status === 'ACTIVE').length,
        currentPrice,
        dailyPnL: pnlData.total_pnl || 0,
      });

      // Prepare price chart data
      const chartData = marketData.slice(-24).map((item: any) => ({
        hour: item.hour,
        price: item.price,
      }));
      setPriceData(chartData);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const handleTriggerClearing = async () => {
    try {
      // Use today's date for clearing
      const today = new Date().toISOString().split('T')[0];
      await apiService.triggerClearing(today);
      alert('Market clearing triggered successfully!');
      loadDashboardData(); // Refresh data
    } catch (err: any) {
      alert('Failed to trigger clearing: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleCheckPnL = () => {
    navigate('/pnl');
  };

  if (loading && stats.totalBids === 0) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalBids}</div>
            <div className="stat-label">Total Bids Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.executedContracts}</div>
            <div className="stat-label">Executed Contracts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">${stats.currentPrice.toFixed(2)}</div>
            <div className="stat-label">Current RT Price</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className={`stat-value ${stats.dailyPnL >= 0 ? 'positive' : 'negative'}`}>
              ${stats.dailyPnL.toFixed(2)}
            </div>
            <div className="stat-label">Daily PnL</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="main-section">
          <div className="chart-card">
            <h3>Real-Time Price Chart</h3>
            {priceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => `Hour: ${value}:00`}
                    formatter={(value: any) => [`$${value}`, 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                <p>No price data available</p>
              </div>
            )}
          </div>
          
          <div className="market-grid-card">
            <h3>Day-Ahead Market Prices</h3>
            <div className="market-grid">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="grid-cell">
                  <div className="hour-label">{i}:00</div>
                  <div className="price-value">
                    {dayAheadPrices[i] ? `$${dayAheadPrices[i].toFixed(2)}` : '--'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="sidebar-section">
          <div className="action-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button 
                className="action-btn primary"
                onClick={handleTriggerClearing}
              >
                Trigger Clearing
              </button>
              <button 
                className="action-btn"
                onClick={handleViewOrders}
              >
                View Orders
              </button>
              <button 
                className="action-btn"
                onClick={handleCheckPnL}
              >
                Check PnL
              </button>
            </div>
          </div>
          
          <div className="status-card">
            <h3>Market Status</h3>
            <div className="status-content">
              <div className="status-indicator open">🟢</div>
              <div className="status-text">
                <p>Market Open</p>
                <p>Next clearing: 11:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
