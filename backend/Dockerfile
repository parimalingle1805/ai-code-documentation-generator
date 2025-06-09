FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Install dependencies using 'npm ci' which is optimized for CI/CD environments
RUN npm ci

# Copying remaining code into the container
COPY . .

EXPOSE 5001

CMD [ "npm", "start" ]