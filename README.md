# DCLR Photoshoot Application

A web application for capturing and uploading photos with robust queue processing.

## Features

- Photo capture and management
- Reliable upload queue with retry capability
- Fault-tolerant file processing
- Robust error handling

## Technical Architecture

### Upload Queue System

The application uses Bull.js for managing a robust upload queue:

- **Reliable Processing**: Each upload is processed as a job with configurable retry logic
- **Exponential Backoff**: Failed uploads are retried with increasing delays
- **Concurrent Processing**: Multiple uploads can be processed simultaneously
- **Persistent Queue**: Jobs remain in queue even if server restarts
- **Monitoring**: Comprehensive logging of job statuses

### Prerequisites

- Node.js (v16+)
- Redis server (for Bull.js queue)
- Camera hardware (for photo capture)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dclr-photoboot.git
   cd dclr-photoboot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the application:
   ```
   cp .env.example .env
   ```
   Edit `.env` with your specific configuration.

4. Start Redis server:
   ```
   redis-server
   ```

5. Run the application:
   ```
   npm run dev
   ```

## Queue Configuration

The upload queue system can be configured via environment variables:

- `REDIS_URL`: Connection URL for the Redis server
- `UPLOAD_MAX_RETRIES`: Maximum retry attempts for failed uploads (default: 5)
- `UPLOAD_RETRY_DELAY`: Base delay in ms between retries (default: 5000)
- `UPLOAD_CONCURRENCY`: Maximum concurrent uploads (default: 5)

## API Endpoints

- `POST /api/photos/take/:id`: Capture a photo and queue for upload
- `POST /api/photos/upload`: Upload all pending photos

## Development

### Architecture Overview

The upload queue system consists of:

- `queue.ts`: Core queue implementation with Bull.js
- `takePicture.ts`: Controller for capturing individual photos
- `uploadPictures.ts`: Controller for bulk uploading photos

### Best Practices

- All uploads are queued for reliable processing
- Failed uploads are automatically retried with exponential backoff
- File cleanup happens automatically after successful upload or final failure
- Comprehensive error handling at all levels
- Detailed logging for monitoring and debugging

## License

[MIT License](LICENSE)

## ENV PROD

API_HOST=https://dclr-api.digitalcreativelab.id
API_KEY=1edd8a8400dc9fb35cfa47cda191238e63927fe80072657b4eb3e1206d7dd459

## ENV (TEMP ONLY)
NEXT_PUBLIC_REMOTE_SERVER=https://reka-api-dev.service.beta-point.ranggaa.me

API_URL=https://reka-api-dev.service.beta-point.ranggaa.me
API_KEY=sHCEtVx2mVXIa6ZUkigfd

transform: `translate(${(width - height) / 2}px, ${(height - width) / 2}px) rotate(90deg)`
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker and GitHub Container Registry

This project includes a Dockerfile and GitHub Actions workflow to build and push the Docker image to GitHub Container Registry.

### Building the Docker Image Locally

To build the Docker image locally:

```bash
docker build -t dclr-photoboot .
```

To run the Docker image locally:

```bash
docker run -p 3000:3000 dclr-photoboot
```

### GitHub Actions Workflow

The GitHub Actions workflow will automatically build and push the Docker image to GitHub Container Registry when:

1. You push to the `main` branch
2. You create a pull request to the `main` branch
3. You manually trigger the workflow

The Docker image will be available at `ghcr.io/[your-username]/dclr-photoboot`.

### Pulling the Docker Image

To pull the Docker image from GitHub Container Registry:

```bash
docker pull ghcr.io/[your-username]/dclr-photoboot:latest
```

Replace `[your-username]` with your GitHub username.

### Required GitHub Permissions

The GitHub Actions workflow requires the following permissions:
- `contents: read` - To read the repository contents
- `packages: write` - To push the Docker image to GitHub Container Registry

These permissions are already configured in the workflow file.
