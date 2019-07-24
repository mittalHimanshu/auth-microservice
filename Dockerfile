FROM node
WORKDIR /
COPY package.json /
RUN npm install
COPY . /
CMD cd / && npm start
EXPOSE 3000