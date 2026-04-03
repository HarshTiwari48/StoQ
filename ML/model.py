import pandas as pd
import numpy as np
import torch
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.utils import resample
import optuna
from xgboost import XGBClassifier
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
import pickle
import time
import json

import random

RANDOM_SEED = random.randint(1, 100000)

np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

print(f"\nRandom Seed Used: {RANDOM_SEED}")

optuna.logging.set_verbosity(optuna.logging.WARNING)

CUTOFF   = "2026-03-20"
USE_GPU  = torch.cuda.is_available()
N_TRIALS = 10
print(f"GPU: {USE_GPU}")

# ── LOAD DATA ────────────────────────────
print("Loading data...")
df        = pd.read_csv("processed_tabular_data.csv").dropna()
label_map = {"Bearish": 0, "Neutral": 1, "Bullish": 2}
inv_label_map = {v: k for k, v in label_map.items()}

print(f"Total rows: {len(df)}")
print(f"Label distribution:\n{df['label'].value_counts()}")

# ── TEMPORAL SPLIT ───────────────────────
df_tr = df[df['date'] <= CUTOFF].reset_index(drop=True)
df_te = df[df['date'] >  CUTOFF].reset_index(drop=True)

print(f"\nTrain: {len(df_tr)} | {df_tr['date'].min()} → {df_tr['date'].max()}")
print(f"Test:  {len(df_te)} | {df_te['date'].min()} → {df_te['date'].max()}")

# ── COMBINE + BALANCE TEST ───────────────
df_fresh = pd.read_csv("test_processed.csv").dropna()
df_te    = pd.concat([df_te, df_fresh], ignore_index=True)
min_count = df_te['label'].value_counts().min()
df_te = pd.concat([
    resample(
        df_te[df_te['label'] == cls],
        n_samples=min_count,
        random_state=RANDOM_SEED,
        replace=False
    )
    for cls in ['Bearish', 'Neutral', 'Bullish']
])

# shuffle differently each run
df_te = df_te.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)

overlap_count = len(set(df_tr['headline']).intersection(set(df_te['headline'])))
print(f"Train: {len(df_tr)} | Test: {len(df_te)}")
print(f"Overlap: {overlap_count}")
print(f"Balanced test:\n{df_te['label'].value_counts()}")

# ── FEATURE ENGINEERING ──────────────────
source_map = {"Reuters": 1.0, "Economic Times": 0.9,
              "Moneycontrol": 0.85, "Bloomberg": 1.0, "Mint": 0.8}
tech_cols  = ['MA5', 'MA20', 'RSI14', 'Volatility', 'Volume_change']

def build_features(df_input):
    d = df_input.copy()
    d['src'] = d['source'].map(lambda x: source_map.get(x, 0.5))
    d['f']   = d['finbert_label'].map(
        {"positive": 1, "neutral": 0, "negative": -1}
    ).fillna(0)
    return d[['sentiment_score', 'finbert_score',
              'src', 'f'] + tech_cols].values.astype(float)

try:
    enc = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
except TypeError:
    enc = OneHotEncoder(sparse=False, handle_unknown='ignore')

sec_tr = enc.fit_transform(df_tr[['sector']])
sec_te = enc.transform(df_te[['sector']])

scaler = StandardScaler()
X_tr   = scaler.fit_transform(np.hstack([build_features(df_tr), sec_tr]))
X_te   = scaler.transform(np.hstack([build_features(df_te), sec_te]))

y_tr = df_tr['label'].map(label_map).values
y_te = df_te['label'].map(label_map).values
print(f"\nX_tr: {X_tr.shape} | X_te: {X_te.shape}")

# ── OPTUNA FOR BASE MODELS ────────────────
def get_base_models(trial=None):
    if trial:
        xgb_p  = {
            "n_estimators":  trial.suggest_int("xgb_n",   100, 500),
            "max_depth":     trial.suggest_int("xgb_d",     3,   8),
            "learning_rate": trial.suggest_float("xgb_lr", 0.01, 0.2, log=True),
            "subsample":     trial.suggest_float("xgb_sub", 0.6, 1.0),
        }
        cat_p  = {
            "iterations":    trial.suggest_int("cat_n",   100, 500),
            "depth":         trial.suggest_int("cat_d",     3,   8),
            "learning_rate": trial.suggest_float("cat_lr", 0.01, 0.2, log=True),
        }
        lgbm_p = {
            "n_estimators":  trial.suggest_int("lgbm_n",   100, 500),
            "max_depth":     trial.suggest_int("lgbm_d",     3,   8),
            "learning_rate": trial.suggest_float("lgbm_lr", 0.01, 0.2, log=True),
            "subsample":     trial.suggest_float("lgbm_sub", 0.6, 1.0),
        }
    else:
        xgb_p  = {"n_estimators": 300, "max_depth": 6, "learning_rate": 0.05, "subsample": 0.8}
        cat_p  = {"iterations": 300, "depth": 6, "learning_rate": 0.05}
        lgbm_p = {"n_estimators": 300, "max_depth": 6, "learning_rate": 0.05, "subsample": 0.8}

    return [
        XGBClassifier(**xgb_p,
                      device="cuda" if USE_GPU else "cpu",
                      eval_metric="mlogloss", verbosity=0),
        CatBoostClassifier(**cat_p,
                           task_type="GPU" if USE_GPU else "CPU",
                           verbose=0),
        LGBMClassifier(**lgbm_p,
                       device="gpu" if USE_GPU else "cpu",
                       verbose=-1),
        RandomForestClassifier(n_estimators=200, max_depth=8,
                               random_state=RANDOM_SEED, n_jobs=-1)
    ]

