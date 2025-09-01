# Workflow: Virtual Energy Trading API

This guide walks through the main API endpoints with `curl` commands to test the system.

---

## 1. Health Check

```bash
curl "http://localhost:8000/api/health"
```

---

## 2. Market Data

### Generate Market Data

```bash
# Generate Day Ahead
curl -X POST "http://localhost:8000/api/market/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "'$(date +%Y-%m-%d)'",
    "data_type": "DAY_AHEAD"
  }'

# Generate Real Time
curl -X POST "http://localhost:8000/api/market-data/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "'$(date +%Y-%m-%d)'",
    "data_type": "REAL_TIME"
  }'
```

### Retrieve Market Data

```bash
# Retrieval Only
curl -X 'GET' \
  'http://localhost:8000/api/market/prices/?target_date=2025-09-01&data_type=DAY_AHEAD' \
  -H 'accept: application/json'

# Generate mock + retrieve
curl -X 'GET' \
  'http://localhost:8000/api/market/?target_date=2025-09-01&data_type=DAY_AHEAD' \
  -H 'accept: application/json'

# Hour Specific
curl -X 'GET' \
  'http://localhost:8000/api/market/price/12/?target_date=2025-09-01&data_type=DAY_AHEAD' \
  -H 'accept: application/json'

# Update Real Time Data
curl -X 'POST' \
  'http://localhost:8000/api/market/update-realtime/?target_date=2025-09-01' \
  -H 'accept: application/json' \
  -d ''

# Get Daily Summary
curl -X 'GET' \
  'http://localhost:8000/api/market/summary/?target_date=2025-09-01' \
  -H 'accept: application/json'

# Charted Market Data
curl -X 'GET' \
  'http://localhost:8000/api/market/chart/?target_date=2025-09-01' \
  -H 'accept: application/json'
```

---

## 3. Bids

### Create Bid

```bash
curl -X 'POST' \
  'http://localhost:8000/api/bids/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
     "hour": 14,
     "bid_type": "BUY",
     "quantity": 80,
     "price": 46.5,
     "user_id": "test3"
  }'
```

> 💡 Tip: Create multiple BUY/SELL bids across different users to fully test the market clearing.

---

## 4. Clearing

```bash
curl -X 'POST' \
  'http://localhost:8000/api/clear/?target_date=2025-09-01' \
  -H 'accept: application/json' \
  -d ''
```

---

## 5. Contracts

```bash
curl -X 'POST' \
  'http://localhost:8000/api/contracts/complete-all-active?target_date=2025-09-01' \
  -H 'accept: application/json' \
  -d ''
```

---

## 6. Profit & Loss (PnL)

### Calculate PnL

```bash
curl -X 'POST' \
  'http://localhost:8000/api/pnl/calculate/?user_id=testuser1&target_date=2025-09-01' \
  -H 'accept: application/json' \
  -d ''
```

### Get User PnL

```bash
curl -X 'GET' \
  'http://localhost:8000/api/pnl/user/testuser1?start_date=2025-09-01&end_date=2025-09-01' \
  -H 'accept: application/json'
```

### Get PnL Summary

```bash
curl -X 'GET' \
  'http://localhost:8000/api/pnl/summary/testuser1?target_date=2025-09-01' \
  -H 'accept: application/json'
```

