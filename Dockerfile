# Build stage runs on the builder's native arch ($BUILDPLATFORM) — the output is
# static files, so only the final nginx stage needs to match --platform.
FROM --platform=$BUILDPLATFORM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build:staging

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