def objective(trial):
    models = get_base_models(trial)
    skf    = StratifiedKFold(3, shuffle=True, random_state=RANDOM_SEED)
    accs   = []
    for t, v in skf.split(X_tr, y_tr):
        fold_preds = []
        for m in models:
            m.fit(X_tr[t], y_tr[t])
            fold_preds.append(m.predict_proba(X_tr[v]))
        avg = np.mean(fold_preds, axis=0)
        accs.append(accuracy_score(y_tr[v], avg.argmax(1)))
    return np.mean(accs)

print(f"\nRunning Optuna ({N_TRIALS} trials)...")
start = time.time()
study = optuna.create_study(
    direction="maximize",
    sampler=optuna.samplers.TPESampler(seed=RANDOM_SEED)
)
study.optimize(objective, n_trials=N_TRIALS)
optuna_time = round((time.time()-start)/60, 2)
print(f"Done in {optuna_time} min")
print(f"Best params: {study.best_params}")

# ── TRAIN FINAL BASE MODELS ──────────────
print("\nTraining final base models...")
base_models = get_base_models()
names       = ["XGBoost", "CatBoost", "LightGBM", "RandomForest"]

for name, m in zip(names, base_models):
    print(f"  Training {name}...")
    m.fit(X_tr, y_tr)

# ── STACKING — OOF META FEATURES ─────────
print("\nGenerating meta features (out-of-fold)...")
skf        = StratifiedKFold(5, shuffle=True, random_state=RANDOM_SEED)
meta_train = np.zeros((len(X_tr), len(base_models) * 3))
meta_test  = np.zeros((len(X_te), len(base_models) * 3))

for i, (name, m) in enumerate(zip(names, base_models)):
    print(f"  OOF predictions: {name}...")
    oof_preds = cross_val_predict(m, X_tr, y_tr, cv=skf, method='predict_proba')
    meta_train[:, i*3:(i+1)*3] = oof_preds
    meta_test[:,  i*3:(i+1)*3] = m.predict_proba(X_te)

print(f"Meta train shape: {meta_train.shape}")
print(f"Meta test shape:  {meta_test.shape}")

# ── META LEARNER ─────────────────────────
print("\nTraining meta learner (Logistic Regression)...")
meta_scaler = StandardScaler()
meta_tr_s   = meta_scaler.fit_transform(meta_train)
meta_te_s   = meta_scaler.transform(meta_test)

meta_model  = LogisticRegression(
    max_iter=1000, C=1.0,
    multi_class='multinomial', random_state=42
)
meta_model.fit(meta_tr_s, y_tr)

# ── EVALUATION ───────────────────────────
pred   = meta_model.predict(meta_te_s)
prob   = meta_model.predict_proba(meta_te_s)
conf   = prob.max(1)
report = classification_report(
    y_te, pred,
    target_names=["Bearish", "Neutral", "Bullish"],
    output_dict=True
)
cm = confusion_matrix(y_te, pred)

print("\n" + "="*50)
print("STACKING ENSEMBLE PERFORMANCE:")
print(classification_report(y_te, pred,
      target_names=["Bearish", "Neutral", "Bullish"]))
print(f"Confusion Matrix:\n{cm}")

individual_accs = {}
for name, m in zip(names, base_models):
    p   = m.predict(X_te)
    acc = round(accuracy_score(y_te, p) * 100, 2)
    individual_accs[name] = acc
    print(f"  {name:15s}: {acc}%")

stacked_acc = round(accuracy_score(y_te, pred) * 100, 2)
print(f"\n  Stacked Ensemble: {stacked_acc}%")

avg_conf_per_class = {}
for idx, cls_name in inv_label_map.items():
    mask = pred == idx
    if mask.sum() > 0:
        avg_conf_per_class[cls_name] = round(float(conf[mask].mean() * 100), 2)

