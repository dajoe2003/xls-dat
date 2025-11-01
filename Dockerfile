# Stage 1 — build
FROM node:18-alpine AS builder
WORKDIR /app

# copy package files first for better caching
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit --progress=false

COPY . .
# build the vite app (output: dist/)
RUN npm run build

# Stage 2 — serve with nginx
FROM nginx:alpine
# Hapus default html (opsional)
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config akan kita override dengan file bawaan
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
