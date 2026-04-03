import yfinance as yf
import pandas as pd
import os

VALID_STOCKS = [
    "ABCAPITAL","ACC","ADANIENT","ADANIGREEN","ADANIPOWER","AMBUJACEM",
    "APOLLOHOSP","ASHOKLEY","ASIANPAINT","ATGL","AUBANK","AUROPHARMA",
    "AXISBANK","BAJAJ-AUTO","BAJAJFINSV","BAJFINANCE","BALKRISIND",
    "BANDHANBNK","BANKBARODA","BEL","BHARATFORG","BHARTIARTL","BHEL",
    "BIOCON","BOSCHLTD","BPCL","BRIGADE","BRITANNIA","BSE","CANBK",
    "CDSL","CHOLAFIN","CIPLA","COALINDIA","COFORGE","COLPAL","CONCOR",
    "CUMMINSIND","DABUR","DELHIVERY","DIVISLAB","DIXON","DLF","DMART",
    "DRREDDY","EICHERMOT","FEDERALBNK","GAIL","GLENMARK","GODREJCP",
    "GODREJPROP","HAL","HAVELLS","HCLTECH","HDFCBANK","HDFCLIFE",
    "HEROMOTOCO","HINDALCO","HINDPETRO","HINDUNILVR","HINDZINC",
    "HONASA","ICICIBANK","ICICIGI","IDEA","IDFCFIRSTB","IGL","INDIGO",
    "INDUSTOWER","INDUSINDBK","INFY","IOC","IRCTC","IREDA","IRFC","ITC",
    "JINDALSTEL","JIOFIN","JSWSTEEL","KOTAKBANK","LICI","LT","LTIM",
    "M&M","MANKIND","MARICO","MARUTI","MAZDOCK","MCX","MGL","MPHASIS",
    "MRF","MUTHOOTFIN","NATIONALUM","NBCC","NESTLEIND","NHPC","NMDC",
    "NYKAA","OBEROIRLTY","OIL","ONGC","PAYTM","PERSISTENT","PFC",
    "PHOENIXLTD","PIDILITIND","PNB","PRESTIGE","RECLTD","RELIANCE",
    "RVNL","SAIL","SBIN","SHREECEM","SJVN","SOBHA","SOLARINDS",
    "SUNPHARMA","SUZLON","SWIGGY","TATACONSUM","TATACHEM","TATAELXSI",
    "TATAPOWER","TATASTEEL","TECHM","TITAN","TORNTPHARM","TRENT",
    "TVSMOTOR","UPL","VBL","VEDL","VOLTAS","YESBANK","ZEEL","ZYDUSLIFE"
]

def generate_ticker_data():
    results = {}
    print(f"Fetching data for {len(VALID_STOCKS)} tickers...")

    for ticker in VALID_STOCKS:
        try:
            # period="1mo" as per your get_live_technicals function
            df = yf.download(f"{ticker}.NS", period="1mo", interval="1d", progress=False, auto_adjust=False)
            
            if not df.empty and len(df) >= 14:
                # --- EXACT LOGIC FROM YOUR PIPELINE ---
                close = df['Close']
                
                # RSI Calculation
                delta = close.diff()
                gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
                loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
                rs = gain / (loss + 1e-9)
                rsi = (100 - (100 / (1 + rs))).iloc[-1]
                
                # MACD Calculation
                exp1 = close.ewm(span=12, adjust=False).mean()
                exp2 = close.ewm(span=26, adjust=False).mean()
                macd_line = (exp1 - exp2).iloc[-1]
                
                # Current Price & Daily Change (standard for your IQ display)
                current_price = close.iloc[-1]
                price_change = current_price - close.iloc[-2]
                
                # Results formatted exactly for your dictionary
                results[ticker] = (
                    round(float(current_price), 2),
                    round(float(price_change), 4),
                    round(float(rsi), 2),
                    round(float(macd_line), 4)
                )
                print(f"SUCCESS: {ticker}")
            else:
                print(f"FAILED: {ticker} (Insufficient Data)")
        except Exception:
            continue

    # Writing to file
    with open("ticker_data.py", "w") as f:
        f.write(f"TICKER_DATA = {results}")
    
    print("\nDONE: ticker_data.py has been created with RSI and MACD.")

if __name__ == "__main__":
    generate_ticker_data()