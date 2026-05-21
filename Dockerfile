FROM node:26-alpine AS base

RUN corepack enable

WORKDIR /app


FROM base AS build

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


FROM base AS production

ENV NODE_ENV=production

COPY --from=build /app/.output /app
COPY --from=build /app/server/db/migrations /app/server/db/migrations

EXPOSE 3000/tcp

ENTRYPOINT [ "pnpm", "run", "/app/server/index.mjs" ]
