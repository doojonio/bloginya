# Stage 1: Build the application
FROM node:lts-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build --prod

# Stage 2: Create the production image
FROM node:lts-alpine
WORKDIR /app

# Only copy the built application from the build stage
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/package*.json ./

# Install only production dependencies
# RUN npm ci --only=production

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/front/server/server.mjs"]