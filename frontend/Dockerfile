FROM node:22-slim

WORKDIR /app

# Copiamo prima solo i manifest
COPY package.json package-lock.json ./
RUN npm ci

# Il resto del codice verrà montato come volume da docker-compose (hot reload),
# ma lo copiamo comunque per poter avviare anche senza volume
COPY . .

EXPOSE 5173

# --host serve per rendere il dev server raggiungibile da fuori il container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
