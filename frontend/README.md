# Energy Trading Platform Frontend

A modern React application for the Virtual Energy Trading Platform, built with TypeScript and featuring real-time data visualization.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time statistics and price charts
- **Bidding Interface**: 24-hour market grid with bid placement
- **Orders Management**: Contract and bid tracking with filtering
- **PnL Analysis**: Profit & Loss visualization with charts

### Technical Features
- **React 19** with TypeScript for type safety
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API communication
- **Responsive Design** for all devices
- **Real-time Updates** with polling

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.tsx      # Main layout with navigation
│   └── Layout.css      # Layout styles
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Dashboard.css   # Dashboard styles
│   ├── Bidding.tsx     # Bidding interface
│   ├── Bidding.css     # Bidding styles
│   ├── Orders.tsx      # Orders management
│   ├── Orders.css      # Orders styles
│   ├── PnL.tsx         # PnL analysis
│   └── PnL.css         # PnL styles
├── services/           # API services
│   └── api.ts          # API client and types
├── App.tsx             # Main app component
├── App.css             # Global styles
└── main.tsx            # Entry point
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm start
```
The app will be available at http://localhost:3000

### Build for Production
```bash
npm run build
```

### Testing
```bash
npm test
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

### API Integration
The frontend communicates with the backend API through the `api.ts` service:

- **Base URL**: Configurable via `REACT_APP_API_URL`
- **Endpoints**: All backend endpoints are available
- **Error Handling**: Comprehensive error handling with user feedback
- **Real-time Updates**: 30-second polling for live data

## 🎨 Design System

### Colors
- **Primary**: Linear gradient (#667eea to #764ba2)
- **Success**: #4caf50
- **Warning**: #ff9800
- **Error**: #f44336
- **Background**: #f5f5f5

### Components
- **Cards**: White background with subtle shadows
- **Buttons**: Gradient primary buttons with hover effects
- **Tables**: Responsive grid-based tables
- **Charts**: Interactive Recharts components

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## 🚀 Deployment

### Docker
```bash
docker build -t energy-trading-frontend .
docker run -p 3000:80 energy-trading-frontend
```

### Production Build
```bash
npm run build
```
The build output is optimized for production with:
- Minified JavaScript and CSS
- Optimized assets
- Gzip compression ready

## 🔗 API Endpoints

The frontend integrates with these backend endpoints:

- `GET /api/health` - Health check
- `GET /api/bids/` - Get user bids
- `POST /api/bids/` - Create new bid
- `GET /api/contracts/` - Get contracts
- `GET /api/pnl/` - Get PnL data
- `GET /api/market-data/` - Get market data
- `POST /api/clear/` - Trigger market clearing

## 🧪 Testing

The application includes:
- **Unit Tests**: React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Ready for Playwright integration

## 📈 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading**: Skeleton loaders and loading states
- **Caching**: Browser caching for static assets
- **Compression**: Gzip compression enabled

## 🔒 Security

- **CORS**: Configured for development and production
- **Headers**: Security headers via nginx
- **Validation**: Client-side form validation
- **Sanitization**: Input sanitization for user data

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Include responsive design considerations
4. Test on multiple devices
5. Update documentation as needed

## 📄 License

MIT License - see LICENSE file for details
