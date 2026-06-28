# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm --filter @yancao/admin-web typecheck \
  && pnpm --filter @yancao/admin-web exec vite build --base=/admin/

RUN pnpm --filter @yancao/screen-web typecheck \
  && pnpm --filter @yancao/screen-web exec vite build --base=/screen/

FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/admin-web/dist /usr/share/nginx/html/admin
COPY --from=builder /app/apps/screen-web/dist /usr/share/nginx/html/screen

EXPOSE 80
