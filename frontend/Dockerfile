# --- STAGE 1: Build the React Application ---
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# --- STAGE 2: Serve the Application with Nginx ---
# Start fresh with a new, lightweight Nginx image
FROM nginx:stable-alpine

# Copy only the built static files from the 'build' stage to the Nginx web root
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copying the custom Nginx config for SPAs
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# The default command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]