# Stage 1: Build frontend
FROM node:20-alpine AS build
WORKDIR /build
COPY app/package.json app/package-lock.json ./
RUN npm ci
COPY app/ ./
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built frontend
COPY --from=build /build/dist/ /var/www/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/conf.d/default.conf.bak

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3090/health || exit 1

EXPOSE 3090

CMD ["nginx", "-g", "daemon off;"]
