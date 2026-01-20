FROM node:18

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN rm -rf node_modules package-lock.json pnpm-lock.yaml && \
    npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