print("\n--- SAMPLE PREDICTIONS ---")
sample_predictions = []
for i in range(min(3, len(df_te))):
    sample = {
        "headline":   str(df_te.iloc[i]['headline']),
        "sector":     str(df_te.iloc[i]['sector']),
        "actual":     inv_label_map[y_te[i]],
        "prediction": inv_label_map[pred[i]],
        "confidence": round(float(conf[i]) * 100, 2),
        "P_Bearish":  round(float(prob[i][0]), 4),
        "P_Neutral":  round(float(prob[i][1]), 4),
        "P_Bullish":  round(float(prob[i][2]), 4)
    }
    sample_predictions.append(sample)
    print(f"\nHeadline:   {sample['headline']}")
    print(f"Sector:     {sample['sector']}")
    print(f"Actual:     {sample['actual']}")
    print(f"Prediction: {sample['prediction']}")
    print(f"Confidence: {sample['confidence']}%")

# ── SAVE JSON OUTPUT ─────────────────────
output_json = {

    "model_info": {
        "architecture":     "Stacking Ensemble",
        "base_models":      names,
        "meta_learner":     "Logistic Regression",
        "train_date_range": {
            "start": str(df_tr['date'].min()),
            "end":   str(df_tr['date'].max())
        },
        "test_date_range": {
            "start": str(df_te['date'].min()),
            "end":   str(df_te['date'].max())
        },
        "train_rows":       int(len(df_tr)),
        "test_rows":        int(len(df_te)),
        "headline_overlap": int(overlap_count)
    },

    "features_used": {
        "nlp_features": {
            "sentiment_score": {
                "description": "FinBERT positive_prob minus negative_prob",
                "range":       "-1 to +1",
                "source":      "ProsusAI/finbert"
            },
            "finbert_score": {
                "description": "Confidence of FinBERT predicted class",
                "range":       "0 to 1",
                "source":      "ProsusAI/finbert"
            },
            "finbert_label_encoded": {
                "description": "positive=1, neutral=0, negative=-1",
                "range":       "-1, 0, 1",
                "source":      "ProsusAI/finbert"
            }
        },
        "technical_indicators": {
            "MA5": {
                "description": "5-day moving average normalized by current close",
                "window":      "5 days",
                "formula":     "mean(close[-5:]) / close_today"
            },
            "MA20": {
                "description": "20-day moving average normalized by current close",
                "window":      "20 days",
                "formula":     "mean(close[-20:]) / close_today"
            },
            "RSI14": {
                "description": "Relative Strength Index — overbought/oversold signal",
                "window":      "14 days",
                "range":       "0 to 100",
                "formula":     "100 - (100 / (1 + avg_gain/avg_loss))"
            },
            "Volatility": {
                "description": "Standard deviation of daily % returns",
                "window":      "10 days",
                "formula":     "std(pct_change(close[-10:]))"
            },
            "Volume_change": {
                "description": "% change in volume vs 10-day average",
                "window":      "10 days",
                "range":       "-100 to +100 clipped",
                "formula":     "((vol_today - mean_vol_10d) / mean_vol_10d) * 100"
            }
        },
        "categorical_features": {
            "sector_onehot": {
                "description": "One-hot encoded sector",
                "categories":  enc.categories_[0].tolist()
            },
            "source_credibility": {
                "description": "News source reliability score",
                "mapping":     source_map
            }
        }
    },

    "performance": {
        "stacked_ensemble_accuracy": stacked_acc,
        "individual_model_accuracy": individual_accs,
        "classification_report": {
            "Bearish": {
                "precision": round(report['Bearish']['precision'], 4),
                "recall":    round(report['Bearish']['recall'],    4),
                "f1_score":  round(report['Bearish']['f1-score'],  4),
                "support":   int(report['Bearish']['support'])
            },
            "Neutral": {
                "precision": round(report['Neutral']['precision'], 4),
                "recall":    round(report['Neutral']['recall'],    4),
                "f1_score":  round(report['Neutral']['f1-score'],  4),
                "support":   int(report['Neutral']['support'])
            },
            "Bullish": {
                "precision": round(report['Bullish']['precision'], 4),
                "recall":    round(report['Bullish']['recall'],    4),
                "f1_score":  round(report['Bullish']['f1-score'],  4),
                "support":   int(report['Bullish']['support'])
            },
            "accuracy":        round(report['accuracy'],                    4),
            "macro_avg_f1":    round(report['macro avg']['f1-score'],       4),
            "weighted_avg_f1": round(report['weighted avg']['f1-score'],    4)
        },
        "confusion_matrix":              cm.tolist(),
        "average_confidence_per_class":  avg_conf_per_class
    },

    "optuna": {
        "n_trials":     N_TRIALS,
        "best_params":  study.best_params,
        "best_value":   round(study.best_value, 4),
        "time_minutes": optuna_time
    },

    "sample_predictions": sample_predictions
}

with open("model_output.json", "w") as f:
    json.dump(output_json, f, indent=4)

print("\nmodel_output.json saved.")




print("="*50)
print("All artifacts saved:")
print("  model_output.json")

print("="*50)