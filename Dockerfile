# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all files
COPY . .

# The port is set by Railway
EXPOSE ${PORT:-3000}

# Start the application
CMD ["node", "src/server.js"]