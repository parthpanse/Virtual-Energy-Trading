import React, { useState, useEffect, useCallback } from 'react';
import { apiService, Contract, Bid } from '../services/api';
import './Orders.css';

interface OrdersData {
  contracts: Contract[];
  bids: Bid[];
}

const Orders: React.FC = () => {
  const [ordersData, setOrdersData] = useState<OrdersData>({ contracts: [], bids: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'contracts' | 'bids'>('contracts');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadOrdersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [contractsResponse, bidsResponse] = await Promise.all([
        apiService.getContracts({ user_id: 'user123' }),
        apiService.getBids('user123'),
      ]);

      setOrdersData({
        contracts: contractsResponse.data || [],
        bids: bidsResponse.data || [],
      });

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load orders data');
      console.error('Orders data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrdersData();
    const interval = setInterval(loadOrdersData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [loadOrdersData]);

  const handleCompleteAllActive = async () => {
    if (window.confirm('Are you sure you want to complete all active contracts?')) {
      try {
        // Use today's date for completing contracts
        const today = new Date().toISOString().split('T')[0];
        await apiService.completeAllActive(today);
        loadOrdersData();
        alert('All active contracts completed successfully!');
      } catch (err: any) {
        alert('Failed to complete contracts: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'COMPLETED': return 'blue';
      case 'PENDING': return 'orange';
      case 'EXECUTED': return 'green';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  const filteredContracts = filterStatus === 'all' 
    ? ordersData.contracts 
    : ordersData.contracts.filter(contract => contract.status === filterStatus);

  const filteredBids = filterStatus === 'all' 
    ? ordersData.bids 
    : ordersData.bids.filter(bid => bid.status === filterStatus);

  if (loading && ordersData.contracts.length === 0) {
    return (
      <div className="orders">
        <div className="loading">Loading orders data...</div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="orders-header">
        <h2>Orders Management</h2>
        <button 
          className="complete-all-btn"
          onClick={handleCompleteAllActive}
        >
          Complete All Active
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          Contracts ({ordersData.contracts.length})
        </button>
        <button 
          className={`tab ${activeTab === 'bids' ? 'active' : ''}`}
          onClick={() => setActiveTab('bids')}
        >
          Bids ({ordersData.bids.length})
        </button>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <label>Filter by Status:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="EXECUTED">Executed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="orders-section">
          <h3>Contracts</h3>
          <div className="orders-table">
            <div className="table-header">
              <div className="header-cell">ID</div>
              <div className="header-cell">Hour</div>
              <div className="header-cell">Quantity (MWh)</div>
              <div className="header-cell">Execution Price ($/MWh)</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Timestamp</div>
            </div>
            
            {filteredContracts.length === 0 ? (
              <div className="no-orders">
                <p>No contracts found.</p>
              </div>
            ) : (
              filteredContracts.map((contract) => (
                <div key={contract.id} className="table-row">
                  <div className="table-cell">{contract.id}</div>
                  <div className="table-cell">{contract.hour}:00</div>
                  <div className="table-cell">{contract.quantity}</div>
                  <div className="table-cell">${contract.execution_price.toFixed(2)}</div>
                  <div className="table-cell">{contract.date}</div>
                  <div className="table-cell">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(contract.status) }}
                    >
                      {contract.status}
                    </span>
                  </div>
                  <div className="table-cell">
                    {new Date(contract.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bids Tab */}
      {activeTab === 'bids' && (
        <div className="orders-section">
          <h3>Bids</h3>
          <div className="orders-table">
            <div className="table-header">
              <div className="header-cell">ID</div>
              <div className="header-cell">Hour</div>
              <div className="header-cell">Type</div>
              <div className="header-cell">Quantity (MWh)</div>
              <div className="header-cell">Price ($/MWh)</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Timestamp</div>
            </div>
            
            {filteredBids.length === 0 ? (
              <div className="no-orders">
                <p>No bids found.</p>
              </div>
            ) : (
              filteredBids.map((bid) => (
                <div key={bid.id} className="table-row">
                  <div className="table-cell">{bid.id}</div>
                  <div className="table-cell">{bid.hour}:00</div>
                  <div className="table-cell">
                    <span className={`bid-type ${bid.bid_type.toLowerCase()}`}>
                      {bid.bid_type}
                    </span>
                  </div>
                  <div className="table-cell">{bid.quantity}</div>
                  <div className="table-cell">${bid.price.toFixed(2)}</div>
                  <div className="table-cell">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(bid.status || 'PENDING') }}
                    >
                      {bid.status || 'PENDING'}
                    </span>
                  </div>
                  <div className="table-cell">
                    {bid.timestamp ? new Date(bid.timestamp).toLocaleString() : '--'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-item">
          <div className="stat-value">{ordersData.contracts.length}</div>
          <div className="stat-label">Total Contracts</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{ordersData.contracts.filter(c => c.status === 'ACTIVE').length}</div>
          <div className="stat-label">Active Contracts</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{ordersData.bids.length}</div>
          <div className="stat-label">Total Bids</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{ordersData.bids.filter(b => b.status === 'PENDING').length}</div>
          <div className="stat-label">Pending Bids</div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
