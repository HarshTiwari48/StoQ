from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
import concurrent.futures
from typing import List

from schemas import IncomingNews, FinalReport, BatchArticleResult
from openai_agent import extraction_agent
from quant_agent import quant_agent
from presenter_agent import presenter_agent

app = FastAPI(title="Stock-IQ Agentic Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

LAST_REQUEST_TIME = 0.0

VALID_STOCKS = {
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
}

@app.post("/api/workflow", response_model=List[BatchArticleResult])
async def run_batch_workflow(payloads: List[IncomingNews]):
    global LAST_REQUEST_TIME
    
    # Rate limiting to protect your Hugging Face Space
    if (time.time() - LAST_REQUEST_TIME) < 1.0:
        raise HTTPException(status_code=429, detail="Cooldown active.")
    LAST_REQUEST_TIME = time.time()

    batch_results = []
    print(f"\n[SYSTEM] Received {len(payloads)} articles from Frontend.")

    for idx, payload in enumerate(payloads, start=1):
        # Using the exact names from your new schema
        combined_news_text = f"{payload.title}. {payload.description}"
        
        empty_analysis = FinalReport(
            status="Success", 
            analyzed_news=combined_news_text, 
            impacted_domains=[]
        )

        try:
            # 1. AI Extraction
            raw_tickers_dict = extraction_agent(combined_news_text)
            if not raw_tickers_dict:
                batch_results.append(BatchArticleResult(article_id=idx, source=payload.source, news_text=combined_news_text, ai_analysis=empty_analysis))
                continue

            # 2. Strict Filter
            tickers_dict = {t.strip().upper(): w for t, w in raw_tickers_dict.items() if t.strip().upper() in VALID_STOCKS}
            if not tickers_dict:
                batch_results.append(BatchArticleResult(article_id=idx, source=payload.source, news_text=combined_news_text, ai_analysis=empty_analysis))
                continue

            # 3. Quant Phase (Multi-threaded)
            analyzed_stocks = []
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                futures = {executor.submit(quant_agent, t, combined_news_text, w): t for t, w in tickers_dict.items()}
                for future in concurrent.futures.as_completed(futures):
                    try:
                        result = future.result()
                        analyzed_stocks.append(result)
                    except Exception: 
                        pass

            # 4. Presenter Phase
            if analyzed_stocks:
                report = presenter_agent(analyzed_stocks, combined_news_text)
                batch_results.append(BatchArticleResult(article_id=idx, source=payload.source, news_text=combined_news_text, ai_analysis=report))
            else:
                batch_results.append(BatchArticleResult(article_id=idx, source=payload.source, news_text=combined_news_text, ai_analysis=empty_analysis))

        except Exception as e:
            print(f"[ERROR] Critical failure on article {idx}: {e}")
            batch_results.append(BatchArticleResult(article_id=idx, source=payload.source, news_text=combined_news_text, ai_analysis=empty_analysis))

    return batch_results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)