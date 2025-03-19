# Use a base image that supports gphoto2
FROM node:20-bullseye AS base

# Install gphoto2 and its dependencies
RUN apt-get update && apt-get install -y \
  gphoto2 \
  libgphoto2-dev \
  libusb-1.0-0-dev \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# First copy all files except node_modules
COPY . .

# Then copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Build Next.js app
RUN npm run build

# Production image, copy all the files and run the server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Set the correct permission for prerender cache
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs && \
  mkdir .next && \
  chown nextjs:nodejs .next

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Use standalone output if available, otherwise use the regular .next directory
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"] 