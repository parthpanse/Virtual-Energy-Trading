import axios from 'axios';

// Runtime API base URL - can be overridden after app loads
let API_BASE_URL = 'http://localhost:8000';

// Function to set API URL at runtime
export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
  // Recreate the axios instance with new base URL
  api.defaults.baseURL = API_BASE_URL;
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface Bid {
  id?: string;
  hour: number;
  bid_type: 'BUY' | 'SELL';  // Changed from 'type' to 'bid_type' to match backend
  quantity: number;
  price: number;
  user_id: string;
  status?: 'PENDING' | 'EXECUTED' | 'REJECTED';
  timestamp?: string;
  execution_price?: number | null;
  execution_time?: string | null;
}

export interface Contract {
  id: string;
  bid_id: string;
  execution_price: number;
  quantity: number;
  hour: number;
  date: string;
  status: 'ACTIVE' | 'COMPLETED';
  timestamp: string;
}

export interface MarketData {
  id: string;
  date: string;
  hour: number;
  type: 'day_ahead' | 'real_time';
  price: number;
  timestamp: string;
}

export interface PnLRecord {
  id: string;
  contract_id: string;
  date: string;
  hour: number;
  day_ahead_price: number;
  real_time_price: number;
  quantity: number;
  pnl: number;
  pnl_type: 'REALIZED' | 'UNREALIZED';
  timestamp: string;
}

export interface PnLSummary {
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_quantity: number;
  records: PnLRecord[];
}

// API functions
export const apiService = {
  // Health check
  health: () => api.get('/api/health'),

  // Bidding
  createBid: (bid: Bid) => api.post('/api/bids/', bid),
  getBids: (userId?: string) => api.get('/api/bids/', { params: { user_id: userId } }),
  getBid: (id: string) => api.get(`/api/bids/${id}`),
  updateBid: (id: string, bid: Partial<Bid>) => api.put(`/api/bids/${id}`, bid),
  deleteBid: (id: string) => api.delete(`/api/bids/${id}`),
  getPendingBids: () => api.get('/api/bids/pending/'),

  // Market Clearing
  triggerClearing: (date?: string) => api.post('/api/clear/', null, { params: { target_date: date } }),
  getClearingSummary: (date?: string) => api.get('/api/clear/summary/', { params: { target_date: date } }),

  // Contracts
  getContracts: (params?: any) => api.get('/api/contracts/', { params }),
  updateContractStatus: (id: string, status: string) => api.put(`/api/contracts/${id}/status`, { status }),
  completeAllActive: (date?: string) => api.post('/api/contracts/complete-all-active', null, { params: { target_date: date } }),
  getContractSummary: () => api.get('/api/contracts/summary/'),

  // PnL - Fixed endpoints
  getPnL: (date?: string, userId?: string) => api.get(`/api/pnl/user/${userId}`, { params: { target_date: date } }),
  getPnLSummary: (date?: string, userId?: string) => api.get(`/api/pnl/summary/${userId}`, { params: { target_date: date } }),
  getAllUsersPnLSummary: (date?: string) => api.get('/api/pnl/all-users/summary', { params: { target_date: date } }),

  // Market Data - Fixed endpoints
  getMarketData: (date?: string, type?: string) => api.get('/api/market/prices/', { params: { target_date: date || new Date().toISOString().split('T')[0] } }),
  getRealTimePrices: () => api.get('/api/market/prices/', { params: { target_date: new Date().toISOString().split('T')[0] } }),
  getDayAheadPrices: (date?: string) => api.get('/api/market/prices/', { params: { target_date: date || new Date().toISOString().split('T')[0] } }),
};

export default apiService;
