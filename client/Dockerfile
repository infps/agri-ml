FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json ./

FROM base AS deps
RUN bun install

FROM base AS build-deps
RUN bun install

FROM build-deps AS build
COPY . .
RUN bun run build

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

CMD ["bun", "start"]