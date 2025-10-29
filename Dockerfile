FROM node:20-alpine

# Install basic tools
RUN apk add --no-cache git

WORKDIR /app

# Copy package files
COPY package.json ./

# Clear npm cache and install with verbose logging
RUN npm cache clean --force && \
    npm install --verbose --loglevel=verbose || \
    (npm config set registry https://registry.npmjs.org/ && npm install --verbose)

# Copy project files
COPY . .

# Expose port for development server
EXPOSE 4321

# Default command for development
CMD ["npm", "run", "dev", "--", "--host"]
