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
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install production dependencies including Vite
RUN npm install --production && \
    npm install vite 


# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4173

ENV HOST=0.0.0.0

# Start the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"] 