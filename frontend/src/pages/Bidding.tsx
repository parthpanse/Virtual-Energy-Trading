import React, { useState, useEffect, useCallback } from 'react';
import { apiService, Bid } from '../services/api';
import './Bidding.css';

interface MarketGridCell {
  hour: number;
  dayAheadPrice: number;
  realTimePrice: number;
  bids: Bid[];
}

const Bidding: React.FC = () => {
  const [marketGrid, setMarketGrid] = useState<MarketGridCell[]>([]);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [showBidModal, setShowBidModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('user123'); // Added current user ID state
  const [bidForm, setBidForm] = useState({
    hour: 0,
    bid_type: 'BUY' as 'BUY' | 'SELL',
    quantity: 100,
    price: 0,
    user_id: 'user123', // Added user_id field with default value
  });

  const loadBiddingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [bidsResponse, dayAheadResponse, realTimeResponse] = await Promise.all([
        apiService.getBids(currentUserId),
        apiService.getDayAheadPrices(),
        apiService.getRealTimePrices(),
      ]);

      const bids = bidsResponse.data || [];
      const dayAheadData = dayAheadResponse.data?.prices || [];
      const realTimeData = realTimeResponse.data?.prices || [];

      setUserBids(bids);

      // Create market grid
      const grid = Array.from({ length: 24 }, (_, hour) => {
        const dayAheadPrice = dayAheadData.find((d: any) => d.hour === hour)?.price || 0;
        const realTimePrice = realTimeData.find((d: any) => d.hour === hour)?.price || 0;
        const hourBids = bids.filter((bid: Bid) => bid.hour === hour);

        return {
          hour,
          dayAheadPrice,
          realTimePrice,
          bids: hourBids,
        };
      });

      setMarketGrid(grid);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load bidding data');
      console.error('Bidding data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadBiddingData();
    const interval = setInterval(loadBiddingData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [loadBiddingData]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newBid: Bid = {
        ...bidForm,
        user_id: currentUserId,
      };

      await apiService.createBid(newBid);
      
      // Reset form and close modal
      setBidForm({
        hour: 0,
        bid_type: 'BUY',
        quantity: 100,
        price: 0,
        user_id: currentUserId, // Ensure user_id is updated
      });
      setShowBidModal(false);
      
      // Reload data
      loadBiddingData();
      
      alert('Bid placed successfully!');
    } catch (err: any) {
      alert('Failed to place bid: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteBid = async (bidId: string) => {
    if (window.confirm('Are you sure you want to delete this bid?')) {
      try {
        await apiService.deleteBid(bidId);
        loadBiddingData();
        alert('Bid deleted successfully!');
      } catch (err: any) {
        alert('Failed to delete bid: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'EXECUTED': return 'green';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  if (loading && marketGrid.length === 0) {
    return (
      <div className="bidding">
        <div className="loading">Loading bidding data...</div>
      </div>
    );
  }

  return (
    <div className="bidding">
      <div className="bidding-header">
        <h2>Bidding</h2>
        <button 
          className="new-bid-btn"
          onClick={() => setShowBidModal(true)}
        >
          + New Bid
        </button>
      </div>

      {/* User ID Selector */}
      <div className="user-selector">
        <label htmlFor="userId">Current User ID:</label>
        <input
          id="userId"
          type="text"
          value={currentUserId}
          onChange={(e) => setCurrentUserId(e.target.value)}
          placeholder="Enter user ID"
          className="user-input"
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* 24-Hour Market Grid */}
      <div className="market-grid-section">
        <h3>24-Hour Market Grid</h3>
        <div className="market-grid">
          {marketGrid.map((cell) => (
            <div key={cell.hour} className="grid-cell">
              <div className="hour-header">{cell.hour}:00</div>
              <div className="price-info">
                <div className="price-row">
                  <span className="price-label">DA:</span>
                  <span className="price-value">${cell.dayAheadPrice.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">RT:</span>
                  <span className="price-value">${cell.realTimePrice.toFixed(2)}</span>
                </div>
              </div>
                             <div className="bids-info">
                 {cell.bids.map((bid) => (
                   <div 
                     key={bid.id} 
                     className={`bid-indicator ${bid.bid_type.toLowerCase()}`}
                     title={`${bid.bid_type} ${bid.quantity}MWh @ $${bid.price}`}
                   >
                     {bid.bid_type === 'BUY' ? '🟢' : '🔴'}
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Bids Table */}
      <div className="bids-section">
        <h3>Your Bids</h3>
        <div className="bids-table">
          <div className="table-header">
            <div className="header-cell">Hour</div>
            <div className="header-cell">Type</div>
            <div className="header-cell">Quantity (MWh)</div>
            <div className="header-cell">Price ($/MWh)</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Timestamp</div>
            <div className="header-cell">Actions</div>
          </div>
          
          {userBids.length === 0 ? (
            <div className="no-bids">
              <p>No bids placed yet. Create your first bid!</p>
            </div>
          ) : (
            userBids.map((bid) => (
              <div key={bid.id} className="table-row">
                <div className="table-cell">{bid.hour}:00</div>
                <div className="table-cell">
                  <div className="bid-info">
                    <span className={`bid-type ${bid.bid_type.toLowerCase()}`}>
                      {bid.bid_type}
                    </span>
                    <span className="bid-quantity">{bid.quantity}MWh</span>
                    <span className="bid-price">${bid.price}</span>
                  </div>
                </div>
                <div className="table-cell">
                  <span 
                    className="bid-status"
                    style={{ backgroundColor: getBidStatusColor(bid.status || 'PENDING') }}
                  >
                    {bid.status || 'PENDING'}
                  </span>
                </div>
                <div className="table-cell">
                  {bid.timestamp ? new Date(bid.timestamp).toLocaleString() : '--'}
                </div>
                <div className="table-cell">
                  <button 
                    className="delete-btn"
                    onClick={() => bid.id && handleDeleteBid(bid.id)}
                    disabled={bid.status === 'EXECUTED'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="modal-overlay" onClick={() => setShowBidModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Place New Bid</h3>
              <button 
                className="close-btn"
                onClick={() => setShowBidModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleBidSubmit} className="bid-form">
              <div className="form-group">
                <label>Hour:</label>
                <select
                  value={bidForm.hour}
                  onChange={(e) => setBidForm({...bidForm, hour: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Select hour</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Type:</label>
                <select
                  value={bidForm.bid_type}
                  onChange={(e) => setBidForm({ ...bidForm, bid_type: e.target.value as 'BUY' | 'SELL' })}
                  required
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity (MWh):</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={bidForm.quantity}
                  onChange={(e) => setBidForm({...bidForm, quantity: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price ($/MWh):</label>
                <input
                  type="number"
                  min="0.01"
                  max="1000"
                  step="0.01"
                  value={bidForm.price}
                  onChange={(e) => setBidForm({...bidForm, price: parseFloat(e.target.value)})}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Place Bid
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowBidModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bidding;
