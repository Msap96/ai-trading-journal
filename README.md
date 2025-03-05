# AI-Powered Trading Journal

A modern web application for traders to maintain their trading journal with AI-powered insights and pattern recognition.

## Features

- 📊 Trade Entry Logging with Market Snapshots
- 🖼️ Chart Image Attachment
- 🤖 AI-Powered Pattern Recognition
- 📈 Performance Analytics
- 🏷️ Smart Market Condition Tagging
- 📱 Responsive Web Interface

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- SQLAlchemy
- PostgreSQL
- scikit-learn for AI/ML

### Frontend
- React
- TypeScript
- TailwindCSS
- Chart.js

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/Msap96/ai-trading-journal.git
cd ai-trading-journal
```

2. Install backend dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Start the development servers
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Key Features

### 1. Trade Entry System
- Log trades with detailed market conditions
- Attach multiple chart images
- Add notes and observations
- Tag market conditions and patterns

### 2. AI Analysis
- Pattern recognition in successful trades
- Market condition correlation
- Performance analytics
- Win rate by condition

### 3. Performance Tracking
- Track win rate and profit/loss
- Analyze trade distribution
- Monitor performance by market condition
- Generate insights for improvement

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT