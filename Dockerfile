FROM node:16
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "node" ,"index.js" ]FROM node:16.14.0

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["node", "index.js"]
