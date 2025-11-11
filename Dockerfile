# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock first to leverage caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build TypeScript
RUN yarn build

# Expose the API port
EXPOSE 5000

# Environment variable for production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/server.js"]
