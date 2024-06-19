# FROM node
# VOLUME [ "/morning-compass-nextjs" ]
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN cargo install tauri-cli
# CMD "cargo tauri dev"
# ENV PORT=3000
# EXPOSE 3000
# Use the official Rust image
FROM rust
WORKDIR /app
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["cargo", "tauri", "dev"]