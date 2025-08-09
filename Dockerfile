FROM node:22.0.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN cd checkoutService && npm install

RUN cd menuService && npm install

RUN cd restaurantService && npm install

# run:
CMD ["npx", "concurrently", "npm:checkoutService", "npm:menuService", "npm:restaurantService", "npm:start", "--kill-others"]


