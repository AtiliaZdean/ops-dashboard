# builds React app and serves it with Nginx
# two stage build - first build the app, then serve it

# -- STAGE 1: Build --
# use Node to build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# copy package files first for better caching
COPY package*.json ./

# install dependencies
RUN npm install

# copy source code
COPY . .

# Pass API URL as build argument
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_UR

# build the production version of the React app
RUN npm run build

# ── STAGE 2: Serve ──
# use lightweight Nginx to serve the built files
FROM nginx:alpine

# copy built files from stage 1 into Nginx's serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Nginx starts automatically
