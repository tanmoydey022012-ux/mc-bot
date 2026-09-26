FROM node:24-alpine

# Install C++ native build tools
RUN apk add --no-cache python3 make g++ libatomic

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
