# Dockerfile for Hardhat Network
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock for dependency installation
COPY ./package.json .
COPY ./yarn.lock .

# Install dependencies using Yarn
RUN yarn install

# Copy Hardhat configuration and environment files
COPY ./local.hardhat.config.ts .

# Expose ports
EXPOSE 8555

# start blockchain
ENTRYPOINT ["bash", "-c", "yarn localhost --port 8555"]