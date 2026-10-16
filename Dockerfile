# 短網址：Next.js＋Prisma（PostgreSQL）。跟 Zeabur 上一樣用 Node 22、pnpm 10、`pnpm start`，聽 PORT（8080）。
# 建置時不需要資料庫；啟動時 layout 會檢查 links 表，沒有才建（有資料就不動）。
# GeoIP：不帶 MAXMIND_LICENSE_KEY 建置時用 geoip-lite 套件內附的資料庫（金鑰不放進映像的建置參數）。
FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/* \
  && npm install -g pnpm@10.30.3
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/* \
  && npm install -g pnpm@10.30.3
WORKDIR /app
COPY --from=build /app ./
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080
EXPOSE 8080
CMD ["pnpm", "start"]
