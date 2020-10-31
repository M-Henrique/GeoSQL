# GeoSQL


## Exposed ports

- Frontend: Nginx with port 3000
- Backend: Express.JS with port 3333

## Build with Docker

### Build Arguments

#### Frontend
- PUBLIC_URL: public url of the applications, this argument is needed for react change js source locations when bundling front.
- BASE_URL: base url used by react router if the application is under some route like http://www.example.com/geosql
- REACT_APP_API_URL: representes the backend public url, where axios can found the api

```
export VERSION=$(git log -n 1 --pretty=format:'%h')
docker-compose -f docker-compose.prod.yml build
```

## Running with Docker

### Docker Compose

In this case the environment variables should be set before running the containers. The user should also define the port mapping in case of not using a loadbalancer or container with a proxy like Nginx, Apache or HAProxy.

```
docker-compose -f docker-compose.prod.yml up
```

### Docker Swarm

In this case an extra loadbalancer needs to be configured before stating the services. This loadbalancer should expose the services with routes. For this they should share an external docker network called loadbalancer. Nginx, Apache and HAProxy can be used to do the job.

```
docker stack deploy -c stack.yml geosql
```


