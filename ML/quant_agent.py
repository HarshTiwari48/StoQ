import pandas as pd
import xgboost as xgb
import yfinance as yf
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from datetime import datetime, timedelta
import random
import time
import requests
from openai_agent import isolate_context
from schemas import ProcessedStock, StockMetrics
from ticker_data import TICKER_DATA
print("--- [SYSTEM] Loading Quant Models ---")
ml_model = xgb.XGBClassifier()
ml_model.load_model('model_output.json')

tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
fb_model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
nlp = pipeline("sentiment-analysis", model=fb_model, tokenizer=tokenizer)
print("--- [SYSTEM] Ready ---")

def get_live_technicals(ticker: str):
    """
    Fetches RSI and MACD from the local TICKER_DATA cache.
    Bypasses the Yahoo Finance block on Hugging Face.
    """

    clean_ticker = ticker.replace(".NS", "")
    
    if clean_ticker in TICKER_DATA:
       
        ticker_info = TICKER_DATA[clean_ticker]
        rsi = ticker_info[2]
        macd_line = ticker_info[3]
        
        return round(float(rsi), 2), round(float(macd_line), 4)
    else:
        print(f"[WARN] {clean_ticker} not found in local TICKER_DATA cache.")

        return 51.5, 0.01

    

def quant_agent(ticker: str, news_text: str, ai_weight: float = 1.0) -> ProcessedStock:
    """Uses Weighted Dynamic Blending with Normalized Technicals."""
    
    targeted_news = isolate_context(ticker, news_text)
    nlp_res = nlp(targeted_news[:512])[0]
    
    sentiment = nlp_res['score'] if nlp_res['label'] == 'positive' else -nlp_res['score'] if nlp_res['label'] == 'negative' else 0.0
    sentiment = round(sentiment, 4)

    rsi, macd = get_live_technicals(ticker)
    
    if rsi is None:
        return ProcessedStock(
            ticker=ticker,
            signal="HOLD / UNCLEAR",
            confidence_score=0.50,
            reasoning="WARNING: Live chart data fetch failed after retries. Defaulting to HOLD.",
            data=StockMetrics(rsi=50.0, macd=0.0, sentiment=sentiment)
        )
    input_df = pd.DataFrame([[rsi, macd, sentiment]], columns=['rsi', 'macd_line', 'sentiment_score'])
    raw_prob_buy = float(ml_model.predict_proba(input_df)[0][1])
    
    base_tech = (raw_prob_buy * 2) - 1
    tech_score = base_tech
    tech_score = max(-1.0, min(1.0, tech_score))

    abs_sent = abs(sentiment)
    
    if abs_sent >= 0.80:
        news_wt, tech_wt = 0.70, 0.30 
        state = "Big news is strongly affecting this stock right now"
    elif abs_sent >= 0.50:
        news_wt, tech_wt = 0.55, 0.45 
        state = "News-led market blend"
    else:
        news_wt, tech_wt = 0.25, 0.75 
        state = "Technical chart-led analysis"
        
    blended_score = (tech_score * tech_wt) + (sentiment * news_wt)

    if blended_score > 0:
        raw_signal = "BUY"
        conf = 0.50 + (blended_score * 0.48) 
    else:
        raw_signal = "SELL"
        conf = 0.50 + (abs(blended_score) * 0.48) 

    final_conf = conf * ai_weight

    if final_conf >= 0.76 and ai_weight == 1.0:
        final_signal = f"STRONG {raw_signal}"
    elif final_conf < 0.52:
        final_signal = "HOLD / UNCLEAR"
    else:
        final_signal = raw_signal

    reasoning = f"BLEND MODEL: {state}. Tech Score: {round(tech_score, 3)} | NLP Score: {round(sentiment, 3)}."
    
    if ai_weight < 1.0 and final_conf >= 0.52:
        reasoning += f" (Confidence penalized to {round(final_conf*100)}% due to indirect AI inference)."
    elif final_conf < 0.52:
        reasoning += " (WARNING: Conflicting data and AI penalty resulted in a HOLD)."

    return ProcessedStock(
        ticker=ticker,
        signal=final_signal,
        confidence_score=round(float(final_conf), 4),
        reasoning=reasoning,
        data=StockMetrics(rsi=rsi, macd=macd, sentiment=sentiment)
    )