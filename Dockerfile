# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy necessary files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install

# Copy entire app source
COPY . .

# Build the app
RUN npm run build

# Set environment
ENV NODE_ENV=production

# Expose the port Next.js uses
EXPOSE 3000

# Start the app
CMD ["npm", "start"]