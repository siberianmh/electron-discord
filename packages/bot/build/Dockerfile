FROM node:16-alpine AS deps

RUN apk add --no-cache libc6-compact
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:16-alpine AS builder
WORKDIR /app

COPY ./packages/bot ./packages/bot/
COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules
RUN yarn workspace @sib-edis/bot build

FROM node:16-alpine AS main
WORKDIR /app

ENV NODE_ENV produdction

RUN addgroup -g 1001 -S nodejs
RUN adduser -S edisbot -u 1001

COPY --from=builder /packages/bot/dist /app
COPY --from=builder /app/node_modules ./node_modules

USER edisbot

CMD ["node", "index.js"]
