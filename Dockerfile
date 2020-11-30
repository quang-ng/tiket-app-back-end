FROM node:13-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=dev
RUN npm install

# dev
CMD ["npm", "run", "dev"]

# Production
# RUN npm install -g pm2
# CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]