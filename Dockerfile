FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./
COPY ./node_modules ./node_modules

# Bundle app source
COPY dist ./

# Start me!
CMD node app.js