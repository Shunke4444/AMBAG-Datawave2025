# Root Dockerfile for Render deployment (Backend)
FROM python:3.11-slim

WORKDIR /app

# Copy backend requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Ensure ambag-auth.json is at /app/ambag-auth.json
COPY backend/app/ambag-auth.json ./ambag-auth.json

# Expose port
EXPOSE 8000

# Start the application
 CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
