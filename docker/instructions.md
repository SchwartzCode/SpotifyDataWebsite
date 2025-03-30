# Spotify Data Explorer

A web application to analyze and visualize Spotify listening data from downloaded personal data archives.

## Docker Setup

This project is containerized with Docker, combining both the React frontend and the Python Flask backend in a single container.

### Prerequisites

- Docker
- Docker Compose

### Running Locally with Docker

1. Build and start the container:

```bash
docker-compose up --build
```

2. Access the application at `http://localhost:5000`

### Building the Docker Image Manually

If you prefer to build and run without docker-compose:

```bash
# Build the Docker image
docker build -t spotify-data-explorer .

# Run the container
docker run -p 5000:5000 spotify-data-explorer
```

## Deploying to AWS

### Option 1: AWS Elastic Container Service (ECS)

1. Create an ECR repository:

```bash
aws ecr create-repository --repository-name spotify-data-explorer
```

2. Authenticate Docker to your ECR repository:

```bash
aws ecr get-login-password --region  | docker login --username AWS --password-stdin .dkr.ecr..amazonaws.com
```

3. Tag your image:

```bash
docker tag spotify-data-explorer:latest .dkr.ecr..amazonaws.com/spotify-data-explorer:latest
```

4. Push the image to ECR:

```bash
docker push .dkr.ecr..amazonaws.com/spotify-data-explorer:latest
```

5. Create an ECS cluster (if you don't have one already), task definition, and service through the AWS Console or using the AWS CLI.

### Option 2: AWS Elastic Beanstalk

1. Install the EB CLI:

```bash
pip install awsebcli
```

2. Initialize your Elastic Beanstalk application:

```bash
eb init -p docker spotify-data-explorer
```

3. Create an environment and deploy:

```bash
eb create spotify-data-explorer-env
```

4. Open the application:

```bash
eb open
```

### Option 3: AWS App Runner

1. Push your Docker image to ECR (follow steps 1-4 from ECS deployment).

2. Go to AWS App Runner console and create a new service.

3. Select "Container registry" as the source and connect to your ECR repository.

4. Configure the service settings (you can use the default values for most settings).

5. Click "Create & deploy" to launch your application.

## Development

### Local Development without Docker

To run the application locally without Docker:

1. Start the backend:

```bash
python app.py
```

2. Start the frontend:

```bash
cd frontend
npm run dev
```

3. Access the frontend at `http://localhost:3000`

## Troubleshooting

- If you encounter issues with file uploads, ensure the `uploads` and `extracted` directories have proper permissions.
- For deployment problems, check the AWS service logs for detailed information.