FROM node:20-alpine

# Install native compilation dependencies
RUN apk add --no-libc-check --no-cache python3 make g++ libatomic

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
