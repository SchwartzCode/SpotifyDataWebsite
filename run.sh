#!/bin/bash

# Color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if Docker is installed
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
  fi

  if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
  fi
}

# Function to build and start the container
start_docker() {
  echo -e "${BLUE}Building and starting the Docker container...${NC}"
  docker compose -f docker/docker-compose.yml up --build -d
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Docker container is running successfully!${NC}"
    echo -e "${GREEN}You can access the application at: http://localhost:5000${NC}"
  else
    echo -e "${RED}Failed to start Docker container. Please check the logs for more information.${NC}"
    exit 1
  fi
}

# Function to start development servers (frontend and backend separately)
start_dev() {
  echo -e "${BLUE}Starting development servers...${NC}"
  
  # Start backend server in background
  echo -e "${YELLOW}Starting Flask backend server...${NC}"
  python app.py &
  BACKEND_PID=$!
  
  # Check if backend started successfully
  sleep 2
  if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}Failed to start backend server. Please check the logs.${NC}"
    exit 1
  fi
  
  # Start frontend server
  echo -e "${YELLOW}Starting Next.js frontend server...${NC}"
  cd frontend && npm run dev &
  FRONTEND_PID=$!
  
  # Check if frontend started successfully
  sleep 5
  if ! ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${RED}Failed to start frontend server. Please check the logs.${NC}"
    kill $BACKEND_PID
    exit 1
  fi
  
  echo -e "${GREEN}Development servers started successfully!${NC}"
  echo -e "${GREEN}Frontend available at: http://localhost:3000${NC}"
  echo -e "${GREEN}Backend API available at: http://localhost:5000${NC}"
  
  echo -e "${YELLOW}Press Ctrl+C to stop both servers...${NC}"
  
  # Wait for user to press Ctrl+C
  trap "kill $BACKEND_PID $FRONTEND_PID; echo -e '${GREEN}Servers stopped.${NC}'; exit" INT
  wait
}

# Function to stop the Docker container
stop_docker() {
  echo -e "${BLUE}Stopping the Docker container...${NC}"
  docker compose -f docker/docker-compose.yml down
  echo -e "${GREEN}Docker container stopped.${NC}"
}

# Function to display usage
usage() {
  echo -e "${BLUE}Spotify Data Explorer - Execution Script${NC}"
  echo "Usage: $0 [option]"
  echo ""
  echo "Options:"
  echo "  start       Build and start the Docker container"
  echo "  stop        Stop the Docker container"
  echo "  dev         Start development servers (Flask and Next.js separately)"
  echo "  help        Display this help message"
}

# Main script
case "$1" in
  start)
    check_docker
    start_docker
    ;;
  stop)
    check_docker
    stop_docker
    ;;
  dev)
    start_dev
    ;;
  help|*)
    usage
    ;;
esac

exit 0