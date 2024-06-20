# FROM ivangabriele/tauri:debian-bullseye-18

# # Set the working directory
# WORKDIR /app

# # Copy the project files
# COPY . .

# # Install necessary system dependencies
# RUN apt-get update && apt-get install -y \
#     libwebkit2gtk-4.0-dev \
#     libgtk-3-dev \
#     libsoup2.4-dev \
#     libjavascriptcoregtk-4.0-dev \
#     build-essential \
#     xvfb \
#     x11-xserver-utils \
#     curl

# # Install npm dependencies (if needed)
# RUN npm install && \
#     npm install -g yarn corepack && \
#     cargo install tauri-cli --version "^1.0.0-beta.X"

# # Expose the development port
# EXPOSE 3000

# # Default command for the container
# CMD ["cargo", "tauri", "dev"]
FROM node:lst