from sqlmodel import Session, select
from datetime import datetime, timezone, date
from decimal import Decimal
from typing import List, Dict, Optional
import random

from ..models.market_data import MarketData, MarketDataType

class MarketDataService:
    """Service for managing market data and prices"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_mock_prices(self, target_date: date, data_type: MarketDataType) -> List[MarketData]:
        """Generate mock market prices for a specific date"""
        # Check if data already exists for this date and type
        existing_data = self.db.exec(
            select(MarketData).where(
                MarketData.trade_date == target_date,
                MarketData.data_type == data_type
            )
        ).all()
        
        if existing_data:
            return existing_data
        
        market_data = []
        
        # Generate 24 hourly prices
        for hour in range(24):
            # Base price varies by hour (higher during peak hours)
            if 6 <= hour <= 9 or 17 <= hour <= 21:  # Peak hours
                base_price = Decimal('60.0')  # Higher base price during peak
            else:  # Off-peak hours
                base_price = Decimal('35.0')  # Lower base price during off-peak
            
            # Add some randomness (±20%)
            variation = random.uniform(0.8, 1.2)
            price = base_price * Decimal(str(variation))
            
            # Round to 2 decimal places
            price = price.quantize(Decimal('0.01'))
            
            # Create market data record
            data_record = MarketData(
                trade_date=target_date,
                hour=hour,
                data_type=data_type,
                price=price,
                source="mock"
            )
            
            market_data.append(data_record)
        
        # Save all records
        for record in market_data:
            self.db.add(record)
        
        self.db.commit()
        
        return market_data
    
    def get_market_prices(self, target_date: date, data_type: Optional[MarketDataType] = None) -> List[MarketData]:
        """Get market prices for a specific date"""
        query = select(MarketData).where(MarketData.trade_date == target_date)
        
        if data_type:
            query = query.where(MarketData.data_type == data_type)
        
        query = query.order_by(MarketData.hour)
        
        return self.db.exec(query).all()
    
    def get_price_at_hour(self, target_date: date, hour: int, data_type: MarketDataType) -> Optional[MarketData]:
        """Get market price for a specific hour and date"""
        return self.db.exec(
            select(MarketData).where(
                MarketData.trade_date == target_date,
                MarketData.hour == hour,
                MarketData.data_type == data_type
            )
        ).first()
    
    def update_real_time_prices(self, target_date: date) -> List[MarketData]:
        """Update real-time prices (simulates 5-minute updates)"""
        # Get existing real-time data for the date
        existing_data = self.db.exec(
            select(MarketData).where(
                MarketData.trade_date == target_date,
                MarketData.data_type == MarketDataType.REAL_TIME
            )
        ).all()
        
        if not existing_data:
            # Generate initial real-time data
            return self.generate_mock_prices(target_date, MarketDataType.REAL_TIME)
        
        # Update existing prices with small variations (±5%)
        for data_record in existing_data:
            variation = random.uniform(0.95, 1.05)
            new_price = data_record.price * Decimal(str(variation))
            new_price = new_price.quantize(Decimal('0.01'))
            
            data_record.price = new_price
            data_record.timestamp = datetime.now(timezone.utc)
            
            self.db.add(data_record)
        
        self.db.commit()
        
        return existing_data
    
    def get_price_summary(self, target_date: date) -> Dict:
        """Get a summary of market prices for a date"""
        day_ahead_prices = self.get_market_prices(target_date, MarketDataType.DAY_AHEAD)
        real_time_prices = self.get_market_prices(target_date, MarketDataType.REAL_TIME)
        
        if not day_ahead_prices and not real_time_prices:
            return {"message": "No market data available for the specified date"}
        
        summary = {
            "date": target_date,
            "day_ahead": {},
            "real_time": {}
        }
        
        if day_ahead_prices:
            summary["day_ahead"] = {
                "min_price": float(min(p.price for p in day_ahead_prices)),
                "max_price": float(max(p.price for p in day_ahead_prices)),
                "avg_price": float(sum(p.price for p in day_ahead_prices) / len(day_ahead_prices)),
                "total_hours": len(day_ahead_prices)
            }
        
        if real_time_prices:
            summary["real_time"] = {
                "min_price": float(min(p.price for p in real_time_prices)),
                "max_price": float(max(p.price for p in real_time_prices)),
                "avg_price": float(sum(p.price for p in real_time_prices) / len(real_time_prices)),
                "total_hours": len(real_time_prices),
                "last_updated": real_time_prices[0].timestamp.isoformat() if real_time_prices else None
            }
        
        return summary
    
    def get_hourly_price_chart(self, target_date: date) -> Dict:
        """Get hourly price data formatted for charts"""
        day_ahead_prices = self.get_market_prices(target_date, MarketDataType.DAY_AHEAD)
        real_time_prices = self.get_market_prices(target_date, MarketDataType.REAL_TIME)
        
        chart_data = {
            "date": target_date,
            "hours": list(range(24)),
            "day_ahead_prices": [],
            "real_time_prices": []
        }
        
        # Create price arrays for each hour
        for hour in range(24):
            # Find day-ahead price for this hour
            da_price = next((p.price for p in day_ahead_prices if p.hour == hour), None)
            chart_data["day_ahead_prices"].append(float(da_price) if da_price else None)
            
            # Find real-time price for this hour
            rt_price = next((p.price for p in real_time_prices if p.hour == hour), None)
            chart_data["real_time_prices"].append(float(rt_price) if rt_price else None)
        
        return chart_data
