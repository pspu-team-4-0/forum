FROM node:20-alpine as base

WORKDIR /app

COPY . .

RUN npm install
RUN npm install -g typescript

RUN npm run build

FROM base AS final

WORKDIR /app

COPY --from=base /app/build ./
COPY --from=base /app/node_modules ./

CMD ["npm", "start"]