FROM node
VOLUME [ "/morning_compass" ]
WORKDIR /app
COPY . .
RUN npm install
CMD ["yarn", "dev"]
ENV PORT=3001
EXPOSE 3001