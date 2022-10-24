# Pull the official base image
FROM node:12-alpine

# Set working directory
WORKDIR /client

# Add `/client/node_modules/.bin` to $PATH
ENV PATH /client/node_modules/.bin:$PATH

# Install application dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm i

# Add app
COPY . ./

# Start app
CMD ["npm", "start"]