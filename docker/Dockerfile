FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY ../frontend/package.json ../frontend/package-lock.json ./

# Install frontend dependencies
RUN npm ci

# Copy all frontend files
COPY ../frontend/ ./

# Build the frontend application
RUN npm run build

# Verify app built
RUN find /app -type d -name "out" -o -name ".next"

# Backend stage
FROM python:3.11-slim AS backend

WORKDIR /app

# Copy Python requirements
COPY ../requirements.txt .

# Copy in demo data
COPY ../demo_data.zip .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN pwd && ls -la /app/

# Copy backend code
COPY ../app.py .
RUN mkdir -p uploads extracted

# Copy the built frontend from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/out /app/static

# Add a script to serve both backend and frontend
COPY ../start_backend.sh .
RUN chmod +x start_backend.sh

# Expose the port the app runs on
EXPOSE 5000

# Command to run
ENTRYPOINT ["./start_backend.sh"]