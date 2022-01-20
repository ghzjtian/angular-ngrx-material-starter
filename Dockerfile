#stage 1
FROM node:14.18-alpine as node
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

#stage 2
FROM nginx:alpine
COPY ./nginx /etc/nginx
COPY --from=node /app/dist/angular-ngrx-material-starter /usr/share/nginx/html

# [References](https://medium.com/codex/dockerize-angular-application-69e7503d1816)
## Usage:

### Build
####  docker build -t glb/angular-ngrx-material-starter:latest .

### Run
#### 停止运行后会自动删除 container
####  docker run --rm -p 4200:80 --name angular-ngrx-material-starter glb/angular-ngrx-material-starter:latest
#### 停止运行后会保留 container
####  docker run -dp 4200:80 --name angular-ngrx-material-starter glb/angular-ngrx-material-starter:latest
#### docker ps
#### docker exec -it [docker container id] /bin/sh 
#### cd /usr/share/nginx/html/
