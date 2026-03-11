# Stage 1: Build Stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
# Copy package files and install ALL dependencies (including dev tools like typescript)
COPY package*.json ./
RUN npm ci
# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production Stage
FROM node:20-alpine
WORKDIR /usr/src/app
# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev
# Copy the compiled output from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
# We also need to copy the .env if it exists, but typically it is handled via compose/render
EXPOSE 5001
CMD [ "npm", "start" ]