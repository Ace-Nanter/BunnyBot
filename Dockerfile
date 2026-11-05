FROM node:24

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./

RUN npm install --production

# Bundle app source
COPY dist ./

# Start me!
CMD node app.js