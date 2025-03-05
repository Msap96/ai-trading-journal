from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import json
import os

app = FastAPI(title="AI Trading Journal API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class MarketCondition(BaseModel):
    name: str
    description: Optional[str] = None

class TradeEntry(BaseModel):
    entry_date: datetime
    symbol: str
    entry_price: float
    exit_price: float
    position_size: float
    trade_type: str  # 'long' or 'short'
    market_conditions: List[str]
    notes: str
    chart_images: List[str]  # URLs to stored images
    
    @property
    def profit_loss(self) -> float:
        multiplier = 1 if self.trade_type == 'long' else -1
        return multiplier * (self.exit_price - self.entry_price) * self.position_size

class TradeAnalysis(BaseModel):
    win_rate: float
    profit_factor: float
    average_win: float
    average_loss: float
    best_conditions: List[str]
    pattern_insights: List[str]

# In-memory storage (replace with database in production)
trades: List[TradeEntry] = []
market_conditions: List[MarketCondition] = []

# Routes
@app.get("/")
async def root():
    return {"message": "AI Trading Journal API"}

@app.post("/trades/")
async def create_trade(trade: TradeEntry):
    trades.append(trade)
    return trade

@app.get("/trades/", response_model=List[TradeEntry])
async def get_trades():
    return trades

@app.post("/market-conditions/")
async def create_market_condition(condition: MarketCondition):
    market_conditions.append(condition)
    return condition

@app.get("/market-conditions/", response_model=List[MarketCondition])
async def get_market_conditions():
    return market_conditions

@app.post("/trades/{trade_id}/images")
async def upload_chart_image(trade_id: int, file: UploadFile = File(...)):
    # TODO: Implement image upload logic
    return {"filename": file.filename}

@app.get("/analysis/performance")
async def analyze_performance() -> TradeAnalysis:
    if not trades:
        raise HTTPException(status_code=404, detail="No trades found")
    
    # Calculate basic metrics
    winning_trades = [t for t in trades if t.profit_loss > 0]
    win_rate = len(winning_trades) / len(trades)
    
    profits = [t.profit_loss for t in trades if t.profit_loss > 0]
    losses = [abs(t.profit_loss) for t in trades if t.profit_loss < 0]
    
    avg_win = np.mean(profits) if profits else 0
    avg_loss = np.mean(losses) if losses else 0
    profit_factor = sum(profits) / abs(sum(losses)) if losses else float('inf')
    
    # Analyze market conditions
    condition_performance = {}
    for trade in trades:
        for condition in trade.market_conditions:
            if condition not in condition_performance:
                condition_performance[condition] = []
            condition_performance[condition].append(trade.profit_loss > 0)
    
    best_conditions = sorted(
        condition_performance.items(),
        key=lambda x: sum(x[1]) / len(x[1]),
        reverse=True
    )[:3]
    
    return TradeAnalysis(
        win_rate=win_rate,
        profit_factor=profit_factor,
        average_win=avg_win,
        average_loss=avg_loss,
        best_conditions=[c[0] for c in best_conditions],
        pattern_insights=[
            f"Best win rate in {c[0]}: {sum(c[1])/len(c[1])*100:.1f}%"
            for c in best_conditions
        ]
    )

@app.get("/analysis/patterns")
async def analyze_patterns():
    if len(trades) < 10:
        raise HTTPException(
            status_code=400,
            detail="Need at least 10 trades for pattern analysis"
        )
    
    # Extract features from trades
    features = []
    labels = []
    
    for trade in trades:
        # Convert market conditions to binary features
        condition_features = [
            1 if cond in trade.market_conditions else 0
            for cond in set().union(*[t.market_conditions for t in trades])
        ]
        
        features.append([
            float(trade.trade_type == 'long'),
            trade.position_size,
            *condition_features
        ])
        
        labels.append(1 if trade.profit_loss > 0 else 0)
    
    # Train a simple classifier
    clf = RandomForestClassifier(n_estimators=50)
    clf.fit(features, labels)
    
    # Get feature importance
    feature_names = ['trade_type', 'position_size'] + list(set().union(*[t.market_conditions for t in trades]))
    importance = sorted(zip(feature_names, clf.feature_importances_), key=lambda x: x[1], reverse=True)
    
    return {
        "important_factors": [
            {"factor": name, "importance": float(score)}
            for name, score in importance[:5]
        ],
        "success_patterns": [
            f"High correlation between {importance[i][0]} and profitable trades"
            for i in range(min(3, len(importance)))
        ]
    }