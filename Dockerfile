FROM node:16

# Create app directory
WORKDIR /usr/src/app

RUN apt-get update || : && apt-get install python -y
RUN apt-get install ffmpeg -y

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./

RUN npm install --production

# Bundle app source
COPY dist ./

# Start me!
CMD node app.js