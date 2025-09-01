import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiService, PnLRecord, PnLSummary } from '../services/api';
import './PnL.css';

interface PnLData {
  date: string;
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_volume: number;
  records_count: number;
  user_count: number;
  user_breakdown: Array<{
    user_id: string;
    total_pnl: number;
    realized_pnl: number;
    unrealized_pnl: number;
    total_volume: number;
    records_count: number;
  }>;
}

const PnL: React.FC = () => {
  const [pnlData, setPnlData] = useState<PnLData>({ 
    date: '', 
    total_pnl: 0, 
    realized_pnl: 0, 
    unrealized_pnl: 0, 
    total_volume: 0, 
    records_count: 0,
    user_count: 0,
    user_breakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadPnLData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const summaryResponse = await apiService.getAllUsersPnLSummary(selectedDate);
      const summary = summaryResponse.data || { 
        date: selectedDate, 
        total_pnl: 0, 
        realized_pnl: 0, 
        unrealized_pnl: 0, 
        total_volume: 0, 
        records_count: 0,
        user_count: 0,
        user_breakdown: []
      };

      setPnlData(summary);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load PnL data');
      console.error('PnL data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadPnLData();
    const interval = setInterval(loadPnLData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [loadPnLData]);

  // Since we don't have individual records, create empty chart data
  const chartData: any[] = [];
  const priceComparisonData: any[] = [];

  if (loading && pnlData.total_pnl === 0) {
    return (
      <div className="pnl">
        <div className="loading">Loading PnL data...</div>
      </div>
    );
  }

  return (
    <div className="pnl">
      <div className="pnl-header">
        <h2>Profit & Loss Analysis</h2>
        <div className="date-selector">
          <label>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* PnL Summary Cards */}
      <div className="pnl-summary">
        <div className="summary-card total">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className={`summary-value ${pnlData.total_pnl >= 0 ? 'positive' : 'negative'}`}>
              ${pnlData.total_pnl.toFixed(2)}
            </div>
            <div className="summary-label">Total PnL</div>
          </div>
        </div>

        <div className="summary-card realized">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className={`summary-value ${pnlData.realized_pnl >= 0 ? 'positive' : 'negative'}`}>
              ${pnlData.realized_pnl.toFixed(2)}
            </div>
            <div className="summary-label">Realized PnL</div>
          </div>
        </div>

        <div className="summary-card unrealized">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <div className={`summary-value ${pnlData.unrealized_pnl >= 0 ? 'positive' : 'negative'}`}>
              ${pnlData.unrealized_pnl.toFixed(2)}
            </div>
            <div className="summary-label">Unrealized PnL</div>
          </div>
        </div>

        <div className="summary-card quantity">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <div className="summary-value">
              {pnlData.total_volume} MWh
            </div>
            <div className="summary-label">Total Quantity</div>
          </div>
        </div>
      </div>

      {/* User Breakdown Section */}
      {pnlData.user_breakdown.length > 0 && (
        <div className="user-breakdown-section">
          <h3>PnL by User ({pnlData.user_count} users)</h3>
          <div className="user-breakdown-grid">
            {pnlData.user_breakdown.map((user) => (
              <div key={user.user_id} className="user-pnl-card">
                <div className="user-header">
                  <h4>User: {user.user_id}</h4>
                  <div className={`user-total-pnl ${user.total_pnl >= 0 ? 'positive' : 'negative'}`}>
                    ${user.total_pnl.toFixed(2)}
                  </div>
                </div>
                <div className="user-details">
                  <div className="user-detail">
                    <span className="label">Realized:</span>
                    <span className={`value ${user.realized_pnl >= 0 ? 'positive' : 'negative'}`}>
                      ${user.realized_pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="user-detail">
                    <span className="label">Unrealized:</span>
                    <span className={`value ${user.unrealized_pnl >= 0 ? 'positive' : 'negative'}`}>
                      ${user.unrealized_pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="user-detail">
                    <span className="label">Volume:</span>
                    <span className="value">{user.total_volume} MWh</span>
                  </div>
                  <div className="user-detail">
                    <span className="label">Records:</span>
                    <span className="value">{user.records_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>PnL by Hour</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Hour: ${value}:00`}
                  formatter={(value: any, name: string) => [`$${value.toFixed(2)}`, name]}
                />
                <Bar dataKey="realized" fill="#4caf50" name="Realized" />
                <Bar dataKey="unrealized" fill="#ff9800" name="Unrealized" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <p>No PnL data available for selected date</p>
            </div>
          )}
        </div>

        <div className="chart-container">
          <h3>Price Comparison (DA vs RT)</h3>
          {priceComparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Hour: ${value}:00`}
                  formatter={(value: any, name: string) => [`$${value.toFixed(2)}`, name]}
                />
                <Line 
                  type="monotone" 
                  dataKey="dayAhead" 
                  stroke="#667eea" 
                  strokeWidth={2}
                  name="Day Ahead"
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="realTime" 
                  stroke="#f44336" 
                  strokeWidth={2}
                  name="Real Time"
                  dot={{ fill: '#f44336', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <p>No price data available for selected date</p>
            </div>
          )}
        </div>
      </div>

      {/* PnL Details Table */}
      <div className="pnl-details">
        <h3>PnL Details</h3>
        <div className="details-table">
          <div className="table-header">
            <div className="header-cell">Hour</div>
            <div className="header-cell">Quantity (MWh)</div>
            <div className="header-cell">Day Ahead Price</div>
            <div className="header-cell">Real Time Price</div>
            <div className="header-cell">PnL</div>
            <div className="header-cell">Type</div>
          </div>
          
          {pnlData.records_count === 0 ? (
            <div className="no-records">
              <p>No PnL records found for selected date</p>
            </div>
          ) : (
            // This section will need to be updated to display individual records
            // if the API were to return them. For now, it's empty.
            <div className="no-records">
              <p>PnL details are not available in this view.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PnL;
