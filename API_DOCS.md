# Virtual Energy Trading Platform - API Documentation

## Overview

The Virtual Energy Trading Platform API provides a comprehensive set of endpoints for managing energy trading operations. The API is built with FastAPI and follows RESTful principles with proper HTTP status codes and error handling.

**Base URL**: `http://localhost:8000`  
**API Version**: v1.0.0  
**Interactive Docs**: `http://localhost:8000/docs`

## Authentication

Currently, the API uses a simple user_id parameter for identification. In production, this should be replaced with proper JWT authentication.

## Common Response Format

All API responses follow a consistent format:

```json
{
  "data": {...},
  "message": "Success message",
  "status": "success"
}
```

Error responses:

```json
{
  "detail": "Error description",
  "status_code": 400
}
```

## Endpoints

### 1. Health Check

#### GET /api/health
Check the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "Virtual Energy Trading Platform API"
}
```

### 2. Bidding API

#### POST /api/bids/
Create a new energy trading bid.

**Request Body:**
```json
{
  "hour": 10,
  "type": "BUY",
  "quantity": 100,
  "price": 45.50,
  "user_id": "user123"
}
```

**Parameters:**
- `hour` (integer, 0-23): Hour of the day for the bid
- `type` (string): Either "BUY" or "SELL"
- `quantity` (decimal): Quantity in MWh
- `price` (decimal): Price per MWh
- `user_id` (string): Unique identifier for the user

**Response:**
```json
{
  "id": "bid_123",
  "hour": 10,
  "bid_type": "BUY",
  "quantity": 100.0,
  "price": 45.50,
  "user_id": "user123",
  "status": "PENDING",
  "bid_date": "2024-01-15",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Validation Rules:**
- Maximum 10 bids per hour per user
- Market closes at 11:00 AM (no bids after that time)
- Price and quantity must be positive numbers

**Error Cases:**
- `400`: Validation errors (bid limit exceeded, market closed)
- `422`: Invalid request data
- `500`: Internal server error

#### GET /api/bids/{bid_id}
Retrieve a specific bid by ID.

**Response:**
```json
{
  "id": "bid_123",
  "hour": 10,
  "bid_type": "BUY",
  "quantity": 100.0,
  "price": 45.50,
  "user_id": "user123",
  "status": "PENDING",
  "bid_date": "2024-01-15",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### GET /api/bids/
Get all bids for a specific user.

**Query Parameters:**
- `user_id` (required): User identifier
- `date` (optional): Filter by date (YYYY-MM-DD format)

**Example:**
```http
GET /api/bids/?user_id=user123&date=2024-01-15
```

**Response:**
```json
[
  {
    "id": "bid_123",
    "hour": 10,
    "bid_type": "BUY",
    "quantity": 100.0,
    "price": 45.50,
    "user_id": "user123",
    "status": "PENDING",
    "bid_date": "2024-01-15",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### PUT /api/bids/{bid_id}
Update an existing bid.

**Request Body:**
```json
{
  "quantity": 150.0,
  "price": 47.00
}
```

**Note:** Only pending bids can be updated.

#### DELETE /api/bids/{bid_id}
Delete a bid.

**Note:** Only pending bids can be deleted.

#### GET /api/bids/pending/
Get all pending bids, optionally filtered by hour.

**Query Parameters:**
- `hour` (optional): Filter by hour (0-23)

**Example:**
```http
GET /api/bids/pending/?hour=10
```

### 3. Market Clearing API

#### POST /api/clear
Trigger market clearing for a specific date.

**Query Parameters:**
- `date` (required): Date for clearing (YYYY-MM-DD format)

**Example:**
```http
POST /api/clear?date=2024-01-15
```

**Response:**
```json
{
  "message": "Market cleared for 2024-01-15",
  "contracts_created": 6,
  "total_bids_processed": 12
}
```

**Clearing Process:**
1. Collects all pending bids for the specified date
2. Separates buy and sell bids
3. Matches bids based on price compatibility
4. Creates contracts for matched bids
5. Updates bid statuses to EXECUTED

#### GET /api/clear/summary/{date}
Get clearing summary for a specific date.

**Response:**
```json
{
  "date": "2024-01-15",
  "total_contracts": 6,
  "buy_contracts": 3,
  "sell_contracts": 3,
  "total_volume_mwh": 450.0,
  "average_price": 46.25,
  "contracts": [...]
}
```

### 4. PnL (Profit & Loss) API

#### GET /api/pnl/
Calculate PnL for a user on a specific date.

**Query Parameters:**
- `date` (required): Date for PnL calculation (YYYY-MM-DD format)
- `user_id` (required): User identifier

**Example:**
```http
GET /api/pnl/?date=2024-01-15&user_id=user123
```

**Response:**
```json
[
  {
    "id": "pnl_123",
    "user_id": "user123",
    "contract_id": "contract_456",
    "date": "2024-01-15",
    "hour": 10,
    "day_ahead_price": 45.50,
    "real_time_price": 47.20,
    "quantity": 100.0,
    "pnl_amount": 170.00,
    "pnl_type": "UNREALIZED"
  }
]
```

#### GET /api/pnl/summary/{date}
Get PnL summary for a user on a specific date.

**Query Parameters:**
- `user_id` (required): User identifier

**Response:**
```json
{
  "date": "2024-01-15",
  "total_pnl": 450.75,
  "realized_pnl": 0.0,
  "unrealized_pnl": 450.75,
  "total_volume": 300.0,
  "records_count": 3,
  "hourly_breakdown": [
    {
      "hour": 10,
      "pnl": 170.00,
      "type": "UNREALIZED",
      "day_ahead_price": 45.50,
      "real_time_price": 47.20
    }
  ]
}
```

#### GET /api/pnl/portfolio
Get overall portfolio PnL for a user.

**Query Parameters:**
- `user_id` (required): User identifier

**Response:**
```json
{
  "total_pnl": 1250.50,
  "realized_pnl": 450.75,
  "unrealized_pnl": 799.75,
  "total_volume": 1200.0,
  "total_contracts": 8
}
```

### 5. Market Data API

#### GET /api/market-data/
Get market prices for a specific date.

**Query Parameters:**
- `date` (required): Date for market data (YYYY-MM-DD format)
- `type` (optional): Data type - "day_ahead" or "real_time"

**Example:**
```http
GET /api/market-data/?date=2024-01-15&type=day_ahead
```

**Response:**
```json
[
  {
    "id": "md_123",
    "date": "2024-01-15",
    "hour": 0,
    "data_type": "DAY_AHEAD",
    "price": 35.20,
    "source": "mock",
    "timestamp": "2024-01-15T00:00:00Z"
  }
]
```

#### GET /api/market-data/summary/{date}
Get market price summary for a date.

**Response:**
```json
{
  "date": "2024-01-15",
  "day_ahead": {
    "min_price": 35.20,
    "max_price": 62.50,
    "avg_price": 48.75,
    "total_hours": 24
  },
  "real_time": {
    "min_price": 34.80,
    "max_price": 63.20,
    "avg_price": 49.10,
    "total_hours": 24,
    "last_updated": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /api/market-data/chart/{date}
Get hourly price data formatted for charts.

**Response:**
```json
{
  "date": "2024-01-15",
  "hours": [0, 1, 2, ..., 23],
  "day_ahead_prices": [35.20, 34.80, 33.90, ...],
  "real_time_prices": [34.80, 34.20, 33.50, ...]
}
```

#### POST /api/market-data/generate
Generate mock market data for a date.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "data_type": "DAY_AHEAD"
}
```

## Data Models

### Bid Status
- `PENDING`: Bid is active and waiting for clearing
- `EXECUTED`: Bid has been matched and executed
- `CANCELLED`: Bid has been cancelled

### Contract Status
- `ACTIVE`: Contract is active and generating PnL
- `COMPLETED`: Contract period has ended
- `CANCELLED`: Contract has been cancelled

### Market Data Types
- `DAY_AHEAD`: Prices set before the trading day
- `REAL_TIME`: Live prices updated every 5 minutes

### PnL Types
- `REALIZED`: PnL from completed contracts
- `UNREALIZED`: PnL from active contracts

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `422`: Unprocessable Entity
- `500`: Internal Server Error

## Rate Limiting

Currently, the API enforces business rules rather than technical rate limits:
- Maximum 10 bids per hour per user
- Market clearing can only be triggered once per day
- Real-time price updates occur every 5 minutes

## WebSocket Support

The API is prepared for WebSocket implementation for real-time updates:
- Market price changes
- Bid status updates
- Contract execution notifications

## Testing

Test the API using the interactive documentation at `/docs` or use tools like:
- Postman
- curl
- Python requests library

## Example Usage

### Python Client Example

```python
import requests

# Create a bid
bid_data = {
    "hour": 10,
    "type": "BUY",
    "quantity": 100,
    "price": 45.50,
    "user_id": "user123"
}

response = requests.post(
    "http://localhost:8000/api/bids/",
    json=bid_data
)

if response.status_code == 201:
    bid = response.json()
    print(f"Bid created: {bid['id']}")

# Get market data
market_data = requests.get(
    "http://localhost:8000/api/market-data/",
    params={"date": "2024-01-15", "type": "day_ahead"}
).json()

# Trigger clearing
clearing_result = requests.post(
    "http://localhost:8000/api/clear",
    params={"date": "2024-01-15"}
).json()
```

### JavaScript/TypeScript Client Example

```typescript
// Create a bid
const createBid = async (bidData: any) => {
  const response = await fetch('http://localhost:8000/api/bids/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bidData),
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create bid');
};

// Get PnL summary
const getPnLSummary = async (date: string, userId: string) => {
  const response = await fetch(
    `http://localhost:8000/api/pnl/summary/${date}?user_id=${userId}`
  );
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to get PnL summary');
};
```

## Future Enhancements

1. **Authentication & Authorization**: JWT-based authentication system
2. **Real-time Updates**: WebSocket implementation for live data
3. **Advanced Analytics**: Historical data analysis and reporting
4. **Multi-user Support**: User management and role-based access
5. **Audit Logging**: Comprehensive transaction logging
6. **Performance Monitoring**: API metrics and health checks
7. **Rate Limiting**: Technical rate limiting for API protection
8. **Caching**: Redis-based caching for frequently accessed data
