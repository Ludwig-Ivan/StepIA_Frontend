# =========================
# Etapa 1: Build
# =========================
FROM node:22-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir aplicación Vite
RUN npm run build


# =========================
# Etapa 2: Producción
# =========================
FROM nginx:alpine

# Eliminar configuración default
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build generado por Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Puerto HTTP
EXPOSE 80

# Ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]