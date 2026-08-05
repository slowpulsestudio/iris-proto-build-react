# Stage 1: Build static Storybook
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build-storybook

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/Storybook/dist /usr/share/nginx/html
COPY Storybook/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
