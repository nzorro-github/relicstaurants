FROM node:bullseye-slim

RUN apt-get update && apt-get install -y \
    curl \
    dnsutils

WORKDIR /app

COPY . .
RUN npm install && npm run build
RUN cd checkoutService && npm install

RUN cd menuService && npm install 

RUN cd restaurantService && npm install

RUN npm install --global serve
RUN chown -R 1001:1001 /app
USER 1001

# run:
CMD ["serve", "-s", "build"]


