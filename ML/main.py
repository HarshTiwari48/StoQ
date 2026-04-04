from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import IncomingNews, FinalReport
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

@app.post("/api/workflow", response_model=FinalReport)
async def run_agentic_workflow(payload: IncomingNews):
    
    combined_news_text = f"{payload.headline}. {payload.description}"

    # 1. Extraction Phase
    tickers_dict = extraction_agent(combined_news_text)
    if not tickers_dict:
        raise HTTPException(status_code=404, detail="No stocks identified")

    # 2. Sequential Quant Processing
    analyzed_stocks = []
    for ticker, weight in tickers_dict.items():
        result = quant_agent(ticker, combined_news_text, weight)
        analyzed_stocks.append(result)

    # 3. Presenter Phase
    return presenter_agent(analyzed_stocks, combined_news_text)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)