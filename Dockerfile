# Use the official Node.js image as the base image
FROM node:14

# Install Ganache CLI globally
RUN npm install -g ganache-cli

# Copy the entrypoint script into the container
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose the port Ganache will run on
EXPOSE 8544

# Set the entrypoint to the script
ENTRYPOINT ["entrypoint.sh"]