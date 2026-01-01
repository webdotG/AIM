FROM node:21-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Тестовая БД
RUN npm run db:test:setup

# Запуск тестов
CMD ["npm", "test"]

# docker build -t dream-journal-tests .
# docker run --rm dream-journal-tests