FROM node
VOLUME [ "/morning-compass-nextjs" ]
WORKDIR /app
COPY . .
RUN npm install
CMD ["yarn", "dev"]
ENV PORT=3000
EXPOSE 3000