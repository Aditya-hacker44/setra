FROM python:3.11-slim

WORKDIR /app

# System dependencies removed to keep backend ultra-lightweight

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . /app/backend

# Expose FastAPI port
EXPOSE 8000

# Run the FastAPI server via uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
