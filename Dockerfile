FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Download 5etools data at build time
RUN node src/loaders/loadData.js

EXPOSE 4000

CMD ["node", "src/server.js"]
