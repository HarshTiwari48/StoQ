import pandas as pd
import xgboost as xgb
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from openai_agent import isolate_context # We will build this next
from schemas import ProcessedStock, StockMetrics
from ticker_data import TICKER_DATA

print("--- [SYSTEM] Loading Quant Models ---")
ml_model = xgb.XGBClassifier()
ml_model.load_model('model_output.json')

tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
fb_model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
nlp = pipeline("sentiment-analysis", model=fb_model, tokenizer=tokenizer)

def get_live_technicals(ticker: str):
    """
    Fetches RSI and MACD from the local TICKER_DATA cache.
    Bypasses the Yahoo Finance block on Hugging Face.
    """
    # remove .NS attached
    clean_ticker = ticker.replace(".NS", "")
    
    if clean_ticker in TICKER_DATA:
        # Extract the values from your tuple (Price, Change, RSI, MACD) in ticker_data
        ticker_info = TICKER_DATA[clean_ticker]
        rsi = ticker_info[2]
        macd_line = ticker_info[3]
        
        return round(float(rsi), 2), round(float(macd_line), 4)
    else:
        print(f"[WARN] {clean_ticker} not found in local TICKER_DATA cache.")
        # Returns  so your fallback logic in quant_agent triggers perfectly
        return 51.5, 0.01