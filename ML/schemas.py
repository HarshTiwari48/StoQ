from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List

class IncomingNews(BaseModel):
    title: str = Field(alias="title")
    description: str
    source: str
    date: datetime = Field(alias="date")

    
    model_config = ConfigDict(populate_by_name=True)

class StockMetrics(BaseModel):
    rsi: float
    macd: float
    sentiment: float

class ProcessedStock(BaseModel):
    ticker: str
    signal: str
    confidence_score: float
    reasoning: str
    data: StockMetrics

class DomainGroup(BaseModel):
    domain: str
    stocks: List[ProcessedStock]

class FinalReport(BaseModel):
    status: str
    analyzed_news: str
    impacted_domains: List[DomainGroup]

class BatchArticleResult(BaseModel):
    article_id: int
    source: str
    news_text: str
    ai_analysis: FinalReport