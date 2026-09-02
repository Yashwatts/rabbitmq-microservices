FROM node:22.12.0-bookworm-slim AS development
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm ci -f
COPY --chown=node:node . .
USER node
CMD [ "npm", "run", "start:dev" ]

FROM node:22.12.0-bookworm-slim As build
WORKDIR /app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build
RUN npm ci -f --only=production && npm cache clean --force
USER node
CMD [ "node", "dist/main" ]

FROM node:22.12.0-bookworm-slim As production
ENV NODE_ENV production
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
CMD [ "node", "dist/main" ]