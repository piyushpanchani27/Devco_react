FROM node:20-slim

RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .

RUN npx tsc -p server/tsconfig.server.json
RUN mkdir -p server/dist/hls

# Port is managed by Railway; EXPOSE is informational
EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get(`http://localhost:${process.env.PORT}/health`, r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server/dist/server.js"]
