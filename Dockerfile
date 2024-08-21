FROM node:22-alpine
WORKDIR /shinysocks.net
COPY . .
RUN npm i

CMD ["npm", "start"]
