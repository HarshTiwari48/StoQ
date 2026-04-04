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
    clean_ticker = ticker.replace(".NS", "")
    if clean_ticker in TICKER_DATA:
        ticker_info = TICKER_DATA[clean_ticker]
        return round(float(ticker_info[2]), 2), round(float(ticker_info[3]), 4)
    else:
        return 51.5, 0.01 # Safe neutral fallback