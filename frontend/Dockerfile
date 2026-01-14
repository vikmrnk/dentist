FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install; \
    else \
      npm install; \
    fi

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

