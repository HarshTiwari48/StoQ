import pandas as pd
import xgboost as xgb
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from schemas import ProcessedStock, StockMetrics

print("--- [SYSTEM] Loading Quant Models ---")
ml_model = xgb.XGBClassifier()
ml_model.load_model('model_output.json')

tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
fb_model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
nlp = pipeline("sentiment-analysis", model=fb_model, tokenizer=tokenizer)