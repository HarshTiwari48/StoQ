from schemas import FinalReport, DomainGroup

SECTOR_MAP = {
    # IT & Tech
    "TCS": "IT & Technology", "INFY": "IT & Technology", "WIPRO": "IT & Technology", 
    "HCLTECH": "IT & Technology", "TECHM": "IT & Technology", "LTIM": "IT & Technology",
    "COFORGE": "IT & Technology", "PERSISTENT": "IT & Technology", "MPHASIS": "IT & Technology",
    "TATAELXSI": "IT & Technology",
    
    # Banking, Finance & Insurance
    "HDFCBANK": "Banking & Finance", "ICICIBANK": "Banking & Finance", "SBIN": "Banking & Finance",
    "AXISBANK": "Banking & Finance", "KOTAKBANK": "Banking & Finance", "BANKBARODA": "Banking & Finance",
    "INDUSINDBK": "Banking & Finance", "FEDERALBNK": "Banking & Finance", "IDFCFIRSTB": "Banking & Finance",
    "PNB": "Banking & Finance", "CANBK": "Banking & Finance", "BAJFINANCE": "Banking & Finance",
    "BAJAJFINSV": "Banking & Finance", "JIOFIN": "Banking & Finance", "IREDA": "Banking & Finance",
    "IRFC": "Banking & Finance", "PFC": "Banking & Finance", "RECLTD": "Banking & Finance", 
    "ABCAPITAL": "Banking & Finance", "AUBANK": "Banking & Finance", "BANDHANBNK": "Banking & Finance",
    "BSE": "Banking & Finance", "CDSL": "Banking & Finance", "CHOLAFIN": "Banking & Finance",
    "HDFCLIFE": "Banking & Finance", "ICICIGI": "Banking & Finance", "LICI": "Banking & Finance",
    "MCX": "Banking & Finance", "MUTHOOTFIN": "Banking & Finance", "YESBANK": "Banking & Finance",
    
    # Automobile & Auto Components
    "TATAMOTORS": "Automobile & Auto Components", "M&M": "Automobile & Auto Components",
    "MARUTI": "Automobile & Auto Components", "BAJAJ-AUTO": "Automobile & Auto Components",
    "HEROMOTOCO": "Automobile & Auto Components", "TVSMOTOR": "Automobile & Auto Components",
    "EICHERMOT": "Automobile & Auto Components", "ASHOKLEY": "Automobile & Auto Components",
    "BHARATFORG": "Automobile & Auto Components", "BALKRISIND": "Automobile & Auto Components",
    "BOSCHLTD": "Automobile & Auto Components", "MRF": "Automobile & Auto Components",
    
    # Energy, Oil, Gas & Power
    "RELIANCE": "Energy & Oil", "ONGC": "Energy & Oil", "BPCL": "Energy & Oil", 
    "IOC": "Energy & Oil", "HINDPETRO": "Energy & Oil", "OIL": "Energy & Oil",
    "GAIL": "Energy & Oil", "COALINDIA": "Energy & Oil", "SUZLON": "Energy & Oil",
    "ADANIGREEN": "Energy & Oil", "NHPC": "Energy & Oil", "SJVN": "Energy & Oil",
    "TATAPOWER": "Energy & Oil", "ADANIPOWER": "Energy & Oil", "ATGL": "Energy & Oil",
    "IGL": "Energy & Oil", "MGL": "Energy & Oil",
    
    # FMCG & Retail
    "ITC": "FMCG & Retail", "HINDUNILVR": "FMCG & Retail", "NESTLEIND": "FMCG & Retail",
    "BRITANNIA": "FMCG & Retail", "TATACONSUM": "FMCG & Retail", "GODREJCP": "FMCG & Retail",
    "DABUR": "FMCG & Retail", "MARICO": "FMCG & Retail", "COLPAL": "FMCG & Retail",
    "VBL": "FMCG & Retail", "TRENT": "FMCG & Retail", "DMART": "FMCG & Retail", 
    "ZOMATO": "FMCG & Retail", "SWIGGY": "FMCG & Retail", "NYKAA": "FMCG & Retail",
    "HONASA": "FMCG & Retail",
    
    # Pharma & Healthcare
    "SUNPHARMA": "Pharma & Healthcare", "CIPLA": "Pharma & Healthcare", "DRREDDY": "Pharma & Healthcare",
    "DIVISLAB": "Pharma & Healthcare", "LUPIN": "Pharma & Healthcare", "AUROPHARMA": "Pharma & Healthcare",
    "TORNTPHARM": "Pharma & Healthcare", "ZYDUSLIFE": "Pharma & Healthcare", "BIOCON": "Pharma & Healthcare",
    "GLENMARK": "Pharma & Healthcare", "MANKIND": "Pharma & Healthcare", "APOLLOHOSP": "Pharma & Healthcare",
    
    # Metals & Mining
    "TATASTEEL": "Metals & Mining", "JINDALSTEL": "Metals & Mining", "JSWSTEEL": "Metals & Mining",
    "HINDALCO": "Metals & Mining", "VEDL": "Metals & Mining", "SAIL": "Metals & Mining",
    "NMDC": "Metals & Mining", "NATIONALUM": "Metals & Mining", "HINDZINC": "Metals & Mining",
    
    # Real Estate, Infrastructure & Cement
    "DLF": "Real Estate & Infrastructure", "GODREJPROP": "Real Estate & Infrastructure", 
    "LODHA": "Real Estate & Infrastructure", "OBEROIRLTY": "Real Estate & Infrastructure",
    "PRESTIGE": "Real Estate & Infrastructure", "BRIGADE": "Real Estate & Infrastructure",
    "SOBHA": "Real Estate & Infrastructure", "PHOENIXLTD": "Real Estate & Infrastructure",
    "AMBUJACEM": "Real Estate & Infrastructure", "ACC": "Real Estate & Infrastructure",
    "SHREECEM": "Real Estate & Infrastructure", "GMRINFRA": "Real Estate & Infrastructure",
    "NBCC": "Real Estate & Infrastructure",
    
    # Defense & Aviation
    "HAL": "Defense & Aviation", "BEL": "Defense & Aviation", "MAZDOCK": "Defense & Aviation",
    "RVNL": "Defense & Aviation", "INDIGO": "Defense & Aviation", "SOLARINDS": "Defense & Aviation",
    
    # Telecom & Media
    "BHARTIARTL": "Telecom & Media", "IDEA": "Telecom & Media", "INDUSTOWER": "Telecom & Media", 
    "ZEEL": "Telecom & Media",
    
    # Chemicals & Fertilizers
    "PIDILITIND": "Chemicals & Fertilizers", "TATACHEM": "Chemicals & Fertilizers", "UPL": "Chemicals & Fertilizers",
    
    # Capital Goods & Engineering
    "LT": "Capital Goods & Engineering", "BHEL": "Capital Goods & Engineering", "CUMMINSIND": "Capital Goods & Engineering",
    
    # Logistics
    "CONCOR": "Logistics", "DELHIVERY": "Logistics",
    
    # Consumer Durables
    "TITAN": "Consumer Durables", "ASIANPAINT": "Consumer Durables", "DIXON": "Consumer Durables", 
    "POLYCAB": "Consumer Durables", "HAVELLS": "Consumer Durables", "VOLTAS": "Consumer Durables",
    
    # Travel & Hospitality
    "IRCTC": "Travel & Hospitality", "IHCL": "Travel & Hospitality",
    
    # Miscellaneous / Specialized
    "PAYTM": "Tech & Payments", 
    "ADANIENT": "Conglomerates"
}

def presenter_agent(analyzed_stocks: list, news_text: str) -> FinalReport:
    """
    Sorts stocks by confidence, categorizes them by domain, and packages the API response.
    """
    
    # 1. Sort stocks by highest confidence first
    sorted_stocks = sorted(
        analyzed_stocks, 
        key=lambda stock: stock.confidence_score, 
        reverse=True
    )
    
    # 2. Group them into a dictionary based on their Domain
    grouped_data = {}
    for stock in sorted_stocks:
        # Get the domain from our map, default to "General Market" if not found
        domain_name = SECTOR_MAP.get(stock.ticker, "General Market")
        
        if domain_name not in grouped_data:
            grouped_data[domain_name] = []
            
        grouped_data[domain_name].append(stock)
        
    # 3. Convert the grouped dictionary into our Pydantic schema
    domain_groups = []
    for domain, stocks in grouped_data.items():
        domain_groups.append(DomainGroup(domain=domain, stocks=stocks))
        
    # 4. Return the fully populated FinalReport matching your exact schema
    return FinalReport(
        status="Success",
        analyzed_news=news_text,
        impacted_domains=domain_groups
    )