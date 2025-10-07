# Use Node.js 20 base image
FROM node:20-slim

# Install FFmpeg and other dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install --production=false

# Copy all source code
COPY . .

# Build TypeScript to JavaScript
RUN npx tsc -p server/tsconfig.server.json

# Create directory for HLS segments
RUN mkdir -p server/dist/hls

# Expose port (Railway will use its own PORT env variable)
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8082/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "server/dist/server.js"]