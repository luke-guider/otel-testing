# Build stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# # Add build arguments
# ARG VITE_FARO_API_KEY
# ENV VITE_FARO_API_KEY=${VITE_FARO_API_KEY}

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 