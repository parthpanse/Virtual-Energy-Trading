from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Dict
from datetime import date, datetime

from ..database import get_session
from ..services.market_data_service import MarketDataService
from ..models.market_data import MarketDataType

router = APIRouter(prefix="/api/market", tags=["market_data"])

# @router.post("/generate/", status_code=200)
# async def generate_market_data(
#     target_date: str = Query(..., description="Date to generate data for (YYYY-MM-DD)"),
#     data_type: MarketDataType = Query(..., description="Type of market data to generate"),
#     db: Session = Depends(get_session)
# ):
#     """Generate mock market data for a specific date"""
#     market_service = MarketDataService(db)

#     try:
#         # Parse the date
#         parsed_date = date.fromisoformat(target_date)

#         # Generate market data
#         market_data = market_service.generate_mock_prices(parsed_date, data_type)

#         return {
#             "message": f"Market data generated for {target_date}",
#             "date": target_date,
#             "data_type": data_type,
#             "records_created": len(market_data)
#         }
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", status_code=200)
async def generate_market_data_post(
    request_data: dict,
    db: Session = Depends(get_session)
):
    """Generate mock market data for a specific date (POST with JSON body)"""
    market_service = MarketDataService(db)

    try:
        target_date = request_data.get("date")
        data_type = request_data.get("data_type")

        if not target_date or not data_type:
            raise HTTPException(status_code=400, detail="Both 'date' and 'data_type' are required")

        # Parse the date
        parsed_date = date.fromisoformat(target_date)

        # Generate market data
        market_data = market_service.generate_mock_prices(parsed_date, data_type)

        return {
            "message": f"Market data generated for {target_date}",
            "date": target_date,
            "data_type": data_type,
            "records_created": len(market_data)
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/prices/", status_code=200)
async def get_market_prices(
    target_date: str = Query(..., description="Date to get prices for (YYYY-MM-DD)"),
    data_type: MarketDataType = Query(None, description="Type of market data to retrieve"),
    db: Session = Depends(get_session)
):
    """Get market prices for a specific date"""
    market_service = MarketDataService(db)

    try:
        # Parse the date - handle both date and datetime formats
        try:
            # Try to parse as date first
            from datetime import date as date_class
            parsed_date = date_class.fromisoformat(target_date)
        except ValueError:
            try:
                # Try to parse as datetime and extract date
                parsed_datetime = datetime.fromisoformat(target_date)
                parsed_date = parsed_datetime.date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS")

        # Get market prices
        prices = market_service.get_market_prices(parsed_date, data_type)

        return {
            "date": target_date,
            "data_type": data_type,
            "prices": prices
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#Generate Data if does not exist
@router.get("/", status_code=200)
async def get_market_data_root(
    target_date: str = Query(None, description="Date to get prices for (YYYY-MM-DD)"),
    data_type: MarketDataType = Query(None, description="Type of market data to retrieve"),
    db: Session = Depends(get_session)
):
    """Get market data - if no date provided, uses today's date and generates data"""
    market_service = MarketDataService(db)

    try:
        # Use today's date if none provided
        if not target_date:
            from datetime import datetime
            target_date = datetime.now().strftime("%Y-%m-%d")

        # Parse the date - handle both date and datetime formats
        try:
            # Try to parse as date first
            from datetime import date as date_class
            parsed_date = date_class.fromisoformat(target_date)
        except ValueError:
            try:
                # Try to parse as datetime and extract date
                parsed_datetime = datetime.fromisoformat(target_date)
                parsed_date = parsed_datetime.date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS")

        # Get market prices
        prices = market_service.get_market_prices(parsed_date, data_type)

        # If no prices exist, generate some mock data
        if not prices:
            # Generate both day-ahead and real-time data
            day_ahead_data = market_service.generate_mock_prices(parsed_date, MarketDataType.DAY_AHEAD)
            real_time_data = market_service.generate_mock_prices(parsed_date, MarketDataType.REAL_TIME)

            return {
                "date": target_date,
                "data_type": "BOTH",
                "message": "Generated mock data since none existed",
                "day_ahead_prices": len(day_ahead_data),
                "real_time_prices": len(real_time_data),
                "total_records": len(day_ahead_data) + len(real_time_data)
            }

        return {
            "date": target_date,
            "data_type": data_type,
            "prices": prices
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/price/{hour}/", status_code=200)
async def get_price_at_hour(
    hour: int,
    target_date: str = Query(..., description="Date to get price for (YYYY-MM-DD)"),
    data_type: MarketDataType = Query(..., description="Type of market data to retrieve"),
    db: Session = Depends(get_session)
):
    """Get market price for a specific hour and date"""
    market_service = MarketDataService(db)

    try:
        # Validate hour
        if hour < 0 or hour > 23:
            raise HTTPException(status_code=400, detail="Hour must be between 0 and 23")

        # Parse the date - handle both date and datetime formats
        try:
            # Try to parse as date first
            from datetime import date as date_class
            parsed_date = date_class.fromisoformat(target_date)
        except ValueError:
            try:
                # Try to parse as datetime and extract date
                parsed_datetime = datetime.fromisoformat(target_date)
                parsed_date = parsed_datetime.date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS")

        # Get price at specific hour
        price_data = market_service.get_price_at_hour(parsed_date, hour, data_type)

        if not price_data:
            raise HTTPException(status_code=404, detail="Price data not found for the specified hour and date")

        return price_data
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update-realtime/", status_code=200)
async def update_real_time_prices(
    target_date: str = Query(..., description="Date to update prices for (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Update real-time prices (simulates 5-minute updates)"""
    market_service = MarketDataService(db)

    try:
        # Parse the date - handle both date and datetime formats
        try:
            # Try to parse as date first
            from datetime import date as date_class
            parsed_date = date_class.fromisoformat(target_date)
        except ValueError:
            try:
                # Try to parse as datetime and extract date
                parsed_datetime = datetime.fromisoformat(target_date)
                parsed_date = parsed_datetime.date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS")

        # Update real-time prices
        updated_prices = market_service.update_real_time_prices(parsed_date)

        return {
            "message": f"Real-time prices updated for {target_date}",
            "date": target_date,
            "records_updated": len(updated_prices)
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/", status_code=200)
async def get_price_summary(
    target_date: str = Query(..., description="Date to get summary for (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Get a summary of market prices for a date"""
    market_service = MarketDataService(db)

    try:
        # Parse the date - handle both date and datetime formats
        try:
            # Try to parse as date first
            from datetime import date as date_class
            parsed_date = date_class.fromisoformat(target_date)
        except ValueError:
            try:
                # Try to parse as datetime and extract date
                parsed_datetime = datetime.fromisoformat(target_date)
                parsed_date = parsed_datetime.date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS")

        # Get price summary
        summary = market_service.get_price_summary(parsed_date)

        return summary
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chart/", status_code=200)
async def get_hourly_price_chart(
    target_date: str = Query(..., description="Date to get chart data for (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Get hourly price data formatted for charts"""
    market_service = MarketDataService(db)

    try:
        # Parse the date - handle both date and datetime formats
        try:
            # Try to parse as date first
            from datetime import date as date_class
            parsed_date = date_class.fromisoformat(target_date)
        except ValueError:
            try:
                # Try to parse as datetime and extract date
                parsed_datetime = datetime.fromisoformat(target_date)
                parsed_date = parsed_datetime.date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS")

        # Get chart data
        chart_data = market_service.get_hourly_price_chart(parsed_date)

        return chart_data
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
