FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite development server
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]
