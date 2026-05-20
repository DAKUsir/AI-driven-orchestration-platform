#!/bin/bash
# This script runs from backend_ai_code/ (caller does: cd backend_ai_code && bash start.sh)

echo "==> Starting FastAPI AI service on port 8000..."
python3 ai-service/main.py &

echo "==> Starting Node.js server..."
node src/server.js
