FROM node:9
WORKDIR /msf
COPY . /msf
#COPY entrypoint.sh /usr/local/bin/
EXPOSE 3000/tcp
EXPOSE 3001/tcp
RUN npm install
RUN yarn install --force
#ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start"]

