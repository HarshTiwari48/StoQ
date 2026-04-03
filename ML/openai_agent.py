import os
import re
from dotenv import load_dotenv
from openai import OpenAI

# Load API Key
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

def extraction_agent(news_text: str) -> dict:
    """Flexible Extraction: Broadly maps sectors and related companies without being overly strict."""
    prompt = f"""
    You are a Financial Analyst AI.
    News: "{news_text}"
    Target List: {VALID_STOCKS}
    
    Task: Identify which stocks from the Target List are impacted by this news. Be broad and flexible.
    
    Guidelines:
    1. Direct Mention (Weight 1.0): The company is named.
    2. Sector/Industry Mention (Weight 0.7-0.9): If a sector is mentioned (e.g., 'EVs', 'Banks', 'FMCG'), pull 3-5 top stocks from that sector.
    3. Competitors/Supply Chain (Weight 0.5-0.7): If a company is mentioned, also include its direct competitors or suppliers from the list.
    
    Format EXACTLY like this: TICKER|WEIGHT, TICKER|WEIGHT
    Example: ZOMATO|1.0, SWIGGY|0.9, PAYTM|0.6
    If completely irrelevant to Indian markets, return NONE.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You broadly map macroeconomic and business news to relevant stock tickers."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3  # Increased for better flexibility and sector mapping
        )
        result = response.choices[0].message.content.strip().upper()
        print(f"\n[DEBUG OPENAI] Extracted: '{result}'")
        
        if "NONE" in result or not result:
            return {}
        
        extracted_dict = {}
        for pair in result.split(','):
            parts = pair.split('|')
            if len(parts) == 2:
                clean_ticker = re.sub(r'[^A-Z0-9\-&]', '', parts[0])
                try:
                    weight = float(parts[1].strip())
                    if clean_ticker in VALID_STOCKS:
                        extracted_dict[clean_ticker] = weight
                except ValueError:
                    continue
                    
        # Sort and cap at a reasonable limit
        sorted_items = sorted(extracted_dict.items(), key=lambda item: item[1], reverse=True)
        return dict(sorted_items[:12])
        
    except Exception as e:
        print(f"[ERROR] Extraction failed: {e}")
        return {}


def isolate_context(ticker: str, news_text: str) -> str:
    """Forces a clean summary focusing on absolute business impact."""
    prompt = f"""
    News: "{news_text}"
    Target Stock: {ticker}
    
    Task: Explain how this news affects {ticker} in exactly ONE sentence. 
    Focus on the absolute business impact (revenue, growth, operations) rather than just who 'won' a headline.
    
    FORMAT REQUIREMENT: You MUST start your sentence with one of these exact phrases:
    - "{ticker} is positively impacted because..."
    - "{ticker} is negatively impacted because..."
    - "{ticker} is unaffected because..."
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0  # Kept at 0.0 so the format strings never break
        )
        return response.choices[0].message.content.strip()
    except:
        return news_text