# First Stage: Install Dependencies
FROM node:21-alpine AS base
WORKDIR /var/app
COPY . .
RUN echo "VITE_LIQUID_HOST=__liquid_host__" > ./.env.production
RUN echo "VITE_LIQUID_CLIENT_ID=__liquid_client_id__" >> ./.env.production
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=base /var/app/dist /usr/share/nginx/html
COPY ["startup.sh", "/docker-entrypoint.d/startup.sh"]
RUN sed -i 's/\r$//' /docker-entrypoint.d/startup.sh  && \  
    chmod +x /docker-entrypoint.d/startup.sh
EXPOSE 80
EXPOSE 443