# Virtual Energy Trading Platform

The Virtual Energy Trading Platform is a sophisticated, web-based simulation environment designed to replicate the dynamics of real-world energy markets. This platform provides a comprehensive trading experience with real-time price monitoring, day-ahead bidding, and profit & loss analysis.

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend (React + TypeScript)"
        A[Dashboard] --> B[Bidding Interface]
        A --> C[Orders Management]
        A --> D[PnL Analysis]
    end

    subgraph "Backend (FastAPI + SQLModel)"
        E[API Layer] --> F[Bidding Service]
        E --> G[Clearing Service]
        E --> H[PnL Service]
        E --> I[Market Data Service]
        F --> J[Database]
        G --> J
        H --> J
        I --> J
    end


    A -.-> E
    B -.-> E
    C -.-> E
    D -.-> E
```

## 📊 Project Status

### ✅ Completed (95% Backend, 40% Frontend)
- **Backend API**: All core trading endpoints implemented and tested
- **Database**: Complete data model with relationships
- **Business Logic**: Market clearing, PnL calculation, contract management
- **Documentation**: Comprehensive API docs and project documentation
- **Docker**: Containerized deployment ready

### ⚠️ In Progress
- **Frontend Integration**: API connection and data visualization
- **Real-time Updates**: WebSocket implementation for live data
- **Testing Suite**: Unit and integration tests
- **Error Handling**: User-friendly error messages and validation

### 📋 Next Steps
1. Complete frontend API integration
2. Add data visualization (charts, graphs)
3. Implement real-time updates
4. Add comprehensive testing
5. Polish user experience

## ✨ Features

### Core Trading Features ✅
- **Real-time Market Monitoring**: Live 5-minute price updates with mock data generation
- **Day-Ahead Bidding**: Place BUY/SELL orders for 24-hour periods with validation
- **Automated Clearing**: Market clearing at 11:00 AM daily with bid matching
- **PnL Calculation**: Real-time vs Day-ahead price comparison with detailed breakdowns
- **Order Management**: Comprehensive bid and contract tracking with status management
- **Contract Management**: Status updates and completion workflows

### Technical Features ✅
- **Backend API**: Complete FastAPI implementation with all core endpoints
- **Database Models**: Complete SQLModel-based data layer with relationships
- **Data Validation**: Business rule enforcement (≤10 bids/hour, cutoff times)
- **Idempotent Operations**: Safe clearing and execution processes
- **Market Data**: Mock provider with realistic price patterns
- **PnL Engine**: Accurate profit/loss calculations with realized/unrealized tracking

### Frontend Features ⚠️
- **Responsive UI**: Modern interface built with React
- **Page Structure**: Dashboard, Bidding, Orders, and PnL pages implemented
- **Basic Layout**: Navigation and component structure ready
- **API Integration**: Structure ready, implementation in progress

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Virtual-Energy-Trading
   ```

2. **Start the services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs #Preferred

### Local Development

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📚 API Documentation

#### Health Check
```http
GET /api/health
```

#### Bidding
```http
POST /api/bids
{
  "hour": 10,
  "bid_type": "BUY",
  "quantity": 100,
  "price": 45.50,
  "user_id": "user123"
}
```

#### Market Clearing
```http
POST /api/clear?date=2024-01-15
```

#### PnL Analysis
```http
GET /api/pnl?date=2024-01-15&user_id=user123
```

#### Market Data
```http
GET /api/market/prices/?target_date=2025-09-01&data_type=DAY_AHEAD'
```

### Interactive API Docs
Visit http://localhost:8000/docs for interactive API documentation powered by Swagger UI.

## 🐳 Docker Commands

### Development
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
Virtual-Energy-Trading/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application with all routers
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Backend container
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   │   ├── bidding.py      # Bidding API
│   │   │   ├── clearing.py     # Market clearing API
│   │   │   ├── pnl.py          # PnL calculation API
│   │   │   └── market_data.py  # Market data API
│   │   ├── models/        # Database models
│   │   │   ├── bid.py          # Bid model
│   │   │   ├── contract.py     # Contract model
│   │   │   ├── market_data.py  # Market data model
│   │   │   └── pnl.py          # PnL model
│   │   ├── schemas/       # Pydantic schemas
│   │   │   ├── bid.py          # Bid schemas
│   │   │   ├── contract.py     # Contract schemas
│   │   │   ├── market_data.py  # Market data schemas
│   │   │   └── pnl.py          # PnL schemas
│   │   ├── services/      # Business logic
│   │   │   ├── bid_service.py      # Bid management
│   │   │   ├── clearing_service.py # Market clearing
│   │   │   ├── pnl_service.py     # PnL calculations
│   │   │   └── market_data_service.py # Market data
│   │   └── database.py    # Database configuration
├── frontend/               # React frontend
│   ├── src/               # Source code
├── docker-compose.yml      # Service orchestration
├── README.md              # This file
├── DECISIONS.md           # Engineering decisions
├── CONTRIBUTING.md        # Contribution guidelines
├── EVALUATION.md          # Testing guide
└── LICENSE                # MIT license
```

## 🔧 Configuration

### Environment Variables

#### Backend
- `ENVIRONMENT`: Set to `development` or `production`
- `DATABASE_URL`: SQLite database path (default: `energy_trading.db`)
- `MARKET_PROVIDER`: Choose `mock`

#### Frontend
- `REACT_APP_API_URL`: Backend API endpoint
- `REACT_APP_WS_URL`: WebSocket endpoint for real-time updates

## 🚧 Development Roadmap

### Phase 1: Setup & Scaffolding ✅
- [x] Project structure and Git setup
- [x] FastAPI backend skeleton
- [x] React frontend
- [x] Docker containerization
- [x] Database models and relationships

### Phase 2: Core Backend Features ✅
- [x] Database models and CRUD operations
- [x] Market data providers (mock implementation)
- [x] Bidding API with validation
- [x] Clearing service with bid matching
- [x] PnL calculation service
- [x] Complete API endpoints

### Phase 3: Frontend Features 🚧
- [x] Basic page structure and routing
- [x] Dashboard layout with statistics
- [x] Bidding interface skeleton
- [x] Order management skeleton
- [x] PnL analysis skeleton
- [ ] Real-time price charts integration
- [ ] Interactive bidding interface
- [ ] Order management functionality
- [ ] PnL visualization

### Phase 4: Integration & Delivery 🚧
- [ ] End-to-end testing
- [ ] WebSocket real-time updates
- [ ] Performance optimization
- [ ] Production deployment
- [ ] CI/CD pipeline
- [ ] Comprehensive documentation

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- **FastAPI** for the high-performance backend framework
- **React** and **TypeScript** for the modern frontend
- **Arco Design** for the beautiful UI components
- **SQLModel** for the elegant database integration
- **SQLite** for lightweight, reliable data storage

---

**Note**: This is a simulation platform for educational and development purposes. It does not involve real financial transactions or energy trading.
