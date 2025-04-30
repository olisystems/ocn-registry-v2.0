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
COPY ./helper-hardhat-config.ts .

# Copy contracts folder for contract interaction
COPY ./contracts ./contracts

# Create necessary directories for persistent blockchain storage. 
#TODO it still does not work in the minikube, if hardhat pod is deleted all blockchain state is gonna, and all smart contracts need to be deployed again. 
# Try again later or remove all related to pvn volume and /data/hardhat in this repo and transit-local-services repo
RUN mkdir -p /data/hardhat/chains

# Copy any deployment scripts if needed
COPY ./deploy ./deploy

# Expose ports
EXPOSE 8555

# start blockchain with persistent storage
ENTRYPOINT ["bash", "-c", "yarn hardhat node --config local.hardhat.config.ts --hostname 0.0.0.0 --port 8555"] 