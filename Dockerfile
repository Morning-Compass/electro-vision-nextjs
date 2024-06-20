# Use the official Rust image
FROM rust:latest

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

# Install necessary dependencies for Tauri and Xvfb
RUN apt-get update && \
    apt-get install -y \
    libwebkit2gtk-4.0-dev \
    libgtk-3-dev \
    libsoup2.4-dev \
    libjavascriptcoregtk-4.0-dev \
    build-essential \
    xvfb \
    x11-xserver-utils \
    curl

# Set the working directory
WORKDIR /app

# Copy the project files
COPY . .

# Install npm dependencies
RUN npm install

# Install Tauri CLI globally
RUN cargo install tauri-cli

# Expose the development port
EXPOSE 3000

# Run the development server with Xvfb
CMD ["sh", "-c", "CARGO_TARGET_DIR=/app/target xvfb-run -s '-screen 0 1024x768x24' cargo tauri dev"]
