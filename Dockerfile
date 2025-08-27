# Use Node.js 20 LTS
FROM node:20-alpine

# Force rebuild - Supabase disabled
ENV REBUILD_DATE=2024-08-27-v2

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Set environment variables with defaults to prevent build errors
ENV NODE_ENV=production
ENV PORT=3000
ENV EMAIL_SERVICE=disabled

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]