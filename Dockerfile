FROM node:22.0.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN make install

ENTRYPOINT ["make", "run"]