FROM node

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build
RUN cd checkoutService && npm install

RUN cd menuService && npm install 

RUN cd restaurantService && npm install

RUN npm install --global serve
RUN chown -R 1001:1001 /app
USER 1001

# run:
CMD ["npx", "concurrently", "npm:checkoutService", "npm:menuService", "npm:restaurantService", "npm:start", "--kill-others"]


