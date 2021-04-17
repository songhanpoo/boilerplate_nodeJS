FROM node:14.10.1-alpine3.10 AS base
# ENV http_proxy 
# ENV https_proxy 

WORKDIR /app
# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS code-dev
RUN apk add --no-cache curl busybox-extras
CMD ["npm", "start"]

# Stage for run start
FROM base AS builder
RUN npm build

# Stage for run build
FROM nginx:1.16.0-alpine as code-prod
RUN rm  /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 3030
CMD ["nginx","-g","daemon off;"]
