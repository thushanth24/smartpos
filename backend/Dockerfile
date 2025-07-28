# Use Node.js LTS
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY .sequelizerc ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Build the app (if needed)
# RUN npm run build

# Expose the app port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "src/server.js"]
