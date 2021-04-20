FROM node:10

RUN mkdir /home/msf-ui

# Install server
WORKDIR /home/msf-ui

# Install deps
COPY package.json /home/msf-ui
COPY package-lock.json /home/msf-ui
RUN npm i

# Build msf-ui
COPY . /home/msf-ui
RUN npm run postinstall
RUN npm run build

# Build server
RUN npm i express
CMD node staticServer.js
# CMD npm start