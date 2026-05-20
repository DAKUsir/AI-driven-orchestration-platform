#!/bin/bash
# Start FastAPI AI service in background
echo "==> Starting FastAPI AI service..."
cd ai-service && python3 main.py &
cd ..

# Start Node.js Express server (foreground — keeps container alive)
echo "==> Starting Node.js server..."
node src/server.js
