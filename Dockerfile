# --- Builder stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies based on the lockfile if present
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; fi

# Copy the rest and build
ARG VITE_API_BASE=
ENV VITE_API_BASE=$VITE_API_BASE
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine AS runtime

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose and run
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]