import pandas as pd
import numpy as np
import xgboost as xgb
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from openai_agent import isolate_context
from schemas import ProcessedStock, StockMetrics
from ticker_data import TICKER_DATA

print("--- [SYSTEM] Initializing Dual-Engine Quant Architecture ---")
# Engine 1: Stacking Ensemble Weights
ml_model = xgb.XGBClassifier()
ml_model.load_model('model_output.json')

# Engine 2: Contextual NLP
tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
fb_model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
nlp = pipeline("sentiment-analysis", model=fb_model, tokenizer=tokenizer)

# Hardcoded source map to match training data pipeline
SOURCE_MAP = {"Reuters": 1.0, "Economic Times": 0.9, "Moneycontrol": 0.85, "Bloomberg": 1.0, "Mint": 0.8}
print("--- [SYSTEM] Models Active ---")

def get_live_technicals(ticker: str):
    """Bypasses external rate limits; queries local cache for expanded technicals."""
    clean_ticker = ticker.replace(".NS", "")
    
    if clean_ticker in TICKER_DATA:
        ticker_info = TICKER_DATA[clean_ticker]
        
        sector = ticker_info[1] if len(ticker_info) > 1 else "Unknown"
        rsi = float(ticker_info[2]) if len(ticker_info) > 2 else 50.0
        macd = float(ticker_info[3]) if len(ticker_info) > 3 else 0.0
        ma5 = float(ticker_info[4]) if len(ticker_info) > 4 else 1.0
        ma20 = float(ticker_info[5]) if len(ticker_info) > 5 else 1.0
        volatility = float(ticker_info[6]) if len(ticker_info) > 6 else 1.5
        vol_change = float(ticker_info[7]) if len(ticker_info) > 7 else 0.0
        
        return sector, rsi, macd, ma5, ma20, volatility, vol_change
    else:
        return "Unknown", 51.5, 0.01, 1.0, 1.0, 1.5, 0.0

def quant_agent(ticker: str, news_text: str, news_source: str = "Reuters") -> ProcessedStock:
    """Executes a 3-factor dynamic blend: NLP Sentiment, Ensemble ML Probability, and Deterministic Technicals."""
    
    # --- PHASE 1: Targeted NLP Extraction ---
    targeted_news = isolate_context(ticker, news_text)
    nlp_res = nlp(targeted_news[:512])[0]
    
    sentiment = nlp_res['score'] if nlp_res['label'] == 'positive' else -nlp_res['score'] if nlp_res['label'] == 'negative' else 0.0
    sentiment = round(sentiment, 4)

    # --- PHASE 2: Comprehensive Data Acquisition ---
    sector, rsi, macd, ma5, ma20, volatility, vol_change = get_live_technicals(ticker)
    
    if rsi is None:
        return ProcessedStock(
            ticker=ticker, signal="HOLD / UNCLEAR", confidence_score=0.50,
            reasoning="SYS_WARN: Target vector data missing. Defaulting to risk-neutral HOLD.",
            data=StockMetrics(rsi=50.0, macd=0.0, sentiment=sentiment)
        )

    # --- PHASE 3: Deterministic Failsafe (Classic Technical Score) ---
    rsi_norm = (rsi - 50) / 50.0
    macd_norm = max(-1.0, min(1.0, macd / 10.0)) 
    classic_tech_score = (rsi_norm * 0.70) + (macd_norm * 0.30)

    # --- PHASE 4: Deep Learning Feature Construction & Inference ---
    finbert_score = nlp_res['score']
    finbert_encoded = 1 if nlp_res['label'] == 'positive' else -1 if nlp_res['label'] == 'negative' else 0
    src_weight = SOURCE_MAP.get(news_source, 0.5)

    # Assemble the exact feature vector trained in the Stacking Ensemble
    input_df = pd.DataFrame([[
        sentiment, finbert_score, src_weight, finbert_encoded, 
        ma5, ma20, rsi, volatility, vol_change
    ]], columns=[
        'sentiment_score', 'finbert_score', 'src', 'f', 
        'MA5', 'MA20', 'RSI14', 'Volatility', 'Volume_change'
    ])
    
    # Extract the probability of class '2' (Bullish) from the XGBoost output array
    raw_prob_buy = float(ml_model.predict_proba(input_df)[0][2])
    
    # Map raw probability to momentum vector (-1 to 1)
    ensemble_score = (raw_prob_buy * 2) - 1.0

    # --- PHASE 5: The Dynamic Risk Blender (70/30 Cap) ---
    abs_sent = abs(sentiment)
    
    if abs_sent >= 0.80:
        # Extreme Sentiment: Cap technicals, give 70% weight to news
        news_wt, ml_wt, tech_wt = 0.70, 0.20, 0.10 
        state = "IMPACT CAP TRIGGERED: News Dominance"
    elif abs_sent >= 0.50:
        news_wt, ml_wt, tech_wt = 0.40, 0.40, 0.20 
        state = "Standard Market Blend"
    else:
        news_wt, ml_wt, tech_wt = 0.10, 0.60, 0.30 
        state = "Ensemble-Led Analysis"
        
    blended_score = (sentiment * news_wt) + (ensemble_score * ml_wt) + (classic_tech_score * tech_wt)

    # --- PHASE 6: Confidence Scaling ---
    if blended_score > 0:
        raw_signal = "BUY"
        final_conf = 0.50 + (blended_score * 0.48) 
    else:
        raw_signal = "SELL"
        final_conf = 0.50 + (abs(blended_score) * 0.48) 
    
    # --- PHASE 7: Output Thresholds ---
    if final_conf >= 0.76:
        final_signal = f"STRONG {raw_signal}"
    elif final_conf < 0.52:
        final_signal = "HOLD / UNCLEAR"
    else:
        final_signal = raw_signal

    # --- PHASE 8: Audit Formatting ---
    reasoning = f"{state}. ML Prob: {round(raw_prob_buy*100,1)}% | Chart: {round(classic_tech_score, 2)} | NLP: {round(sentiment, 2)}."
    
    if final_conf < 0.52:
        reasoning += " (RISK MANAGER: Mixed signals resulted in a risk-neutral HOLD)."

    return ProcessedStock(
        ticker=ticker,
        signal=final_signal,
        confidence_score=round(float(final_conf), 4),
        reasoning=reasoning,
        data=StockMetrics(rsi=rsi, macd=macd, sentiment=sentiment)
    )