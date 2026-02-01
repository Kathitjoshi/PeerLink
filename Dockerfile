FROM node:18-alpine
WORKDIR /app
COPY . .
RUN cd backend && npm install
RUN cd frontend && npm install && npm run build
RUN cd backend && npm prune --production
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "backend/server.js"]
